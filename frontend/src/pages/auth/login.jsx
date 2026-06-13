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

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-background)',
  padding: '24px 20px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--color-on-surface)',
};

const titleStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '22px',
  fontWeight: '600',
  color: 'var(--color-on-surface)',
  marginBottom: '6px',
};

const subtitleStyle = {
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '24px',
};

const errorStyle = {
  backgroundColor: 'var(--color-error-container)',
  color: 'var(--color-on-error-container)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontSize: '14px',
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
};

const linkStyle = {
  color: 'var(--color-primary)',
  fontWeight: '600',
  textDecoration: 'none',
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
      <Link href="/" className="auth-brand">Muebles &amp; Deco</Link>

      <div className="auth-card">
        <h1 style={titleStyle}>Iniciar sesión</h1>
        <p style={subtitleStyle}>Ingresá con tu cuenta para continuar.</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="juan@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="form-input"
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
            style={{ width: '100%', marginTop: '4px' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={footerStyle}>
          ¿No tenés cuenta?{' '}
          <a href="/auth/register" style={linkStyle}>
            Registrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
