import { useState } from 'react';

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };

export default function CategoryForm({ initialValues, onSubmit }) {
  const [values, setValues] = useState({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    sort_order: initialValues?.sort_order ?? 0,
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
      await onSubmit({
        name: values.name,
        description: values.description || undefined,
        sort_order: Number(values.sort_order),
      });
    } catch (err) {
      setError(err.message || 'Error al guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
      <div style={fieldStyle}>
        <label className="field-label">Nombre *</label>
        <input
          className="form-input"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          placeholder="Ej. Sofás"
        />
      </div>

      <div style={fieldStyle}>
        <label className="field-label">Descripción</label>
        <textarea
          className="form-input"
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={3}
          placeholder="Descripción de la categoría"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={fieldStyle}>
        <label className="field-label">Orden</label>
        <input
          className="form-input"
          type="number"
          name="sort_order"
          value={values.sort_order}
          onChange={handleChange}
          min="0"
          placeholder="0"
        />
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
