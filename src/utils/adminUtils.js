const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://cargo-project-production.up.railway.app/api"
).replace(/\/api\/?$/, "");

export function resolveImageUrl(image) {
  if (!image || typeof image !== "string") return null;
  if (
    image.startsWith("http") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }
  if (image.startsWith("/")) return `${API_ORIGIN}${image}`;
  return image;
}

export function productImage(product) {
  if (!product || typeof product !== "object") return null;
  const fromColor = product.colorimage?.[0]?.images?.[0];
  if (fromColor) return resolveImageUrl(fromColor);
  if (product.image) return resolveImageUrl(product.image);
  return null;
}

export function extractUsers(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function extractOrders(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function extractReviews(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.reviews)) return data.reviews;
  return [];
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const ORDER_STATUSES = ["pending", "shipping", "delivered"];
