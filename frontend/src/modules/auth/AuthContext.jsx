import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, registerUser, confirmRegistration, changePassword as cognitoChangePassword } from '@/lib/cognitoClient';

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
}

function buildUser(claims) {
  return {
    email: claims.email,
    given_name: claims.given_name,
    family_name: claims.family_name,
    sub: claims.sub,
    groups: claims['cognito:groups'] || [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const idToken = localStorage.getItem('idToken');
      const accessToken = localStorage.getItem('accessToken');
      if (idToken && accessToken) {
        setUser(buildUser(decodeJwtPayload(idToken)));
      }
    } catch {
      // Token malformado, ignorar
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const { idToken, accessToken } = await loginUser(email, password);
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('accessToken', accessToken);
    setUser(buildUser(decodeJwtPayload(idToken)));
  }

  function logout() {
    logoutUser();
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    setUser(null);
  }

  function register(email, password, givenName, familyName) {
    return registerUser(email, password, givenName, familyName);
  }

  function confirmRegister(email, code) {
    return confirmRegistration(email, code);
  }

  function changePassword(oldPassword, newPassword) {
    return cognitoChangePassword(oldPassword, newPassword);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, confirmRegister, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
