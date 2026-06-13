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

    await db.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Ítem eliminado del carrito' }),
    };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al eliminar del carrito' }),
    };
  }
};
