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

const pageGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '40px',
  alignItems: 'flex-start',
};

const formColumnStyle = {
  flex: '1 1 360px',
  minWidth: 0,
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
  fontSize: '16px',
  marginBottom: '16px',
  color: 'var(--color-on-surface)',
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '8px',
  gap: '8px',
};

const totalRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontWeight: '700',
  fontSize: '16px',
  color: 'var(--color-on-surface)',
  borderTop: '1px solid var(--color-outline-variant)',
  paddingTop: '14px',
  marginTop: '8px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '16px',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--color-on-surface)',
};

const errorStyle = {
  backgroundColor: 'var(--color-error-container)',
  color: 'var(--color-on-error-container)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontSize: '14px',
  marginBottom: '16px',
};

const successCardStyle = {
  backgroundColor: 'var(--color-secondary-container)',
  borderRadius: 'var(--radius-lg)',
  padding: '40px',
  textAlign: 'center',
  maxWidth: '480px',
  margin: '0 auto',
};

const successTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '22px',
  color: 'var(--color-on-surface)',
  marginBottom: '12px',
};

const successTextStyle = {
  fontSize: '15px',
  color: 'var(--color-on-surface-variant)',
  lineHeight: '1.6',
  marginBottom: '24px',
};

const pageTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '28px',
  marginBottom: '32px',
  color: 'var(--color-on-surface)',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setContactName(`${user.given_name} ${user.family_name}`);
    setContactEmail(user.email);
    fetchCart();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCart() {
    setCartLoading(true);
    try {
      const data = await apiFetch('/cart');
      setItems(data);
    } catch {
      setError('No se pudo cargar el carrito.');
    } finally {
      setCartLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await apiFetch('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          contact_name: contactName,
          contact_email: contactEmail,
          shipping_address: shippingAddress,
        }),
      });
      setConfirmed(result);
    } catch (err) {
      setError(err.message || 'Error al confirmar el pedido.');
    } finally {
      setSubmitting(false);
    }
  }

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  if (authLoading || cartLoading) {
    return (
      <Layout>
        <p style={centeredStyle}>Cargando...</p>
      </Layout>
    );
  }

  if (confirmed) {
    return (
      <Layout>
        <Head>
          <title>Pedido confirmado — Muebles &amp; Deco</title>
        </Head>
        <div style={successCardStyle}>
          <p style={successTitleStyle}>¡Pedido confirmado!</p>
          <p style={successTextStyle}>
            Número de orden: <strong>{confirmed.order_id}</strong>
            <br />
            Total: <strong>{formatPrice(confirmed.total_amount)}</strong>
          </p>
          <Link href="/" className="btn btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout — Muebles &amp; Deco</title>
      </Head>
      <Layout>
        <h1 className="page-heading">Confirmar pedido</h1>

        {items.length === 0 ? (
          <div style={centeredStyle}>
            <p style={{ marginBottom: '16px' }}>Tu carrito está vacío.</p>
            <Link href="/" className="btn btn-primary">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div style={pageGridStyle} className="two-col-flex">
            {/* ── Formulario ── */}
            <div style={formColumnStyle}>
              {error && <p style={errorStyle}>{error}</p>}
              <form onSubmit={handleSubmit}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Nombre de contacto</label>
                  <input
                    className="form-input"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Correo de contacto</label>
                  <input
                    className="form-input"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Dirección de envío</label>
                  <textarea
                    className="form-input"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {submitting ? 'Procesando...' : 'Confirmar pedido (simulado)'}
                </button>
              </form>
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
                    <span style={{ whiteSpace: 'nowrap' }}>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                <div style={totalRowStyle}>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
