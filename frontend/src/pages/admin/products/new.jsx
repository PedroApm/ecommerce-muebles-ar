import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AdminGuard from '@/components/admin/AdminGuard';
import ProductForm from '@/components/admin/ProductForm';
import { apiFetch } from '@/lib/apiClient';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    apiFetch('/categories')
      .then(setCategories)
      .finally(() => setLoadingCats(false));
  }, []);

  async function handleSubmit(data) {
    await apiFetch('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    router.push('/admin');
  }

  return (
    <>
      <Head>
        <title>Nuevo producto — Admin</title>
      </Head>
      <AdminGuard>
        <Layout>
          <h1 className="page-heading">Nuevo producto</h1>

          {loadingCats ? (
            <p style={{ color: 'var(--color-on-surface-variant)' }}>Cargando categorías...</p>
          ) : (
            <ProductForm initialValues={null} categories={categories} onSubmit={handleSubmit} />
          )}
        </Layout>
      </AdminGuard>
    </>
  );
}
