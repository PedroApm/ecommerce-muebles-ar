import ProductCard from './ProductCard';

const emptyStyle = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '64px 0',
  color: 'var(--color-on-surface-variant)',
};

export default function ProductGrid({ products, favoriteIds, onToggleFavorite }) {
  return (
    <div className="product-grid">
      {products.length === 0 ? (
        <p style={emptyStyle}>No hay productos en esta categoría.</p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favoriteIds ? favoriteIds.has(product.id) : false}
            onToggleFavorite={onToggleFavorite}
          />
        ))
      )}
    </div>
  );
}
