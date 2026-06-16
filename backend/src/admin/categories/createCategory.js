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

  const sub = claims.sub;

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Body JSON inválido' }),
    };
  }

  const { name, description, sort_order = 0 } = body;

  if (!name) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ message: 'El campo name es obligatorio' }),
    };
  }

  try {
    const adminUserId = await getUserIdBySub(sub);
    if (adminUserId === null) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Usuario admin no encontrado en el sistema' }),
      };
    }

    const existing = await db.query(
      `SELECT id FROM categories WHERE LOWER(name) = LOWER($1)`,
      [name]
    );
    if (existing.rows.length > 0) {
      return {
        statusCode: 409,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Ya existe una categoría con ese nombre' }),
      };
    }

    const insertResult = await db.query(
      `INSERT INTO categories (name, description, sort_order, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id`,
      [name, description, sort_order]
    );

    const newCategoryId = insertResult.rows[0].id;

    await db.query(
      `INSERT INTO admin_actions (admin_user_id, action_type, entity_type, entity_id, details)
       VALUES ($1, 'create', 'category', $2, $3)`,
      [adminUserId, newCategoryId, JSON.stringify(body)]
    );

    return {
      statusCode: 201,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Categoría creada', id: newCategoryId }),
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Error interno al crear la categoría' }),
    };
  }
};
