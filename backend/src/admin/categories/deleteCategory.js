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

  const categoryId = event.pathParameters.id;
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

    const productsResult = await db.query(
      `SELECT COUNT(*) FROM products WHERE category_id = $1`,
      [categoryId]
    );
    if (parseInt(productsResult.rows[0].count, 10) > 0) {
      return {
        statusCode: 409,
        headers: HEADERS,
        body: JSON.stringify({ message: 'No se puede eliminar: existen productos asociados a esta categoría' }),
      };
    }

    const updateResult = await db.query(
      `UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [categoryId]
    );

    if (updateResult.rowCount === 0) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Categoría no encontrada' }),
      };
    }

    await db.query(
      `INSERT INTO admin_actions (admin_user_id, action_type, entity_type, entity_id, details)
       VALUES ($1, 'delete', 'category', $2, '{}')`,
      [adminUserId, categoryId]
    );

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Categoría desactivada' }),
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Error interno al eliminar la categoría' }),
    };
  }
};
