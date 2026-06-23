import { products as staticProducts } from "../Lib/appData";

/** Pull a flat product array from varied backend response shapes. */
export function extractProductList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.recommendations)) return data.recommendations;
  return [];
}

function extractImages(raw) {
  const fromColorImage = (raw.colorimage ?? [])
    .flatMap((entry) => entry?.images ?? [])
    .filter(Boolean);
  if (fromColorImage.length > 0) return fromColorImage;
  if (Array.isArray(raw.images)) return raw.images.filter(Boolean);
  if (Array.isArray(raw.gallery)) return raw.gallery.filter(Boolean);
  if (raw.image) return [raw.image];
  return [];
}

function extractColors(raw) {
  const fromColorImage = (raw.colorimage ?? [])
    .map((entry) => entry?.color)
    .filter(Boolean);
  if (fromColorImage.length > 0) return fromColorImage;
  if (typeof raw.colors === "string") {
    return raw.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  if (Array.isArray(raw.colors)) return raw.colors;
  return [];
}

/** Normalise a backend product to the shape expected by UI components. */
export function normaliseProduct(raw, index = 0) {
  const fallback = staticProducts[index % staticProducts.length];
  const images = extractImages(raw);
  const colors = extractColors(raw);
  const gallery =
    images.length > 0
      ? images
      : (raw.gallery ?? fallback.gallery ?? [fallback.image]);

  return {
    id: String(raw._id ?? raw.id ?? fallback.id),
    name: raw.name ?? fallback.name,
    description: raw.description ?? fallback.description,
    price: Number(raw.price ?? fallback.price),
    oldPrice: Number(raw.oldPrice ?? raw.old_price ?? fallback.oldPrice),
    rating: Number(
      raw.liveAverageRating ??
        raw.averageRating ??
        raw.rating ??
        fallback.rating,
    ),
    categoryId: String(
      raw.category ?? raw.categoryId ?? fallback.categoryId,
    ).toLowerCase(),
    image: images[0] ?? raw.image ?? fallback.image,
    gallery,
    colors: colors.length > 0 ? colors : fallback.colors,
    sizes: raw.sizes ?? fallback.sizes,
    stock: raw.stock,
  };
}

/** Map backend user document to frontend session shape. */
export function mapApiUser(raw) {
  const payload = raw?.user ?? raw?.data ?? raw;
  if (!payload) return null;
  const username = String(payload.username ?? "").trim();
  const parts = username.split(/\s+/).filter(Boolean);
  const firstName = payload.firstName || parts[0] || "User";
  const lastName = payload.lastName || parts.slice(1).join(" ") || "";

  return {
    id: String(payload._id ?? payload.id ?? ""),
    firstName,
    lastName,
    email: payload.email ?? "",
    role: payload.role ?? "seller",
    address: payload.address ?? "",
    username: username || `${firstName} ${lastName}`.trim(),
    phone: payload.phone ?? "",
    language: payload.language ?? "English",
  };
}
