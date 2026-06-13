import ProductCard from './ProductCard';

const emptyStyle = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '64px 0',
  color: 'var(--color-on-surface-variant)',
};

export default function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.length === 0 ? (
        <p style={emptyStyle}>No hay productos en esta categoría.</p>
      ) : (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
