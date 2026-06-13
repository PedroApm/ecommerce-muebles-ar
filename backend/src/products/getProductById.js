const db = require('../lib/db');

const SQL = `
  SELECT
    p.*,
    c.name AS category_name,
    ar.model_url,
    ar.width AS ar_width,
    ar.height AS ar_height,
    ar.depth AS ar_depth,
    ar.scale_factor,
    ar.default_rotation,
    COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', pi.id,
          'url', pi.url,
          'is_primary', pi.is_primary
        ))
        FROM product_images pi
        WHERE pi.product_id = p.id
      ),
      '[]'
    ) AS images,
    COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', pv.id,
          'color', pv.color,
          'size', pv.size,
          'material', pv.material,
          'price_modifier', pv.price_modifier
        ))
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ),
      '[]'
    ) AS variants
  FROM products p
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN product_ar_assets ar ON ar.product_id = p.id
  WHERE p.id = $1 AND p.status = 'active'
`;

module.exports.handler = async (event) => {
  const { id } = event.pathParameters;
  try {
    const result = await db.query(SQL, [id]);
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Producto no encontrado' }),
      };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error interno al obtener el producto' }),
    };
  }
};
