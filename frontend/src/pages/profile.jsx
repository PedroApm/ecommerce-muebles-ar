import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/modules/auth/AuthContext';

const sectionTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '18px',
  marginBottom: '20px',
  color: 'var(--color-on-surface)',
};

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };

const labelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--color-on-surface-variant)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const readonlyValueStyle = {
  padding: '12px 16px',
  backgroundColor: 'var(--color-surface-container)',
  borderRadius: 'var(--radius)',
  fontSize: 'var(--text-body-md-size)',
  color: 'var(--color-on-surface)',
  border: '1px solid var(--color-outline-variant)',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, changePassword } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/auth/login');
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || user === null) {
    return (
      <Layout>
        <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
          Cargando...
        </p>
      </Layout>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Mi perfil — Muebles &amp; Deco</title>
      </Head>
      <Layout>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: '600',
            fontSize: '28px',
            marginBottom: '40px',
            color: 'var(--color-on-surface)',
          }}
        >
          Mi perfil
        </h1>

        <div style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Datos del usuario */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={sectionTitleStyle}>Datos personales</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={fieldStyle}>
                <span style={labelStyle}>Nombre completo</span>
                <div style={readonlyValueStyle}>
                  {user.given_name} {user.family_name}
                </div>
              </div>
              <div style={fieldStyle}>
                <span style={labelStyle}>Correo electrónico</span>
                <div style={readonlyValueStyle}>{user.email}</div>
              </div>
            </div>
          </div>

          {/* Cambio de contraseña */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={sectionTitleStyle}>Cambiar contraseña</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="oldPassword">
                  Contraseña actual
                </label>
                <input
                  id="oldPassword"
                  className="form-input"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="newPassword">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  className="form-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="confirmPassword">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="confirmPassword"
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p style={{ color: 'var(--color-error)', fontSize: '14px' }}>{error}</p>
              )}

              {success && (
                <p style={{ color: 'var(--color-secondary)', fontSize: '14px', fontWeight: '500' }}>
                  Contraseña actualizada correctamente.
                </p>
              )}

              <div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
