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
  const [topProducts, setTopProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, prods, top] = await Promise.all([
          apiFetch('/categories'),
          apiFetch('/products'),
          apiFetch('/products/top'),
        ]);
        setCategories(cats);
        setProducts(prods);
        setTopProducts(top);
      } catch (err) {
        setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

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
            {topProducts.length > 0 && (
              <section style={{ marginBottom: '56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <h2 className="section-heading" style={{ margin: 0 }}>Más vistos</h2>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }} />
                </div>
                <ProductGrid products={topProducts} />
              </section>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative', maxWidth: '400px' }}>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', pointerEvents: 'none' }}
                >
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="form-input"
                  type="search"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                Categoría
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }} />
            </div>
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
