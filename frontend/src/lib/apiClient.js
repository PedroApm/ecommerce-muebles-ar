import { userPool } from '@/lib/cognitoClient';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) { reject(new Error('No session')); return; }
    cognitoUser.getSession((err, session) => {
      if (err || !session?.isValid()) { reject(err || new Error('Invalid session')); return; }
      const newToken = session.getAccessToken().getJwtToken();
      localStorage.setItem('accessToken', newToken);
      resolve(newToken);
    });
  });
}

function clearSessionAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
}

export async function apiFetch(path, options = {}) {
  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    try {
      const newToken = await refreshAccessToken();
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      const retryResponse = await fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders });
      if (!retryResponse.ok) {
        let message = `Error ${retryResponse.status}`;
        try { const d = await retryResponse.json(); message = d.message || message; } catch {}
        throw new Error(message);
      }
      return retryResponse.json();
    } catch {
      clearSessionAndRedirect();
      throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }
  }

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}
