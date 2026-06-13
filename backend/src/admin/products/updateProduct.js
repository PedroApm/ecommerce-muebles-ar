const db = require('../../lib/db');
const { getUserIdBySub, isAdmin } = require('../../lib/auth');

const HEADERS = { 'Content-Type': 'application/json' };

const ALLOWED_FIELDS = [
  'name', 'description', 'price', 'category_id',
  'width', 'height', 'depth', 'materials', 'style', 'stock', 'tags',
];

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

    const setClauses = fieldsToUpdate.map((f, i) => `${f} = $${i + 1}`);
    setClauses.push(`updated_at = NOW()`);
    const values = fieldsToUpdate.map((f) => body[f]);
    values.push(productId);

    const updateResult = await db.query(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );

    if (updateResult.rowCount === 0) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Producto no encontrado' }),
      };
    }

    const updatedFields = {};
    fieldsToUpdate.forEach((f) => { updatedFields[f] = body[f]; });

    await db.query(
      `INSERT INTO admin_actions (admin_user_id, action_type, entity_type, entity_id, details)
       VALUES ($1, 'update', 'product', $2, $3)`,
      [adminUserId, productId, JSON.stringify(updatedFields)]
    );

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Producto actualizado' }),
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Error interno al actualizar el producto' }),
    };
  }
};
