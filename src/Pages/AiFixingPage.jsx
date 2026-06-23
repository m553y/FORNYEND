import { useEffect, useRef, useState } from "react";
import PageHeader from "../Components/PageHeader";
import ProductCard from "../Components/ProductCard";
import trendCar01 from "../assets/trend-car-01.png";
import { damageApi, recommendApi } from "../services/api";
import { extractProductList, normaliseProduct } from "../utils/productUtils";

export default function AiFixingPage({
  products,
  favorites,
  onBack,
  onProduct,
  onFavorite,
}) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    const damageKey = result?.damage_type ?? result?.label ?? "";
    if (!damageKey) {
      setRecommended([]);
      return;
    }

    setRecLoading(true);
    recommendApi
      .byContent(damageKey)
      .then((data) => {
        const list = extractProductList(data).map(normaliseProduct);
        setRecommended(list.slice(0, 6));
      })
      .catch(() => setRecommended([]))
      .finally(() => setRecLoading(false));
  }, [result]);

  const localSuggested = products
    .filter((p) =>
      result?.damage_type || result?.label
        ? p.name
            .toLowerCase()
            .includes(
              (result?.damage_type ?? result?.label ?? "").toLowerCase(),
            ) ||
          p.categoryId
            ?.toLowerCase()
            .includes(
              (result?.damage_type ?? result?.label ?? "").toLowerCase(),
            )
        : p.categoryId === "headlights",
    )
    .slice(0, 6);

  const displayProducts =
    recommended.length > 0
      ? recommended
      : localSuggested.length > 0
        ? localSuggested
        : products.filter((p) => p.categoryId === "headlights").slice(0, 6);

  const damageLabel = result?.damage_type ?? result?.label;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setRecommended([]);
    setPreview(URL.createObjectURL(file));

    setLoading(true);
    damageApi
      .detect(file)
      .then((data) => {
        const payload = data?.data ?? data;
        setResult(payload || null);
      })
      .catch((err) => {
        setError(
          err.message || "Damage detection failed. Please try another image.",
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-7">
      <PageHeader title="Chatbot" onBack={onBack} />

      <section className="mx-auto w-[min(1280px,calc(100%-80px))] max-sm:w-[calc(100%-32px)]">
        <div className="grid grid-cols-2 gap-16 max-lg:grid-cols-1">
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative w-full overflow-hidden rounded-[18px] bg-slate-100 transition hover:brightness-95"
            >
              <img
                src={preview ?? trendCar01}
                alt="Car to analyse"
                className="h-[300px] w-full rounded-[18px] object-cover object-left-top"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#27489f]">
                  Upload Image
                </span>
              </span>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-4 h-10 w-full rounded-full bg-[#27489f] text-sm font-bold text-white"
            >
              {loading ? "Analysing…" : "Upload & Detect Damage"}
            </button>

            {error && (
              <p className="mt-3 text-center text-sm font-semibold text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="relative inline-block">
              <img
                src={preview ?? trendCar01}
                alt="AI damage result"
                className="h-[310px] rounded-[18px] object-cover object-right-top"
              />
              {loading && (
                <span className="absolute right-5 top-5 rounded-full bg-[#27489f] px-4 py-2 font-bold text-white animate-pulse">
                  Analysing…
                </span>
              )}
              {damageLabel && !loading && (
                <span className="absolute right-5 top-5 rounded-full bg-[#f4c542] px-4 py-2 font-bold text-white">
                  {damageLabel}
                </span>
              )}
            </div>

            {result && !loading && (
              <p className="mt-5 inline-block rounded-full bg-[#e8eeff] px-5 py-2 font-bold text-[#27489f]">
                {result.description ??
                  `${damageLabel} damage detected. Needs fixing.`}
              </p>
            )}

            {!result && !loading && (
              <p className="mt-5 inline-block rounded-full bg-[#e8eeff] px-5 py-2 font-bold text-[#27489f]">
                Upload a car photo to detect damage
              </p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#17191f]">
            {result ? "Recommended Parts" : "Popular Parts"}
          </h2>
          {recLoading ? (
            <p className="mt-4 text-slate-500">Loading recommendations…</p>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(product.id)}
                onOpen={onProduct}
                onFavorite={onFavorite}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
