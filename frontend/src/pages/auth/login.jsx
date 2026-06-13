import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/modules/auth/AuthContext';

const COGNITO_ERRORS = {
  NotAuthorizedException: 'Correo electrónico o contraseña incorrectos.',
  UserNotFoundException: 'No existe una cuenta con este correo electrónico.',
  UserNotConfirmedException: 'Debés confirmar tu cuenta antes de ingresar.',
  PasswordResetRequiredException: 'Debés restablecer tu contraseña.',
  TooManyRequestsException: 'Demasiados intentos. Intenta de nuevo más tarde.',
};

function translateError(err) {
  return COGNITO_ERRORS[err.code] || err.message;
}

function BagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-background)',
  padding: '32px 20px',
};

const brandWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '28px',
};

const brandNameStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '18px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--color-primary)',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const errorStyle = {
  backgroundColor: 'var(--color-error-container)',
  color: 'var(--color-on-error-container)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontSize: '14px',
};

const legalStyle = {
  textAlign: 'center',
  marginTop: '24px',
  fontSize: '12px',
  color: 'var(--color-on-surface-variant)',
  lineHeight: '1.6',
  maxWidth: '320px',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      {/* Brand mark */}
      <div style={brandWrapStyle}>
        <BagIcon />
        <span style={brandNameStyle}>VESTAR</span>
      </div>

      <div className="auth-card" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Tab switcher */}
        <div className="auth-tabs">
          <span className="auth-tab active">Ingresar</span>
          <Link href="/auth/register" className="auth-tab">Registrarse</Link>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={fieldStyle}>
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={fieldStyle}>
            <div style={labelRowStyle}>
              <label className="field-label" htmlFor="password">Contraseña</label>
            </div>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', letterSpacing: '0.06em', marginTop: '4px' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="auth-or">O continuar con</div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 16px',
              border: '1.5px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              cursor: 'not-allowed',
              opacity: 0.5,
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-base)',
              color: 'var(--color-on-surface)',
            }}
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 16px',
              border: '1.5px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              cursor: 'not-allowed',
              opacity: 0.5,
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-base)',
              color: 'var(--color-on-surface)',
            }}
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Apple
          </button>
        </div>
      </div>

      <p style={legalStyle}>
        Al continuar, aceptás nuestros{' '}
        <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Términos de Servicio</span>
        {' '}y{' '}
        <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Política de Privacidad</span>.
      </p>
    </div>
  );
}
