import ProductCard from "../Components/ProductCard";

export default function FavoritesPage({ products, favorites, onFavorite, onProduct, onBrowse }) {
  const items = products.filter((product) => favorites.includes(product.id));
  return (
    <div className="mx-auto w-[min(1280px,calc(100%-80px))] pb-16 pt-10 max-sm:w-[calc(100%-32px)]">
      <h1 className="text-[30px] font-bold">All Categories</h1>
      {items.length ? (
        <div className="mt-7 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} favorite onFavorite={onFavorite} onOpen={onProduct} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[420px] place-items-center text-center">
          <div>
            <p className="text-3xl font-bold text-[#27489f]">No favorites yet</p>
            <button type="button" onClick={onBrowse} className="mt-5 h-11 rounded-full bg-[#27489f] px-10 font-bold text-white">Browse Products</button>
          </div>
        </div>
      )}
    </div>
  );
}
