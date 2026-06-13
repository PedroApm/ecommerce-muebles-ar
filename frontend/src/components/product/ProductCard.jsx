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

const placeholderStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-outline)',
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
  lineHeight: '1.3',
  marginTop: '2px',
};

const footerRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '10px',
};

const priceStyle = {
  fontWeight: '700',
  fontSize: '16px',
  color: 'var(--color-primary)',
};

const favBtnBaseStyle = {
  fontSize: '12px',
  padding: '4px 10px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid var(--color-outline-variant)',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  color: 'var(--color-on-surface-variant)',
};

/* SVG placeholder icon */
function FurnitureIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
      <path d="M12 4v9" />
    </svg>
  );
}

function formatPrice(price) {
  return `S/ ${Number(price).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const [favLabel, setFavLabel] = useState('+ Favorito');

  async function handleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id }),
      });
      setFavLabel('Agregado');
      setTimeout(() => setFavLabel('+ Favorito'), 1500);
    } catch {
      // silently ignore
    }
  }

  return (
    <Link href={`/product/${product.id}`} style={cardInnerStyle} className="card">
      <div style={imageWrapStyle}>
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="card-img" />
        ) : (
          <div style={placeholderStyle}>
            <FurnitureIcon />
          </div>
        )}
      </div>
      <div style={infoStyle}>
        <span style={categoryStyle}>{product.category_name}</span>
        <span style={nameStyle}>{product.name}</span>
        <div style={footerRowStyle}>
          <span style={priceStyle}>{formatPrice(product.price)}</span>
          {user && (
            <button style={favBtnBaseStyle} className="fav-btn" onClick={handleFavorite}>
              {favLabel}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
