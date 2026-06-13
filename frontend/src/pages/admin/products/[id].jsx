import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AdminGuard from '@/components/admin/AdminGuard';
import ProductForm from '@/components/admin/ProductForm';
import { apiFetch } from '@/lib/apiClient';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [categories, setCategories] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([apiFetch('/categories'), apiFetch(`/products/${id}`)])
      .then(([cats, product]) => {
        setCategories(cats);
        setInitialValues({
          name: product.name,
          description: product.description,
          price: product.price,
          category_id: product.category_id,
          width: product.width,
          height: product.height,
          depth: product.depth,
          materials: product.materials,
          style: product.style,
          stock: product.stock,
          tags: product.tags,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data) {
    await apiFetch(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    router.push('/admin');
  }

  return (
    <>
      <Head>
        <title>Editar producto — Admin</title>
      </Head>
      <AdminGuard>
        <Layout>
          <h1 className="page-heading">Editar producto</h1>

          {loading && (
            <p style={{ color: 'var(--color-on-surface-variant)' }}>Cargando producto...</p>
          )}

          {error && (
            <p style={{ color: 'var(--color-error)' }}>{error}</p>
          )}

          {!loading && !error && initialValues && (
            <ProductForm
              initialValues={initialValues}
              categories={categories}
              onSubmit={handleSubmit}
            />
          )}
        </Layout>
      </AdminGuard>
    </>
  );
}
