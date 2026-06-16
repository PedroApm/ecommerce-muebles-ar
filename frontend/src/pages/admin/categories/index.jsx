import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import AdminGuard from '@/components/admin/AdminGuard';
import { apiFetch } from '@/lib/apiClient';

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
};

const thStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '2px solid var(--color-outline-variant)',
  fontWeight: '600',
  color: 'var(--color-on-surface-variant)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid var(--color-outline-variant)',
  verticalAlign: 'middle',
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [disablingId, setDisablingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    apiFetch('/categories')
      .then(setCategories)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeactivate(id) {
    setDisablingId(id);
    setDeleteError(null);
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDisablingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Categorías — Admin VESTAR</title>
      </Head>
      <AdminGuard>
        <Layout>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h1 className="page-heading" style={{ margin: 0 }}>Categorías</h1>
            <Link href="/admin/categories/new" className="btn btn-primary">
              + Nueva categoría
            </Link>
          </div>

          {loading && <LoadingSpinner />}

          {loadError && (
            <p style={{ color: 'var(--color-error)', padding: '20px 0' }}>{loadError}</p>
          )}

          {deleteError && (
            <p style={{ color: 'var(--color-error)', marginBottom: '16px', fontSize: '14px' }}>{deleteError}</p>
          )}

          {!loading && !loadError && categories.length === 0 && (
            <p style={{ color: 'var(--color-on-surface-variant)', padding: '40px 0', textAlign: 'center' }}>
              No hay categorías activas.
            </p>
          )}

          {!loading && categories.length > 0 && (
            <div className="table-scroll">
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Descripción</th>
                    <th style={thStyle}>Orden</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td style={{ ...tdStyle, fontWeight: '500', color: 'var(--color-on-surface)' }}>
                        {cat.name}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--color-on-surface-variant)' }}>
                        {cat.description || '—'}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--color-on-surface-variant)' }}>
                        {cat.sort_order ?? 0}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link
                            href={`/admin/categories/${cat.id}`}
                            className="btn btn-secondary"
                            style={{ fontSize: '13px', padding: '7px 14px' }}
                          >
                            Editar
                          </Link>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeactivate(cat.id)}
                            disabled={disablingId === cat.id}
                            style={{ fontSize: '13px', padding: '7px 14px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                          >
                            {disablingId === cat.id ? 'Desactivando...' : 'Desactivar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Layout>
      </AdminGuard>
    </>
  );
}
