import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/modules/auth/AuthContext';
import { apiFetch } from '@/lib/apiClient';

const COGNITO_ERRORS = {
  UsernameExistsException: 'Ya existe una cuenta con este correo electrónico.',
  InvalidPasswordException: 'La contraseña no cumple los requisitos de seguridad.',
  InvalidParameterException: 'Hay un campo con formato incorrecto.',
  TooManyRequestsException: 'Demasiados intentos. Intenta de nuevo más tarde.',
  CodeMismatchException: 'El código de verificación es incorrecto.',
  ExpiredCodeException: 'El código ha expirado. Solicita uno nuevo.',
};

function translateError(err) {
  return COGNITO_ERRORS[err.code] || err.message;
}

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

const errorStyle = {
  backgroundColor: 'var(--color-error-container)',
  color: 'var(--color-on-error-container)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontSize: '14px',
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
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

export default function RegisterPage() {
  const router = useRouter();
  const { register, confirmRegister, login } = useAuth();

  const [step, setStep] = useState('register');
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ givenName: '', familyName: '', password: '' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, form.password, form.givenName, form.familyName);
      setStep('confirm');
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmRegister(email, code);
    } catch (err) {
      setError(translateError(err));
      setLoading(false);
      return;
    }

    try {
      await login(email, form.password);
      try {
        await apiFetch('/auth/sync', {
          method: 'POST',
          body: JSON.stringify({
            email,
            given_name: form.givenName,
            family_name: form.familyName,
          }),
        });
      } catch (syncErr) {
        console.error('Error syncing user:', syncErr);
      }
      router.push('/');
    } catch {
      setError('Tu cuenta fue creada. Por favor iniciá sesión manualmente.');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'confirm') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Verificá tu cuenta</h1>
          <p style={subtitleStyle}>
            Enviamos un código de verificación a <strong>{email}</strong>.
          </p>
          <form onSubmit={handleConfirm} style={formStyle}>
            {error && <div style={errorStyle}>{error}</div>}
            <div style={fieldStyle}>
              <label style={labelStyle}>Código de verificación</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Verificando...' : 'Confirmar cuenta'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Crear cuenta</h1>
        <p style={subtitleStyle}>Ingresá tus datos para registrarte.</p>
        <form onSubmit={handleRegister} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Nombre</label>
              <input
                className="form-input"
                type="text"
                placeholder="Juan"
                value={form.givenName}
                onChange={(e) => setForm({ ...form, givenName: e.target.value })}
                required
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Apellido</label>
              <input
                className="form-input"
                type="text"
                placeholder="García"
                value={form.familyName}
                onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              className="form-input"
              type="email"
              placeholder="juan@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={footerStyle}>
          ¿Ya tenés cuenta?{' '}
          <a href="/auth/login" style={linkStyle}>
            Ingresá aquí
          </a>
        </p>
      </div>
    </div>
  );
}
