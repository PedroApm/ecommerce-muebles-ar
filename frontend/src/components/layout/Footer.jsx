const footerStyle = {
  borderTop: '1px solid var(--color-outline-variant)',
  marginTop: '64px',
  padding: '32px 0',
  textAlign: 'center',
  fontSize: '14px',
  color: 'var(--color-on-surface-variant)',
};

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div className="container">
        Muebles &amp; Deco &mdash; Proyecto académico &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
