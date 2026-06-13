import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/modules/auth/AuthContext';

function formatPrice(value) {
  return `S/ ${Number(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ── Styles ── */
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

const cardLinkStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  textDecoration: 'none',
  color: 'inherit',
};

const imageWrapStyle = {
  aspectRatio: '4 / 3',
  backgroundColor: 'var(--color-surface-container)',
  overflow: 'hidden',
  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const placeholderStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
};

const infoStyle = {
  padding: '14px 16px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flexGrow: 1,
};

const categoryStyle = {
  fontSize: 'var(--text-label-sm-size)',
  fontWeight: 'var(--text-label-sm-weight)',
  letterSpacing: 'var(--text-label-sm-tracking)',
  textTransform: 'uppercase',
  color: 'var(--color-secondary)',
};

const nameStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '500',
  fontSize: '15px',
  color: 'var(--color-on-surface)',
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '10px',
};

const priceStyle = {
  fontWeight: '700',
  fontSize: '15px',
  color: 'var(--color-primary)',
};

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

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

  async function handleRemove(e, productId) {
    e.preventDefault();
    e.stopPropagation();
    setRemovingId(productId);
    try {
      await apiFetch(`/favorites/${productId}`, { method: 'DELETE' });
      setFavorites((prev) => prev.filter((f) => f.id !== productId));
    } finally {
      setRemovingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <p style={centeredStyle}>Cargando favoritos...</p>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Favoritos — Muebles &amp; Deco</title>
      </Head>
      <Layout>
        <h1 className="page-heading">Mis favoritos</h1>

        {favorites.length === 0 ? (
          <div style={centeredStyle}>
            <p style={{ marginBottom: '16px' }}>No tenés productos favoritos.</p>
            <Link href="/" className="btn btn-primary">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div style={gridStyle}>
            {favorites.map((fav) => (
              <div key={fav.favorite_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href={`/product/${fav.id}`} style={cardLinkStyle}>
                  <div style={imageWrapStyle}>
                    {fav.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fav.image_url} alt={fav.name} style={imgStyle} />
                    ) : (
                      <div style={placeholderStyle}>🛋</div>
                    )}
                  </div>
                  <div style={infoStyle}>
                    <span style={categoryStyle}>{fav.category_name}</span>
                    <span style={nameStyle}>{fav.name}</span>
                    <div style={footerStyle}>
                      <span style={priceStyle}>{formatPrice(fav.price)}</span>
                    </div>
                  </div>
                </Link>
                <div style={{ padding: '0 16px 16px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => handleRemove(e, fav.id)}
                    disabled={removingId === fav.id}
                    style={{ width: '100%', fontSize: '13px', padding: '7px 12px' }}
                  >
                    {removingId === fav.id ? 'Quitando...' : 'Quitar de favoritos'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
}
