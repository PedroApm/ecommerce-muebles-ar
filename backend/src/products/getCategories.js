const db = require('../lib/db');

const SQL = `
  SELECT id, name, description, sort_order, is_active
  FROM categories
  WHERE is_active = true
  ORDER BY sort_order
`;

module.exports.handler = async (event) => {
  try {
    const result = await db.query(SQL);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al obtener las categorías' }),
    };
  }
};
