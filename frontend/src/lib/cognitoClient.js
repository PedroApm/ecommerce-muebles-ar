import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
});

export function registerUser(email, password, givenName, familyName) {
  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'given_name', Value: givenName }),
    new CognitoUserAttribute({ Name: 'family_name', Value: familyName }),
  ];
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function confirmRegistration(email, code) {
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function loginUser(email, password) {
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) =>
        resolve({
          idToken: result.getIdToken().getJwtToken(),
          accessToken: result.getAccessToken().getJwtToken(),
        }),
      onFailure: reject,
    });
  });
}

export function logoutUser() {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) currentUser.signOut();
}

export function changePassword(oldPassword, newPassword) {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No hay sesión activa'));
      return;
    }
    cognitoUser.getSession((sessionErr) => {
      if (sessionErr) {
        reject(sessionErr);
        return;
      }
      cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  });
}
