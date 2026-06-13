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

  const {
    name,
    description,
    price,
    category_id,
    width,
    height,
    depth,
    materials,
    style,
    stock,
    tags = [],
  } = body;

  if (!name || price === undefined || !category_id) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Los campos name, price y category_id son obligatorios' }),
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

    const insertResult = await db.query(
      `INSERT INTO products
         (name, description, price, category_id, width, height, depth, materials, style, stock, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
       RETURNING id`,
      [name, description, price, category_id, width, height, depth, materials, style, stock, tags]
    );

    const newProductId = insertResult.rows[0].id;

    await db.query(
      `INSERT INTO admin_actions (admin_user_id, action_type, entity_type, entity_id, details)
       VALUES ($1, 'create', 'product', $2, $3)`,
      [adminUserId, newProductId, JSON.stringify(body)]
    );

    return {
      statusCode: 201,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Producto creado', id: newProductId }),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: 'Error interno al crear el producto' }),
    };
  }
};
