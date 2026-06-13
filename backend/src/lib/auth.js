const { query } = require('./db');

async function getUserIdBySub(cognitoSub) {
  const result = await query(
    'SELECT id FROM users WHERE cognito_id = $1',
    [cognitoSub]
  );
  return result.rows.length > 0 ? result.rows[0].id : null;
}

function isAdmin(claims) {
  return String(claims['cognito:groups'] || '').includes('admin');
}

module.exports = { getUserIdBySub, isAdmin };
