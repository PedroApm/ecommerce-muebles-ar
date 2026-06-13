import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/AuthContext';
import { apiFetch } from '@/lib/apiClient';

const cardInnerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  textDecoration: 'none',
  color: 'inherit',
};

const imageWrapStyle = {
  position: 'relative',
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
  color: 'var(--color-outline)',
};

const infoStyle = {
  padding: '16px',
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

const footerRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '8px',
};

const priceStyle = {
  fontWeight: '600',
  fontSize: '16px',
  color: 'var(--color-primary)',
};

const favBtnStyle = {
  fontSize: '12px',
  padding: '4px 10px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid var(--color-outline-variant)',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  color: 'var(--color-on-surface-variant)',
  transition: 'background-color 150ms ease',
};

function formatPrice(price) {
  return `S/ ${Number(price).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const [favLabel, setFavLabel] = useState('♥ Favorito');

  async function handleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id }),
      });
      setFavLabel('Agregado');
      setTimeout(() => setFavLabel('♥ Favorito'), 1500);
    } catch {
      // silently ignore
    }
  }

  return (
    <Link href={`/product/${product.id}`} style={cardInnerStyle} className="card">
      <div style={imageWrapStyle}>
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} style={imgStyle} />
        ) : (
          <div style={placeholderStyle}>🛋</div>
        )}
      </div>
      <div style={infoStyle}>
        <span style={categoryStyle}>{product.category_name}</span>
        <span style={nameStyle}>{product.name}</span>
        <div style={footerRowStyle}>
          <span style={priceStyle}>{formatPrice(product.price)}</span>
          {user && (
            <button style={favBtnStyle} onClick={handleFavorite}>
              {favLabel}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
