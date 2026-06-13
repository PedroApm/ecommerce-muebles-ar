const db = require('../../lib/db');
const { getUserIdBySub, isAdmin } = require('../../lib/auth');

const HEADERS = { 'Content-Type': 'application/json' };

module.exports.handler = async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;

  if (!isAdmin(claims)) {
    return {
      statusCode: 403,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Acceso denegado' }),
    };
  }

  const productId = event.pathParameters.id;
  const sub = claims.sub;

  try {
    const adminUserId = await getUserIdBySub(sub);
    if (adminUserId === null) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Usuario admin no encontrado en el sistema' }),
      };
    }

    const updateResult = await db.query(
      `UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = $1`,
      [productId]
    );

    if (updateResult.rowCount === 0) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Producto no encontrado' }),
      };
    }

    await db.query(
      `INSERT INTO admin_actions (admin_user_id, action_type, entity_type, entity_id, details)
       VALUES ($1, 'delete', 'product', $2, '{}')`,
      [adminUserId, productId]
    );

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Producto marcado como inactivo' }),
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Error interno al eliminar el producto' }),
    };
  }
};
