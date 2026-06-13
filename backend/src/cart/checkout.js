const db = require('../lib/db');
const { getUserIdBySub } = require('../lib/auth');

const CART_SQL = `
  SELECT
    ci.product_id,
    ci.variant_id,
    ci.quantity,
    p.price,
    pv.price_modifier
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

    const { contact_name, contact_email, shipping_address } = JSON.parse(event.body || '{}');
    if (!contact_name || !contact_email || !shipping_address) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'contact_name, contact_email y shipping_address son requeridos' }),
      };
    }

    const cartResult = await db.query(CART_SQL, [userId]);
    if (cartResult.rows.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'El carrito está vacío' }),
      };
    }

    const items = cartResult.rows;
    const total_amount = items.reduce(
      (sum, item) =>
        sum + (Number(item.price) + Number(item.price_modifier || 0)) * item.quantity,
      0
    );

    const orderResult = await db.query(
      `INSERT INTO orders (user_id, status, contact_name, contact_email, shipping_address, total_amount)
       VALUES ($1, 'simulated', $2, $3, $4, $5)
       RETURNING id`,
      [userId, contact_name, contact_email, shipping_address, total_amount]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const unit_price = Number(item.price) + Number(item.price_modifier || 0);
      await db.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.variant_id, item.quantity, unit_price]
      );
    }

    await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Pedido confirmado',
        order_id: orderId,
        total_amount,
      }),
    };
  } catch (error) {
    console.error('Error processing checkout:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al procesar el pedido' }),
    };
  }
};
