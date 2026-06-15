import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import ProductGrid from '@/components/product/ProductGrid';
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/modules/auth/AuthContext';

function formatPrice(price) {
  return `S/ ${Number(price).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function variantLabel(v) {
  const parts = [v.color, v.size, v.material].filter(Boolean).join(' / ');
  if (!v.price_modifier || v.price_modifier === 0) return parts;
  const sign = v.price_modifier > 0 ? '+' : '';
  return `${parts} (${sign}${formatPrice(v.price_modifier)})`;
}

/* ── Styles ── */
const pageGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '48px',
  alignItems: 'flex-start',
};

const galleryStyle = {
  flex: '1 1 340px',
  minWidth: 0,
};

const mainImageWrapStyle = {
  width: '100%',
  aspectRatio: '4 / 3',
  backgroundColor: 'var(--color-surface-container)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  marginBottom: '12px',
};

const mainImageStyle = {
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
  fontSize: '64px',
};

const thumbnailsStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const thumbBtnStyle = {
  width: '72px',
  height: '72px',
  padding: 0,
  border: 'none',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  outlineOffset: '2px',
};

const thumbImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const infoStyle = {
  flex: '1 1 320px',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const categoryLabelStyle = {
  fontSize: 'var(--text-label-sm-size)',
  fontWeight: 'var(--text-label-sm-weight)',
  letterSpacing: 'var(--text-label-sm-tracking)',
  textTransform: 'uppercase',
  color: 'var(--color-secondary)',
  marginBottom: '6px',
};

const titleStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '28px',
  fontWeight: '600',
  color: 'var(--color-on-surface)',
  lineHeight: '1.2',
  marginBottom: '10px',
};

const priceStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: 'var(--color-primary)',
  marginBottom: '16px',
};

const descriptionStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '20px',
};

const metaRowStyle = {
  display: 'flex',
  gap: '12px',
  fontSize: '14px',
  color: 'var(--color-on-surface)',
  marginBottom: '8px',
};

const metaLabelStyle = {
  fontWeight: '600',
  minWidth: '100px',
  color: 'var(--color-on-surface-variant)',
};

const dividerStyle = {
  borderTop: '1px solid var(--color-outline-variant)',
  margin: '20px 0',
};

const sectionLabelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '10px',
};

const variantsWrapStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const feedbackStyle = (isError) => ({
  fontSize: '14px',
  padding: '10px 14px',
  borderRadius: 'var(--radius)',
  marginTop: '10px',
  backgroundColor: isError ? 'var(--color-error-container)' : 'var(--color-secondary-container)',
  color: isError ? 'var(--color-on-error-container)' : 'var(--color-on-secondary-container)',
});

const arSectionStyle = {
  marginTop: '28px',
  paddingTop: '24px',
  borderTop: '1px solid var(--color-outline-variant)',
};

const centeredStyle = {
  textAlign: 'center',
  padding: '80px 0',
  color: 'var(--color-on-surface-variant)',
};

const errorTextStyle = {
  ...centeredStyle,
  color: 'var(--color-error)',
};

/* ── Component ── */
export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    apiFetch(`/products/${id}`)
      .then((data) => {
        setProduct(data);
        const primary =
          data.images?.find((img) => img.is_primary) || data.images?.[0];
        setActiveImage(primary?.url || null);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar el producto.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiFetch('/products/top')
      .then((top) =>
        setRecommended(top.filter((p) => String(p.id) !== String(id)).slice(0, 3))
      )
      .catch(() => {});
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setCartMessage('');
    setCartError('');
    try {
      await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({
          product_id: id,
          variant_id: selectedVariantId || null,
          quantity,
        }),
      });
      setCartMessage('Agregado al carrito');
      setTimeout(() => setCartMessage(''), 2000);
    } catch (err) {
      setCartError(err.message || 'Error al agregar al carrito.');
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <p style={errorTextStyle}>{error || 'Producto no encontrado.'}</p>
      </Layout>
    );
  }

  const {
    name, description, price, category_name,
    width, height, depth, materials, style: productStyle,
    stock, has_ar_model, model_url,
    images = [], variants = [],
  } = product;

  return (
    <>
      <Head>
        <title>{name} — VESTAR</title>
        <meta name="description" content={description || name} />
      </Head>
      <Layout>
        <div style={pageGridStyle}>
          {/* ── Galería de imágenes ── */}
          <div style={galleryStyle}>
            <div style={{ ...mainImageWrapStyle, position: 'relative' }}>
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage} alt={name} className="card-img" style={{ borderRadius: 'var(--radius-lg)' }} />
              ) : (
                <div style={placeholderStyle}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.25"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v9"/></svg>
                </div>
              )}
              {/* AR overlay pill — visible when AR model exists */}
              {has_ar_model && model_url && (
                <button
                  className="ar-overlay-btn"
                  onClick={() => {
                    document.getElementById('ar-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label="Ver en mi espacio"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  Ver en mi espacio
                </button>
              )}
              {/* Image dots indicator */}
              {images.length > 1 && (
                <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                  {images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      style={{
                        width: activeImage === img.url ? '20px' : '6px',
                        height: '6px',
                        borderRadius: '3px',
                        border: 'none',
                        backgroundColor: activeImage === img.url ? 'var(--color-primary)' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 250ms ease',
                      }}
                      aria-label={`Imagen ${img.id}`}
                    />
                  ))}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div style={thumbnailsStyle}>
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    style={{
                      ...thumbBtnStyle,
                      outline:
                        activeImage === img.url
                          ? '2px solid var(--color-primary)'
                          : '2px solid transparent',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" style={thumbImgStyle} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Información del producto ── */}
          <div style={infoStyle}>
            <p style={categoryLabelStyle}>{category_name}</p>
            <h1 style={titleStyle}>{name}</h1>
            <p style={priceStyle}>{formatPrice(price)}</p>

            {description && <p style={descriptionStyle}>{description}</p>}

            <hr style={dividerStyle} />

            {(width || height || depth) && (
              <div style={metaRowStyle}>
                <span style={metaLabelStyle}>Medidas</span>
                <span>{width} × {height} × {depth} cm</span>
              </div>
            )}
            {materials && (
              <div style={metaRowStyle}>
                <span style={metaLabelStyle}>Materiales</span>
                <span>{materials}</span>
              </div>
            )}
            {productStyle && (
              <div style={metaRowStyle}>
                <span style={metaLabelStyle}>Estilo</span>
                <span>{productStyle}</span>
              </div>
            )}
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Disponibilidad</span>
              <span
                style={{
                  color:
                    stock > 0
                      ? 'var(--color-secondary)'
                      : 'var(--color-error)',
                  fontWeight: '600',
                }}
              >
                {stock > 0 ? `Disponible (${stock} en stock)` : 'Agotado'}
              </span>
            </div>

            {/* ── Variantes ── */}
            {variants.length > 0 && (
              <>
                <hr style={dividerStyle} />
                <p style={sectionLabelStyle}>Variantes</p>
                <div style={variantsWrapStyle}>
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      className={
                        selectedVariantId === v.id
                          ? 'btn btn-primary'
                          : 'btn btn-secondary'
                      }
                      onClick={() => setSelectedVariantId(v.id)}
                      style={{ fontSize: '13px', padding: '8px 14px' }}
                    >
                      {variantLabel(v)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Cantidad y carrito ── */}
            <hr style={dividerStyle} />
            <p style={sectionLabelStyle}>Cantidad</p>
            <input
              className="form-input"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              style={{ width: '100px', marginBottom: '16px' }}
            />
            <div className="add-to-cart-wrap">
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={stock === 0}
                style={{ width: '100%' }}
              >
                {stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
            {cartMessage && (
              <p style={feedbackStyle(false)}>{cartMessage}</p>
            )}
            {cartError && (
              <p style={feedbackStyle(true)}>{cartError}</p>
            )}

            {/* ── Realidad Aumentada ── */}
            <div id="ar-section" style={arSectionStyle}>
              <p style={sectionLabelStyle}>Realidad Aumentada</p>
              {has_ar_model && model_url ? (
                <>
                  <Script
                    src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
                    type="module"
                    strategy="afterInteractive"
                  />
                  {/* model-viewer es un custom element; se pasan atributos booleanos con spread */}
                  <model-viewer
                    src={model_url}
                    style={{
                      width: '100%',
                      height: '360px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface-container)',
                    }}
                    {...{ ar: '', 'camera-controls': '', 'auto-rotate': '' }}
                  >
                    <button
                      slot="ar-button"
                      className="btn btn-primary"
                      style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      Ver en mi espacio
                    </button>
                  </model-viewer>
                </>
              ) : (
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                  Visualización 3D no disponible para este producto.
                </p>
              )}
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <section style={{ marginTop: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <h2 className="section-heading" style={{ margin: 0 }}>Productos recomendados</h2>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }} />
            </div>
            <ProductGrid products={recommended} />
          </section>
        )}
      </Layout>
    </>
  );
}
