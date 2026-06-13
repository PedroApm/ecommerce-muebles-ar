import { useEffect, useState, useCallback } from 'react';
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

function variantLabel(item) {
  return [item.variant_color, item.variant_size, item.variant_material]
    .filter(Boolean)
    .join(' / ');
}

/* ── Styles ── */
const centeredStyle = {
  textAlign: 'center',
  padding: '80px 0',
  color: 'var(--color-on-surface-variant)',
};

const errorBannerStyle = {
  backgroundColor: 'var(--color-error-container)',
  color: 'var(--color-on-error-container)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  marginBottom: '16px',
  fontSize: '14px',
};

const pageLayoutStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '32px',
  alignItems: 'flex-start',
};

const itemsColumnStyle = {
  flex: '1 1 500px',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const summaryColumnStyle = {
  flex: '0 1 300px',
  minWidth: '260px',
};

const summaryCardStyle = {
  backgroundColor: 'var(--color-surface-container-lowest)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  boxShadow: 'var(--shadow-float)',
  position: 'sticky',
  top: '84px',
};

const summaryTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '18px',
  marginBottom: '20px',
  color: 'var(--color-on-surface)',
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '8px',
};

const totalRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontWeight: '700',
  fontSize: '18px',
  color: 'var(--color-on-surface)',
  borderTop: '1px solid var(--color-outline-variant)',
  paddingTop: '16px',
  marginTop: '8px',
};

const itemCardStyle = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  padding: '16px',
  backgroundColor: 'var(--color-surface-container-lowest)',
  borderRadius: 'var(--radius-lg)',
};

const itemImageStyle = {
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: 'var(--radius)',
  flexShrink: 0,
  backgroundColor: 'var(--color-surface-container)',
};

const itemImagePlaceholderStyle = {
  width: '80px',
  height: '80px',
  borderRadius: 'var(--radius)',
  flexShrink: 0,
  backgroundColor: 'var(--color-surface-container)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
};

const itemBodyStyle = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const itemNameStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '500',
  fontSize: '15px',
  color: 'var(--color-on-surface)',
};

const itemVariantStyle = {
  fontSize: '13px',
  color: 'var(--color-on-surface-variant)',
};

const itemPriceStyle = {
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
};

const itemFooterStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: '8px',
  flexWrap: 'wrap',
};

const subtotalStyle = {
  fontWeight: '700',
  fontSize: '15px',
  color: 'var(--color-primary)',
  marginLeft: 'auto',
};

/* ── CartItem subcomponent ── */
function CartItem({ item, onQuantityChange, onRemove, disabled }) {
  const [localQty, setLocalQty] = useState(item.quantity);
  const variant = variantLabel(item);
  const unitPrice = Number(item.base_price) + Number(item.price_modifier || 0);

  function handleBlur() {
    const qty = Math.max(1, parseInt(localQty) || 1);
    setLocalQty(qty);
    if (qty !== item.quantity) onQuantityChange(item.id, qty);
  }

  return (
    <div style={itemCardStyle}>
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.name} style={itemImageStyle} />
      ) : (
        <div style={itemImagePlaceholderStyle}>🛋</div>
      )}

      <div style={itemBodyStyle}>
        <span style={itemNameStyle}>{item.name}</span>
        {variant && <span style={itemVariantStyle}>{variant}</span>}
        <span style={itemPriceStyle}>Precio unitario: {formatPrice(unitPrice)}</span>

        <div style={itemFooterStyle}>
          <input
            className="form-input"
            type="number"
            min={1}
            value={localQty}
            onChange={(e) => setLocalQty(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            style={{ width: '72px', padding: '6px 10px' }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            Eliminar
          </button>
          <span style={subtotalStyle}>{formatPrice(item.subtotal)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchCart();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCart() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/cart');
      setItems(data);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el carrito.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuantityChange(itemId, quantity) {
    setActionLoading(true);
    setError('');
    try {
      await apiFetch(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      await fetchCart();
    } catch (err) {
      setError(err.message || 'Error al actualizar la cantidad.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemove(itemId) {
    setActionLoading(true);
    setError('');
    try {
      await apiFetch(`/cart/${itemId}`, { method: 'DELETE' });
      await fetchCart();
    } catch (err) {
      setError(err.message || 'Error al eliminar el ítem.');
    } finally {
      setActionLoading(false);
    }
  }

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  if (authLoading || (loading && items.length === 0)) {
    return (
      <Layout>
        <p style={centeredStyle}>Cargando carrito...</p>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Carrito — Muebles &amp; Deco</title>
      </Head>
      <Layout>
        <h1 className="page-heading">Tu carrito</h1>

        {error && <p style={errorBannerStyle}>{error}</p>}

        {items.length === 0 ? (
          <div style={centeredStyle}>
            <p style={{ marginBottom: '16px' }}>Tu carrito está vacío.</p>
            <Link href="/" className="btn btn-primary">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div style={pageLayoutStyle} className="two-col-flex">
            {/* ── Lista de ítems ── */}
            <div style={itemsColumnStyle}>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  disabled={actionLoading}
                />
              ))}
            </div>

            {/* ── Resumen ── */}
            <div style={summaryColumnStyle} className="col-summary">
              <div style={summaryCardStyle}>
                <p style={summaryTitleStyle}>Resumen del pedido</p>
                {items.map((item) => (
                  <div key={item.id} style={summaryRowStyle}>
                    <span>
                      {item.name}{' '}
                      <span style={{ opacity: 0.7 }}>× {item.quantity}</span>
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                <div style={totalRowStyle}>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="btn btn-primary"
                  style={{ display: 'block', textAlign: 'center', marginTop: '20px', width: '100%' }}
                >
                  Proceder al pago
                </Link>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
