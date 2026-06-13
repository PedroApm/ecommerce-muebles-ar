import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { apiFetch } from '@/lib/apiClient';

const filtersStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '32px',
};

const loadingStyle = {
  textAlign: 'center',
  padding: '80px 0',
  color: 'var(--color-on-surface-variant)',
  fontSize: '16px',
};

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, prods] = await Promise.all([
          apiFetch('/categories'),
          apiFetch('/products'),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <>
      <Head>
        <title>Catálogo — Muebles &amp; Deco</title>
        <meta name="description" content="Explorá nuestro catálogo de muebles y decoración." />
      </Head>
      <Layout>
        {loading ? (
          <p style={loadingStyle}>Cargando productos...</p>
        ) : error ? (
          <p style={{ ...loadingStyle, color: 'var(--color-error)' }}>{error}</p>
        ) : (
          <>
            <div style={filtersStyle}>
              <button
                className={selectedCategory === null ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={selectedCategory === cat.id ? 'btn btn-primary' : 'btn btn-secondary'}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <ProductGrid products={filteredProducts} />
          </>
        )}
      </Layout>
    </>
  );
}
