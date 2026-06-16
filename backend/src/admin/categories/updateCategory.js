const db = require('../../lib/db');
const { getUserIdBySub, isAdmin } = require('../../lib/auth');

const HEADERS = { 'Content-Type': 'application/json' };

const ALLOWED_FIELDS = ['name', 'description', 'sort_order', 'is_active'];

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

  const fieldsToUpdate = ALLOWED_FIELDS.filter((f) => f in body);

  if (fieldsToUpdate.length === 0) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ message: 'No se enviaron campos para actualizar' }),
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

    if ('name' in body) {
      const existing = await db.query(
        `SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2`,
        [body.name, categoryId]
      );
      if (existing.rows.length > 0) {
        return {
          statusCode: 409,
          headers: HEADERS,
          body: JSON.stringify({ message: 'Ya existe una categoría con ese nombre' }),
        };
      }
    }

    const setClauses = fieldsToUpdate.map((f, i) => `${f} = $${i + 1}`);
    setClauses.push(`updated_at = NOW()`);
    const values = fieldsToUpdate.map((f) => body[f]);
    values.push(categoryId);

    const updateResult = await db.query(
      `UPDATE categories SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );

    if (updateResult.rowCount === 0) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Categoría no encontrada' }),
      };
    }

    const updatedFields = {};
    fieldsToUpdate.forEach((f) => { updatedFields[f] = body[f]; });

    await db.query(
      `INSERT INTO admin_actions (admin_user_id, action_type, entity_type, entity_id, details)
       VALUES ($1, 'update', 'category', $2, $3)`,
      [adminUserId, categoryId, JSON.stringify(updatedFields)]
    );

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Categoría actualizada' }),
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Error interno al actualizar la categoría' }),
    };
  }
};
