const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

async function addUserToCustomerGroup(sub) {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: sub,
    GroupName: 'customer',
  });
  await client.send(command);
}

module.exports = { addUserToCustomerGroup };
