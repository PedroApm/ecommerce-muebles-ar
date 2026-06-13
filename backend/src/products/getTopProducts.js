const db = require('../lib/db');

const SQL = `
  SELECT
    p.id,
    p.name,
    p.price,
    p.category_id,
    c.name AS category_name,
    (
      SELECT pi.url
      FROM product_images pi
      WHERE pi.product_id = p.id AND pi.is_primary = true
      LIMIT 1
    ) AS image_url,
    p.view_count
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.status = 'active'
  ORDER BY p.view_count DESC
  LIMIT 4
`;

module.exports.handler = async () => {
  try {
    const result = await db.query(SQL);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Error fetching top products:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al obtener los productos más vistos' }),
    };
  }
};
