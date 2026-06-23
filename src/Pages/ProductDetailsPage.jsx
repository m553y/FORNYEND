import { useEffect, useState } from "react";
import PageHeader from "../Components/PageHeader";
import ChatButton from "../Components/ChatButton";
import { Icon } from "../Components/Icon";
import { money } from "../utils/format";
import { productApi, reviewApi, isMongoId } from "../services/api";
import { normaliseProduct } from "../utils/productUtils";

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "text-[#f4c542]" : "text-slate-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.172c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.538 1.118L10 13.011l-3.455 2.041c-.783.57-1.838-.197-1.538-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.553 9.394c-.783-.57-.381-1.81.588-1.81h4.172a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetailsPage({
  product,
  user,
  favorite,
  onBack,
  onFavorite,
  onCart,
  onBuy,
  onChat,
}) {
  const [currentProduct, setCurrentProduct] = useState(product);
  const [color, setColor] = useState(product?.colors?.[0]);
  const [size, setSize] = useState(product?.sizes?.[2] ?? product?.sizes?.[0]);
  const [hero, setHero] = useState(product?.image);

  // ── Reviews state ──────────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const authorName =
    user?.username ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Anonymous";

  const reviewStorageKey = currentProduct?.id
    ? `cargo_reviews_${currentProduct.id}`
    : null;

  useEffect(() => {
    setCurrentProduct(product);
    setColor(product?.colors?.[0]);
    setSize(product?.sizes?.[2] ?? product?.sizes?.[0]);
    setHero(product?.image);
  }, [product]);

  useEffect(() => {
    if (!currentProduct?.id || !isMongoId(currentProduct.id)) return;

    let ignore = false;
    productApi
      .getById(currentProduct.id)
      .then((data) => {
        if (ignore) return;
        const refreshed = normaliseProduct(data);
        setCurrentProduct((prev) => ({
          ...prev,
          ...refreshed,
          id: refreshed.id || prev?.id,
        }));
      })
      .catch(() => {
        /* keep the current cached product if the API call fails */
      });

    return () => {
      ignore = true;
    };
  }, [currentProduct?.id]);

  useEffect(() => {
    if (!currentProduct?.id) return;

    try {
      const saved = localStorage.getItem(reviewStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
        }
      }
    } catch {
      setReviews([]);
    }
  }, [currentProduct?.id, reviewStorageKey]);

  useEffect(() => {
    if (!currentProduct?.id) return;
    if (!isMongoId(currentProduct.id)) {
      setReviewsLoading(false);
      return;
    }
    setReviewsLoading(true);
    reviewApi
      .getByProduct(currentProduct.id)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.reviews ?? []);
        setReviews((prev) => {
          const merged = [...list, ...prev].filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (entry) => (entry._id ?? entry.id) === (item._id ?? item.id),
              ),
          );
          return merged;
        });
      })
      .catch(() => setReviews((prev) => prev))
      .finally(() => setReviewsLoading(false));
  }, [currentProduct?.id]);

  useEffect(() => {
    if (!reviewStorageKey) return;
    localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
  }, [reviewStorageKey, reviews]);

  const submitReview = async (e) => {
    e.preventDefault();
    const comment = reviewForm.comment.trim();
    if (!comment) return setReviewError("Please write a comment.");
    setReviewError("");
    setSubmitting(true);

    if (!isMongoId(currentProduct?.id)) {
      // Simulate review locally for demo products
      setTimeout(() => {
        setReviews((prev) => [
          {
            id: Date.now(),
            user: { username: authorName },
            rating: reviewForm.rating,
            comment,
          },
          ...prev,
        ]);
        setReviewSuccess(true);
        setReviewForm({ rating: 5, comment: "" });
        setSubmitting(false);
      }, 600);
      return;
    }

    try {
      const createdData = await reviewApi.create({
        product: currentProduct.id,
        rating: reviewForm.rating,
        comment,
      });
      const createdReview =
        createdData?.review ??
        createdData?.data?.review ??
        createdData?.data ??
        createdData;
      const newReview = {
        ...(createdReview && (createdReview._id || createdReview.id)
          ? createdReview
          : {}),
        _id: createdReview?._id ?? createdReview?.id ?? `local-${Date.now()}`,
        product: currentProduct.id,
        rating: createdReview?.rating ?? reviewForm.rating,
        comment: createdReview?.comment ?? comment,
        user: createdReview?.user ?? { username: authorName },
      };
      setReviews((prev) => [newReview, ...prev]);
      setReviewSuccess(true);
      setReviewForm({ rating: 5, comment: "" });
      // Refresh reviews
      const data = await reviewApi.getByProduct(currentProduct.id);
      const list = Array.isArray(data) ? data : (data?.reviews ?? []);
      setReviews((prev) => {
        const merged = [...list, ...prev].filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (entry) => (entry._id ?? entry.id) === (item._id ?? item.id),
            ),
        );
        return merged;
      });
    } catch (err) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentProduct) return null;

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-28">
      <PageHeader title="All Categories" onBack={onBack} />

      <section className="mx-auto w-[min(1280px,calc(100%-80px))] max-sm:w-[calc(100%-32px)]">
        {/* ── Images ─────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_630px]">
          <div className="relative overflow-hidden rounded-[20px] bg-white p-5 shadow-sm">
            <button
              type="button"
              className="absolute left-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white text-[#27489f] shadow"
            >
              <Icon name="cart" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onFavorite(currentProduct.id)}
              className={`absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white shadow ${
                favorite ? "text-red-500" : "text-[#27489f]"
              }`}
            >
              <Icon name="heart" filled={favorite} />
            </button>
            <img
              src={hero || currentProduct.image}
              alt={currentProduct.name}
              className="h-[296px] w-full object-contain"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {(
              currentProduct.gallery ?? [
                currentProduct.image,
                currentProduct.image,
                currentProduct.image,
              ]
            ).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHero(img)}
                className="rounded-[20px] bg-white p-4 shadow-sm"
              >
                <img
                  src={img}
                  alt=""
                  className="h-[260px] w-full object-contain max-lg:h-36"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Info ───────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-2 border-b border-slate-300 pb-3">
          <div>
            <h1 className="text-[30px] font-bold">{currentProduct.name}</h1>
            <p className="text-sm text-slate-500">
              Review{" "}
              <span className="text-[#27489f]">({currentProduct.rating})</span>
            </p>
          </div>
          <p className="text-[30px] font-bold text-[#27489f]">
            {money(currentProduct.price)}
          </p>
          <p className="text-sm text-slate-500 line-through">
            {currentProduct.oldPrice} EGP
          </p>
        </div>

        <section className="border-b border-slate-300 py-3">
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="mt-2 text-lg text-slate-700">
            {currentProduct.description}
          </p>
        </section>

        {/* ── Color ──────────────────────────────────────── */}
        {currentProduct.colors?.length > 0 && (
          <section className="border-b border-slate-300 py-3">
            <h2 className="text-2xl font-semibold">Color</h2>
            <div className="mt-3 flex gap-4">
              {currentProduct.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-full ring-2 ring-offset-2 ${
                    color === c ? "ring-[#27489f]" : "ring-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label="Select color"
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Size ───────────────────────────────────────── */}
        {currentProduct.sizes?.length > 0 && (
          <section className="py-3">
            <h2 className="text-2xl font-semibold">Size</h2>
            <div className="mt-3 flex gap-4">
              {currentProduct.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`grid h-10 w-10 place-items-center rounded-full font-bold ${
                    size === s
                      ? "bg-[#27489f] text-white"
                      : "bg-[#e8eeff] text-[#27489f]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Reviews ────────────────────────────────────── */}
        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold">Reviews</h2>

          {reviewsLoading && (
            <p className="mt-4 text-slate-500">Loading reviews…</p>
          )}

          {!reviewsLoading && reviews.length === 0 && (
            <p className="mt-4 text-slate-400">No reviews yet. Be the first!</p>
          )}

          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div
                key={r._id ?? r.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#27489f]">
                    {r.user?.username ||
                      r.user?.name ||
                      r.user?.email ||
                      "Anonymous"}
                  </p>
                  <StarRow rating={r.rating} />
                </div>
                <p className="mt-2 text-slate-700">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* ── Leave a review form ─────────────────────── */}
          <form
            onSubmit={submitReview}
            className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
          >
            <h3 className="text-xl font-semibold">Leave a Review</h3>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                    className={`text-2xl ${
                      n <= reviewForm.rating
                        ? "text-[#f4c542]"
                        : "text-slate-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Comment
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                placeholder="Write your experience…"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#27489f] focus:ring-2 focus:ring-[#27489f]/20"
              />
            </div>

            {reviewError && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                {reviewError}
              </p>
            )}
            {reviewSuccess && (
              <p className="mt-2 text-sm font-semibold text-green-600">
                Review submitted! Thank you.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 h-10 rounded-full bg-[#27489f] px-8 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        </section>
      </section>

      {/* ── Sticky buy bar ─────────────────────────────────── */}
      <div className="fixed bottom-6 left-0 right-0 z-20 mx-auto flex w-[min(1280px,calc(100%-80px))] items-center gap-5 max-sm:w-[calc(100%-32px)]">
        <button
          type="button"
          onClick={() => onBuy(product, { color, size })}
          className="h-11 flex-1 rounded-full bg-[#27489f] font-bold text-white"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={() => onCart(product, { color, size })}
          className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#27489f] shadow"
        >
          <Icon name="cart" />
        </button>
      </div>

      <ChatButton onClick={onChat} />
    </main>
  );
}
