import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AdminGuard from '@/components/admin/AdminGuard';
import CategoryForm from '@/components/admin/CategoryForm';
import { apiFetch } from '@/lib/apiClient';

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = router.query;

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    apiFetch('/categories')
      .then((categories) => {
        const cat = categories.find((c) => String(c.id) === String(id));
        if (!cat) throw new Error('Categoría no encontrada');
        setInitialValues({
          name: cat.name,
          description: cat.description ?? '',
          sort_order: cat.sort_order ?? 0,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data) {
    await apiFetch(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    router.push('/admin/categories');
  }

  return (
    <>
      <Head>
        <title>Editar categoría — Admin VESTAR</title>
      </Head>
      <AdminGuard>
        <Layout>
          <h1 className="page-heading">Editar categoría</h1>

          {loading && (
            <p style={{ color: 'var(--color-on-surface-variant)' }}>Cargando categoría...</p>
          )}

          {error && (
            <p style={{ color: 'var(--color-error)' }}>{error}</p>
          )}

          {!loading && !error && initialValues && (
            <CategoryForm initialValues={initialValues} onSubmit={handleSubmit} />
          )}
        </Layout>
      </AdminGuard>
    </>
  );
}
