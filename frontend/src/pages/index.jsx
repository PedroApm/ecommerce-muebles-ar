import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/modules/auth/AuthContext';

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function CatalogPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [forceShowTop, setForceShowTop] = useState(false);
  const [forceShowCategories, setForceShowCategories] = useState(false);

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
      } catch {
        setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;
    apiFetch('/favorites')
      .then((favs) => setFavoriteIds(new Set(favs.map((f) => f.id))))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setForceShowTop(false);
      setForceShowCategories(false);
    }
  }, [searchTerm]);

  function handleToggleFavorite(productId) {
    if (favoriteIds.has(productId)) {
      apiFetch(`/favorites/${productId}`, { method: 'DELETE' })
        .then(() => {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        })
        .catch(() => {});
    } else {
      apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      })
        .then(() => setFavoriteIds((prev) => new Set([...prev, productId])))
        .catch(() => {});
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const searching = searchTerm.trim() !== '';
  const showTop = !searching || forceShowTop;
  const showCategories = !searching || forceShowCategories;

  return (
    <>
      <Head>
        <title>Catálogo — VESTAR</title>
        <meta name="description" content="Explorá nuestro catálogo de muebles y decoración." />
      </Head>
      <Layout>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-error)' }}>{error}</p>
        ) : (
          <>
            {/* 1. Buscador + filtros de categoría (sticky) */}
            <div className="sticky-filters-bar">
              <div style={{ marginBottom: '12px' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Categoría
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }} />
                <button
                  onClick={() => setForceShowCategories((v) => !v)}
                  aria-label={showCategories ? 'Colapsar categorías' : 'Expandir categorías'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                >
                  <span style={{ display: 'inline-flex', transform: `rotate(${showCategories ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>
                    <ChevronDown />
                  </span>
                </button>
              </div>

              <div style={{ maxHeight: showCategories ? '200px' : '0', overflow: 'hidden', opacity: showCategories ? 1 : 0, transition: 'max-height 0.3s ease, opacity 0.3s ease' }}>
                <div className="category-filters" style={{ marginBottom: 0 }}>
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
              </div>
            </div>

            {/* 2. Más vistos (carrusel horizontal) */}
            {topProducts.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <h2 className="section-heading" style={{ margin: 0 }}>Más vistos</h2>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }} />
                  <button
                    onClick={() => setForceShowTop((v) => !v)}
                    aria-label={showTop ? 'Colapsar más vistos' : 'Expandir más vistos'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <span style={{ display: 'inline-flex', transform: `rotate(${showTop ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>
                      <ChevronDown />
                    </span>
                  </button>
                </div>
                <div style={{ maxHeight: showTop ? '600px' : '0', overflow: 'hidden', opacity: showTop ? 1 : 0, transition: 'max-height 0.3s ease, opacity 0.3s ease' }}>
                  <div className="carousel-wrap">
                    {topProducts.map((product) => (
                      <div key={product.id} className="carousel-item">
                        <ProductCard
                          product={product}
                          isFavorite={favoriteIds.has(product.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 3. Catálogo completo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <h2 className="section-heading" style={{ margin: 0 }}>Catálogo</h2>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }} />
            </div>
            <ProductGrid
              products={filteredProducts}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}
      </Layout>
    </>
  );
}
