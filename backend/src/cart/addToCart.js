const db = require('../lib/db');
const { getUserIdBySub } = require('../lib/auth');

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

    const { product_id, variant_id = null, quantity = 1 } = JSON.parse(event.body || '{}');
    if (!product_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'product_id es requerido' }),
      };
    }

    const existing = await db.query(
      `SELECT id, quantity FROM cart_items
       WHERE user_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3`,
      [userId, product_id, variant_id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
        [quantity, existing.rows[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4)',
        [userId, product_id, variant_id, quantity]
      );
    }

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Producto agregado al carrito' }),
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al agregar al carrito' }),
    };
  }
};
