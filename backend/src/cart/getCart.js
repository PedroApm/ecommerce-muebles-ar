const db = require('../lib/db');
const { getUserIdBySub } = require('../lib/auth');

const SQL = `
  SELECT
    ci.id,
    ci.product_id,
    p.name,
    (
      SELECT pi.url
      FROM product_images pi
      WHERE pi.product_id = p.id AND pi.is_primary = true
      LIMIT 1
    ) AS image_url,
    p.price AS base_price,
    ci.variant_id,
    pv.color AS variant_color,
    pv.size AS variant_size,
    pv.material AS variant_material,
    pv.price_modifier,
    ci.quantity,
    (p.price + COALESCE(pv.price_modifier, 0)) * ci.quantity AS subtotal
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  LEFT JOIN product_variants pv ON pv.id = ci.variant_id
  WHERE ci.user_id = $1
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
    console.error('Error fetching cart:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al obtener el carrito' }),
    };
  }
};
