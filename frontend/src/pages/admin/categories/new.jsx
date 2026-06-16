import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AdminGuard from '@/components/admin/AdminGuard';
import CategoryForm from '@/components/admin/CategoryForm';
import { apiFetch } from '@/lib/apiClient';

export default function NewCategoryPage() {
  const router = useRouter();

  async function handleSubmit(data) {
    await apiFetch('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    router.push('/admin/categories');
  }

  return (
    <>
      <Head>
        <title>Nueva categoría — Admin VESTAR</title>
      </Head>
      <AdminGuard>
        <Layout>
          <h1 className="page-heading">Nueva categoría</h1>
          <CategoryForm initialValues={null} onSubmit={handleSubmit} />
        </Layout>
      </AdminGuard>
    </>
  );
}
