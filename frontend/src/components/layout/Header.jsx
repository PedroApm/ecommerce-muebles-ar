import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/modules/auth/AuthContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  function handleLogout() {
    logout();
    router.push('/');
  }

  const isAdmin = user?.groups?.includes('admin');

  return (
    <>
      {/* ── Barra superior ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '60px',
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-outline-variant)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Izquierda: logo */}
        <Link href="/" style={{ fontWeight: 'bold', color: 'var(--color-primary)', textDecoration: 'none' }}>
          VESTAR
        </Link>

        {/* Centro: saludo (mobile) + nav (desktop) */}
        {user && (
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Hola, {user.given_name}
          </span>
        )}

        {/* Derecha desktop: nav + auth */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '20px',
        }} className="header-desktop-nav">
          <Link href="/" style={navLinkStyle}>Catálogo</Link>
          <Link href="/favorites" style={navLinkStyle}>Favoritos</Link>
          <Link href="/cart" style={navLinkStyle}>Carrito</Link>
          {isAdmin && (
            <Link href="/admin" style={{ ...navLinkStyle, color: 'var(--color-secondary)', fontWeight: '600' }}>Admin</Link>
          )}
          {user ? (
            <>
              <Link href="/profile" style={navLinkStyle}>Mi perfil</Link>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '6px 14px', fontSize: '13px' }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={navLinkStyle}>Iniciar sesión</Link>
              <Link href="/auth/register" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                Registrarse
              </Link>
            </>
          )}
        </nav>

        {/* Derecha mobile: hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="header-mobile-hamburger"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* ── Sidebar + overlay (solo mobile, solo cuando menuOpen) ── */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 199,
              animation: 'fadeIn 0.25s ease',
            }}
          />

          {/* Sidebar */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '280px',
            backgroundColor: 'var(--color-surface)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 16px',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
            animation: 'slideInRight 0.25s ease',
          }}>
            {/* Botón cerrar */}
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
              style={{
                alignSelf: 'flex-end',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-text)',
                marginBottom: '16px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Links de navegación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link href="/" className="sidebar-link">Catálogo</Link>
              <Link href="/favorites" className="sidebar-link">Favoritos</Link>
              <Link href="/cart" className="sidebar-link">Carrito</Link>
              {isAdmin && (
                <Link href="/admin" className="sidebar-link sidebar-link--admin">Admin</Link>
              )}
            </div>

            {/* Divisor */}
            <div style={{ borderTop: '1px solid var(--color-outline-variant)', margin: '16px 0' }} />

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/profile" className="sidebar-link">Mi perfil</Link>
                <button
                  className="btn btn-secondary"
                  onClick={handleLogout}
                  style={{ width: '100%', fontSize: '14px' }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/auth/login" className="sidebar-link">Iniciar sesión</Link>
                <Link href="/auth/register" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', fontSize: '14px' }}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @media (min-width: 640px) {
          .header-desktop-nav {
            display: flex !important;
          }
          .header-mobile-hamburger {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

const navLinkStyle = {
  textDecoration: 'none',
  color: 'var(--color-text)',
  fontSize: '14px',
};

