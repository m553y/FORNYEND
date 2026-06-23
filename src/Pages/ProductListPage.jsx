import PageHeader from "../Components/PageHeader";
import { Icon } from "../Components/Icon";
import ProductCard from "../Components/ProductCard";

export default function ProductListPage({ title, products, favorites, search, onSearch, onBack, onCart, onFavorite, onProduct }) {
  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-16">
      <PageHeader title={title} onBack={onBack} right={<button type="button" onClick={onCart} className="text-[#27489f]"><Icon name="cart" className="h-8 w-8" /></button>} />
      <div className="mx-auto w-[min(1280px,calc(100%-80px))] max-sm:w-[calc(100%-32px)]">
        <label className="relative block">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"><Icon name="search" /></span>
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search..." className="h-[52px] w-full rounded-full border border-slate-300 bg-white pl-14 pr-4 outline-none" />
        </label>
        <div className="mt-9 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={onFavorite} onOpen={onProduct} />
          ))}
        </div>
      </div>
    </main>
  );
}
