import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/modules/auth/AuthContext';

const centeredStyle = {
  textAlign: 'center',
  padding: '80px 0',
  color: 'var(--color-on-surface-variant)',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 'var(--space-gutter)',
};

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    apiFetch('/favorites')
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRemove(productId) {
    try {
      await apiFetch(`/favorites/${productId}`, { method: 'DELETE' });
      setFavorites((prev) => prev.filter((f) => f.id !== productId));
    } catch {
      // silently ignore
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Favoritos — VESTAR</title>
      </Head>
      <Layout>
        <h1 className="page-heading">Mis favoritos</h1>

        {favorites.length === 0 ? (
          <div style={centeredStyle}>
            <p style={{ marginBottom: '16px' }}>No tienes productos favoritos.</p>
            <Link href="/" className="btn btn-primary">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div style={gridStyle} className="favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.favorite_id}>
                <ProductCard
                  product={{ id: fav.id, name: fav.name, price: fav.price, image_url: fav.image_url, category_name: fav.category_name }}
                  isFavorite={true}
                  onToggleFavorite={handleRemove}
                />
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
}
