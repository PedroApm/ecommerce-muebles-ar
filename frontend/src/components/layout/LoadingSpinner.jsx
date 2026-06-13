export default function LoadingSpinner({ size = 40 }) {
  const s = typeof size === 'number' ? `${size}px` : size;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
    }}>
      <div style={{
        width: s,
        height: s,
        borderRadius: '50%',
        border: '3px solid var(--color-outline-variant)',
        borderTop: '3px solid var(--color-primary)',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}
