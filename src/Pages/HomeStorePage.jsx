import { useEffect, useState } from "react";
import { companies } from "../Lib/homeData";
import { money } from "../utils/format";
import ProductCard from "../Components/ProductCard";
import trendCarImage from "../assets/trend-car-01.png";
import { recommendApi } from "../services/api";
import { extractProductList, normaliseProduct } from "../utils/productUtils";

export default function HomeStorePage({
  products,
  favorites,
  onFavorite,
  onProduct,
  onLoadMore,
  canLoadMore,
  onBrand,
  isLoading,
  userId,
}) {
  const [trending, setTrending] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    setTrendLoading(true);
    recommendApi
      .trending(6)
      .then((data) => {
        const list = extractProductList(data).map(normaliseProduct);
        setTrending(list);
      })
      .catch(() => setTrending([]))
      .finally(() => setTrendLoading(false));
  }, []);

  useEffect(() => {
    if (!userId) {
      setPersonalized([]);
      return;
    }
    recommendApi
      .byUser(userId)
      .then((data) => {
        const list = extractProductList(data).map(normaliseProduct);
        setPersonalized(list.slice(0, 6));
      })
      .catch(() => setPersonalized([]));
  }, [userId]);

  const trendHighlight = trending[0];
  const trendPrice = trendHighlight?.price ?? 3500;

  return (
    <div className="mx-auto w-[min(1280px,calc(100%-80px))] pb-12 pt-10 max-sm:w-[calc(100%-32px)]">
      <section>
        <h1 className="text-[28px] font-bold">Global Company</h1>
        <div className="mt-7 flex gap-[18px] overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {companies.map((company) => (
            <button
              key={company.id}
              type="button"
              onClick={() => onBrand?.(company.name)}
              className="group flex w-[112px] shrink-0 flex-col items-center gap-3"
              aria-label={`Open ${company.name}`}
            >
              <span className="grid h-[112px] w-[112px] place-items-center rounded-full bg-[#e8eeff] transition group-hover:-translate-y-1">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-[70px] max-w-[84px] object-contain"
                />
              </span>
              <span className="text-[16px] font-bold text-[#3156aa]">{company.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="pt-8">
        <h2 className="text-[28px] font-bold">Trends</h2>
        <div className="relative mt-5 overflow-hidden rounded-[60px] bg-gradient-to-r from-slate-900 to-slate-500 p-8 shadow-sm">
          <img
            src={trendHighlight?.image ?? trendCarImage}
            alt={trendHighlight?.name ?? "Trending car"}
            className="h-[390px] w-full rounded-[46px] object-cover object-center max-md:h-[260px]"
          />
          <div className="absolute bottom-12 left-12 rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-[#27489f]">
            {trendHighlight
              ? `${trendHighlight.name} — ${money(trendPrice)}`
              : `Best offer starts at ${money(trendPrice)}`}
          </div>
        </div>

        {trendLoading ? (
          <p className="mt-4 text-slate-500">Loading trending products…</p>
        ) : trending.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {trending.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(product.id)}
                onFavorite={onFavorite}
                onOpen={onProduct}
              />
            ))}
          </div>
        ) : null}
      </section>

      {personalized.length > 0 ? (
        <section className="pt-8">
          <h2 className="text-[28px] font-bold">For You</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {personalized.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(product.id)}
                onFavorite={onFavorite}
                onOpen={onProduct}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="pt-8">
        <h2 className="text-[28px] font-bold">Best Price</h2>
        {isLoading ? (
          <p className="mt-6 text-slate-500">Loading products...</p>
        ) : products?.length === 0 ? (
          <p className="mt-6 text-center text-lg font-semibold text-red-500">
            No products found
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(product.id)}
                onFavorite={onFavorite}
                onOpen={onProduct}
              />
            ))}
          </div>
        )} 
        {canLoadMore && (
          <div className="mt-9 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              className="h-11 w-[270px] rounded-full bg-[#27489f] font-bold text-white"
            >
              Load More..
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
