import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';

function ShopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Layout({ children }) {
  const router = useRouter();
  const p = router.pathname;

  return (
    <>
      <Header />
      <main
        className="container main-with-bottom-nav"
        style={{ paddingTop: '40px', paddingBottom: '40px' }}
      >
        {children}
      </main>
      <Footer />

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav" aria-label="Navegación principal">
        <Link href="/" className={`bottom-nav-item${p === '/' ? ' active' : ''}`}>
          <ShopIcon />
          <span>Tienda</span>
        </Link>
        <Link href="/favorites" className={`bottom-nav-item${p === '/favorites' ? ' active' : ''}`}>
          <HeartIcon filled={p === '/favorites'} />
          <span>Favoritos</span>
        </Link>
        <Link href="/cart" className={`bottom-nav-item${p === '/cart' ? ' active' : ''}`}>
          <CartIcon />
          <span>Carrito</span>
        </Link>
        <Link href="/profile" className={`bottom-nav-item${p === '/profile' ? ' active' : ''}`}>
          <UserIcon />
          <span>Perfil</span>
        </Link>
      </nav>
    </>
  );
}
