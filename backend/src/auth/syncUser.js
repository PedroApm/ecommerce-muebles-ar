const db = require('../lib/db');
const { addUserToCustomerGroup } = require('../lib/cognitoAdmin');

module.exports.handler = async (event) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub;
  const { email, given_name, family_name } = JSON.parse(event.body || '{}');

  try {
    const existing = await db.query(
      'SELECT id FROM users WHERE cognito_id = $1',
      [sub]
    );

    if (existing.rows.length === 0) {
      await db.query(
        'INSERT INTO users (cognito_id, email, first_name, last_name) VALUES ($1, $2, $3, $4)',
        [sub, email, given_name, family_name]
      );

      try {
        await addUserToCustomerGroup(sub);
      } catch (cognitoErr) {
        console.error('Error adding user to customer group:', cognitoErr);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Usuario sincronizado' }),
    };
  } catch (error) {
    console.error('Error syncing user:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al sincronizar el usuario' }),
    };
  }
};
