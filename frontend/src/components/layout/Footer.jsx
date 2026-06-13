import Link from 'next/link';

const footerStyle = {
  borderTop: '1px solid var(--color-outline-variant)',
  backgroundColor: 'var(--color-surface-container-low)',
  marginTop: '80px',
  padding: '48px 0 0',
};

const innerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '40px',
  paddingBottom: '40px',
};

const logoStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '17px',
  color: 'var(--color-primary)',
  marginBottom: '8px',
  display: 'block',
};

const taglineStyle = {
  fontSize: '13px',
  color: 'var(--color-on-surface-variant)',
  lineHeight: '1.5',
};

const colTitleStyle = {
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '14px',
};

const colLinkStyle = {
  display: 'block',
  fontSize: '14px',
  color: 'var(--color-on-surface)',
  marginBottom: '10px',
  textDecoration: 'none',
  transition: 'color 150ms ease',
};

const bottomStyle = {
  borderTop: '1px solid var(--color-outline-variant)',
  padding: '16px 0',
  fontSize: '13px',
  color: 'var(--color-on-surface-variant)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '8px',
};

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div className="container">
        <div style={innerStyle}>
          <div>
            <span style={logoStyle}>Muebles &amp; Deco</span>
            <p style={taglineStyle}>
              Elegancia y confort<br />para tu hogar.
            </p>
          </div>

          <div>
            <p style={colTitleStyle}>Tienda</p>
            <Link href="/" style={colLinkStyle}>Catálogo</Link>
            <Link href="/favorites" style={colLinkStyle}>Favoritos</Link>
            <Link href="/cart" style={colLinkStyle}>Carrito</Link>
            <Link href="/checkout" style={colLinkStyle}>Checkout</Link>
          </div>

          <div>
            <p style={colTitleStyle}>Mi cuenta</p>
            <Link href="/profile" style={colLinkStyle}>Mi perfil</Link>
            <Link href="/auth/login" style={colLinkStyle}>Iniciar sesión</Link>
            <Link href="/auth/register" style={colLinkStyle}>Registrarse</Link>
          </div>
        </div>

        <div style={bottomStyle}>
          <span>Proyecto académico &copy; {new Date().getFullYear()}</span>
          <span>Hecho con Next.js &amp; AWS</span>
        </div>
      </div>
    </footer>
  );
}
