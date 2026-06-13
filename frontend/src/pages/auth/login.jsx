import { useState } from 'react';
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
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-background)',
  padding: '20px',
};

const cardStyle = {
  backgroundColor: 'var(--color-surface-container-lowest)',
  borderRadius: 'var(--radius-lg)',
  padding: '40px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: 'var(--shadow-float)',
};

const titleStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '24px',
  fontWeight: '600',
  color: 'var(--color-on-surface)',
  marginBottom: '8px',
};

const subtitleStyle = {
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '28px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
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
      <div style={cardStyle}>
        <h1 style={titleStyle}>Iniciar sesión</h1>
        <p style={subtitleStyle}>Ingresá con tu cuenta para continuar.</p>
        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          <div style={fieldStyle}>
            <label style={labelStyle}>Correo electrónico</label>
            <input
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
            <label style={labelStyle}>Contraseña</label>
            <input
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
            style={{ width: '100%', marginTop: '8px' }}
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
