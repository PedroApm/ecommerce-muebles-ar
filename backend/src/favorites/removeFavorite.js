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

    const { productId } = event.pathParameters;

    await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Producto eliminado de favoritos' }),
    };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al eliminar el favorito' }),
    };
  }
};
