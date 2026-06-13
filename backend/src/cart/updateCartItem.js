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

    const { itemId } = event.pathParameters;
    const { quantity } = JSON.parse(event.body || '{}');
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'quantity debe ser un número mayor a 0' }),
      };
    }

    const result = await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
      [quantity, itemId, userId]
    );

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Ítem de carrito no encontrado' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Carrito actualizado' }),
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al actualizar el carrito' }),
    };
  }
};
