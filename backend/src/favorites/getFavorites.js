const db = require('../lib/db');
const { getUserIdBySub } = require('../lib/auth');

const SQL = `
  SELECT
    f.id AS favorite_id,
    p.id,
    p.name,
    p.price,
    c.name AS category_name,
    (
      SELECT pi.url
      FROM product_images pi
      WHERE pi.product_id = p.id AND pi.is_primary = true
      LIMIT 1
    ) AS image_url
  FROM favorites f
  JOIN products p ON f.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  WHERE f.user_id = $1
`;

module.exports.handler = async (event) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub;
  try {
    const userId = await getUserIdBySub(sub);
    if (userId === null) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Usuario no encontrado en el sistema' }),
      };
    }
    const result = await db.query(SQL, [userId]);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al obtener los favoritos' }),
    };
  }
};
