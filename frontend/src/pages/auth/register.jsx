import { useState } from 'react';
import Link from 'next/link';
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
  gap: '18px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const errorStyle = {
  backgroundColor: 'var(--color-error-container)',
  color: 'var(--color-on-error-container)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontSize: '14px',
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
        <div style={brandWrapStyle}>
          <BagIcon />
          <span style={brandNameStyle}>VESTAR</span>
        </div>
        <div className="auth-card" style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '6px' }}>
              Paso 2 de 2
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--color-on-surface)' }}>
              Verificá tu cuenta
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginTop: '6px' }}>
              Código enviado a <strong>{email}</strong>
            </p>
          </div>
          <form onSubmit={handleConfirm} style={formStyle}>
            {error && <div style={errorStyle}>{error}</div>}
            <div style={fieldStyle}>
              <label className="field-label" htmlFor="code">Código de verificación</label>
              <input
                id="code"
                className="auth-input"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                style={{ letterSpacing: '0.2em', fontSize: '20px', textAlign: 'center' }}
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', letterSpacing: '0.06em' }}
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
      <div style={brandWrapStyle}>
        <BagIcon />
        <span style={brandNameStyle}>VESTAR</span>
      </div>

      <div className="auth-card" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Tab switcher */}
        <div className="auth-tabs">
          <Link href="/auth/login" className="auth-tab">Ingresar</Link>
          <span className="auth-tab active">Registrarse</span>
        </div>

        <form onSubmit={handleRegister} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label className="field-label" htmlFor="givenName">Nombre</label>
              <input
                id="givenName"
                className="auth-input"
                type="text"
                placeholder="Juan"
                value={form.givenName}
                onChange={(e) => setForm({ ...form, givenName: e.target.value })}
                required
              />
            </div>
            <div style={fieldStyle}>
              <label className="field-label" htmlFor="familyName">Apellido</label>
              <input
                id="familyName"
                className="auth-input"
                type="text"
                placeholder="García"
                value={form.familyName}
                onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                required
              />
            </div>
          </div>
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
            />
          </div>
          <div style={fieldStyle}>
            <label className="field-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="auth-input"
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
            style={{ width: '100%', letterSpacing: '0.06em' }}
          >
            {loading ? 'Registrando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
