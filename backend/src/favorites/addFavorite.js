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

    const { product_id } = JSON.parse(event.body || '{}');
    if (!product_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'product_id es requerido' }),
      };
    }

    await db.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING',
      [userId, product_id]
    );

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Producto agregado a favoritos' }),
    };
  } catch (error) {
    console.error('Error adding favorite:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al agregar el favorito' }),
    };
  }
};
