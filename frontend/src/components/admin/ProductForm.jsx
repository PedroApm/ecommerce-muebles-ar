import { useState } from 'react';

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };

function toTagString(tags) {
  if (Array.isArray(tags)) return tags.join(', ');
  return tags ?? '';
}

export default function ProductForm({ initialValues, categories, onSubmit }) {
  const [values, setValues] = useState({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    price: initialValues?.price ?? '',
    category_id: initialValues?.category_id ?? '',
    width: initialValues?.width ?? '',
    height: initialValues?.height ?? '',
    depth: initialValues?.depth ?? '',
    materials: initialValues?.materials ?? '',
    style: initialValues?.style ?? '',
    stock: initialValues?.stock ?? '',
    tags: toTagString(initialValues?.tags),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = {
        name: values.name,
        description: values.description || undefined,
        price: Number(values.price),
        category_id: values.category_id,
        ...(values.width !== '' && { width: Number(values.width) }),
        ...(values.height !== '' && { height: Number(values.height) }),
        ...(values.depth !== '' && { depth: Number(values.depth) }),
        ...(values.materials && { materials: values.materials }),
        ...(values.style && { style: values.style }),
        ...(values.stock !== '' && { stock: Number(values.stock) }),
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      await onSubmit(data);
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
      <div style={fieldStyle}>
        <label className="field-label">Nombre *</label>
        <input
          className="form-input"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          placeholder="Ej. Sofá Milano"
        />
      </div>

      <div style={fieldStyle}>
        <label className="field-label">Descripción</label>
        <textarea
          className="form-input"
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={4}
          placeholder="Descripción del producto"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldStyle}>
          <label className="field-label">Precio (S/) *</label>
          <input
            className="form-input"
            type="number"
            name="price"
            value={values.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div style={fieldStyle}>
          <label className="field-label">Categoría *</label>
          <select
            className="form-input"
            name="category_id"
            value={values.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div style={fieldStyle}>
          <label className="field-label">Ancho (cm)</label>
          <input
            className="form-input"
            type="number"
            name="width"
            value={values.width}
            onChange={handleChange}
            min="0"
            placeholder="—"
          />
        </div>
        <div style={fieldStyle}>
          <label className="field-label">Alto (cm)</label>
          <input
            className="form-input"
            type="number"
            name="height"
            value={values.height}
            onChange={handleChange}
            min="0"
            placeholder="—"
          />
        </div>
        <div style={fieldStyle}>
          <label className="field-label">Profundidad (cm)</label>
          <input
            className="form-input"
            type="number"
            name="depth"
            value={values.depth}
            onChange={handleChange}
            min="0"
            placeholder="—"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldStyle}>
          <label className="field-label">Materiales</label>
          <input
            className="form-input"
            name="materials"
            value={values.materials}
            onChange={handleChange}
            placeholder="Ej. Madera, tela"
          />
        </div>
        <div style={fieldStyle}>
          <label className="field-label">Estilo</label>
          <input
            className="form-input"
            name="style"
            value={values.style}
            onChange={handleChange}
            placeholder="Ej. Moderno"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldStyle}>
          <label className="field-label">Stock</label>
          <input
            className="form-input"
            type="number"
            name="stock"
            value={values.stock}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>
        <div style={fieldStyle}>
          <label className="field-label">Tags (separados por coma)</label>
          <input
            className="form-input"
            name="tags"
            value={values.tags}
            onChange={handleChange}
            placeholder="moderno, madera, sala"
          />
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: '14px' }}>{error}</p>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
