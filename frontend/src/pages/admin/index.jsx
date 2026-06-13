import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import AdminGuard from '@/components/admin/AdminGuard';
import { apiFetch } from '@/lib/apiClient';

const headingStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '28px',
  marginBottom: '8px',
  color: 'var(--color-on-surface)',
};

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

function formatPrice(value) {
  return `S/ ${Number(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disablingId, setDisablingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/products')
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeactivate(id) {
    setDisablingId(id);
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Error al desactivar: ${err.message}`);
    } finally {
      setDisablingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Administración de Productos — Muebles &amp; Deco</title>
      </Head>
      <AdminGuard>
        <Layout>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h1 className="page-heading" style={{ margin: 0 }}>Productos</h1>
            <Link href="/admin/products/new" className="btn btn-primary">
              + Nuevo producto
            </Link>
          </div>

          {loading && (
            <p style={{ color: 'var(--color-on-surface-variant)', padding: '40px 0', textAlign: 'center' }}>
              Cargando productos...
            </p>
          )}

          {error && (
            <p style={{ color: 'var(--color-error)', padding: '20px 0' }}>{error}</p>
          )}

          {!loading && !error && products.length === 0 && (
            <p style={{ color: 'var(--color-on-surface-variant)', padding: '40px 0', textAlign: 'center' }}>
              No hay productos activos.
            </p>
          )}

          {!loading && products.length > 0 && (
            <div className="table-scroll">
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Imagen</th>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Categoría</th>
                    <th style={thStyle}>Precio</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td style={tdStyle}>
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: 'var(--radius)',
                              backgroundColor: 'var(--color-surface-container)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                            }}
                          >
                            🛋
                          </div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: '500', color: 'var(--color-on-surface)' }}>
                        {product.name}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--color-on-surface-variant)' }}>
                        {product.category_name}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: '600', color: 'var(--color-primary)' }}>
                        {formatPrice(product.price)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="btn btn-secondary"
                            style={{ fontSize: '13px', padding: '7px 14px' }}
                          >
                            Editar
                          </Link>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeactivate(product.id)}
                            disabled={disablingId === product.id}
                            style={{ fontSize: '13px', padding: '7px 14px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                          >
                            {disablingId === product.id ? 'Desactivando...' : 'Desactivar'}
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
