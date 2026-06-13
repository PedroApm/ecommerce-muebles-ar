import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
