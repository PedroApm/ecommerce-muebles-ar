import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/modules/auth/AuthContext';

const headerStyle = {
  backgroundColor: 'var(--color-surface-container-lowest)',
  borderBottom: '1px solid var(--color-outline-variant)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const innerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '64px',
  gap: '24px',
};

const logoStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '18px',
  color: 'var(--color-primary)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  listStyle: 'none',
};

const navLinkStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: 'var(--color-on-surface)',
  textDecoration: 'none',
};

const authStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  whiteSpace: 'nowrap',
};

const greetingStyle = {
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
};

export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header style={headerStyle}>
      <div className="container" style={innerStyle}>
        <Link href="/" style={logoStyle}>
          Muebles &amp; Deco
        </Link>

        <nav>
          <ul style={navStyle}>
            <li><Link href="/" style={navLinkStyle}>Catálogo</Link></li>
            <li><Link href="/favorites" style={navLinkStyle}>Favoritos</Link></li>
            <li><Link href="/cart" style={navLinkStyle}>Carrito</Link></li>
          </ul>
        </nav>

        <div style={authStyle}>
          {!mounted || loading ? null : user ? (
            <>
              {user.groups?.includes('admin') && (
                <Link href="/admin" style={navLinkStyle}>Admin</Link>
              )}
              <span style={greetingStyle}>Hola, {user.given_name}</span>
              <Link href="/profile" style={navLinkStyle}>Mi perfil</Link>
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={navLinkStyle}>Iniciar sesión</Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
