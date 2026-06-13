import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/AuthContext';

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

const priceStyle = {
  fontWeight: '700',
  fontSize: '16px',
  color: 'var(--color-primary)',
  marginTop: '10px',
};

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

export default function ProductCard({ product, isFavorite = false, onToggleFavorite }) {
  const { user } = useAuth();
  const [popping, setPopping] = useState(false);

  function handleFavClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!onToggleFavorite) return;
    setPopping(true);
    onToggleFavorite(product.id);
    setTimeout(() => setPopping(false), 200);
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
        {user && onToggleFavorite && (
          <button
            onClick={handleFavClick}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              zIndex: 5,
              padding: 0,
              transform: popping ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill={isFavorite ? 'var(--color-primary)' : 'none'}
              stroke={isFavorite ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        )}
      </div>
      <div style={infoStyle}>
        <span style={categoryStyle}>{product.category_name}</span>
        <span style={nameStyle}>{product.name}</span>
        <span style={priceStyle}>{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}
