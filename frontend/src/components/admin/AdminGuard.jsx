import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/AuthContext';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/auth/login');
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-base)' }}>
        Cargando...
      </p>
    );
  }

  if (user === null) return null;

  if (!user.groups.includes('admin')) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface)', marginBottom: '8px' }}>
          Acceso denegado
        </p>
        <p style={{ fontSize: '15px', marginBottom: '24px' }}>
          Esta sección es solo para administradores.
        </p>
        <Link href="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return children;
}
