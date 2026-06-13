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

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '28px',
  listStyle: 'none',
};

const authStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const greetingStyle = {
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
};

const dividerStyle = {
  width: '1px',
  height: '16px',
  backgroundColor: 'var(--color-outline-variant)',
};

export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header style={headerStyle}>
      <div className="container" style={innerStyle}>
        {/* Logo – always visible */}
        <Link href="/" className="vestar-logo">VESTAR</Link>

        {/* Mobile: greeting when logged in (hidden on desktop via CSS) */}
        {mounted && !loading && user && (
          <span className="header-mobile-greeting">Hola, {user.given_name}</span>
        )}

        {/* Desktop nav */}
        <nav className="nav-desktop" style={{ flex: 1 }}>
          <ul style={navStyle}>
            <li><Link href="/" className="nav-link">Catálogo</Link></li>
            <li><Link href="/favorites" className="nav-link">Favoritos</Link></li>
            <li><Link href="/cart" className="nav-link">Carrito</Link></li>
          </ul>
        </nav>

        {/* Desktop auth */}
        <div style={authStyle} className="auth-desktop">
          {!mounted || loading ? null : user ? (
            <>
              {user.groups?.includes('admin') && (
                <>
                  <Link href="/admin" className="nav-link" style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>Admin</Link>
                  <div style={dividerStyle} />
                </>
              )}
              <span style={greetingStyle}>Hola, {user.given_name}</span>
              <Link href="/profile" className="nav-link">Mi perfil</Link>
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
              <Link href="/auth/login" className="nav-link">Iniciar sesión</Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger (hidden on desktop via CSS) */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile backdrop – conditionally rendered */}
      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer – always in DOM so CSS transition works on close */}
      <div
        className={`mobile-sidebar${menuOpen ? ' mobile-sidebar--open' : ''}`}
        role="dialog"
        aria-modal={menuOpen}
        aria-label="Menú de navegación"
      >
        {/* Close button */}
        <button
          className="sidebar-close-btn"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/" className="sidebar-link">Catálogo</Link>
          <Link href="/favorites" className="sidebar-link">Favoritos</Link>
          <Link href="/cart" className="sidebar-link">Carrito</Link>
          {mounted && !loading && user?.groups?.includes('admin') && (
            <Link href="/admin" className="sidebar-link sidebar-link--admin">Admin</Link>
          )}
        </nav>

        {/* Auth footer pushed to bottom */}
        <div className="sidebar-auth-footer">
          {!mounted || loading ? null : user ? (
            <>
              <Link href="/profile" className="sidebar-link">Mi perfil</Link>
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
                style={{ width: '100%', fontSize: '14px' }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="sidebar-link">Iniciar sesión</Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center', fontSize: '14px' }}
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
