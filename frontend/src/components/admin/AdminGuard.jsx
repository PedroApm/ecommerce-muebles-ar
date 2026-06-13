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
    return <p style={{ padding: '40px', textAlign: 'center' }}>Cargando...</p>;
  }

  if (user === null) return null;

  if (!user.groups.includes('admin')) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
        <p style={{ marginBottom: '16px', fontSize: '16px' }}>
          Acceso denegado: esta sección es solo para administradores.
        </p>
        <Link href="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return children;
}
