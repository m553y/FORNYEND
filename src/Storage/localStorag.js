export const STORAGE_KEYS = {
  user: "cargo_user_v2",
  users: "cargo_users_v2",
  cart: "cargo_cart_v2",
  favorites: "cargo_favorites_v2",
  orders: "cargo_orders_v2",
  onboarded: "cargo_onboarded_v2",
  token: "cargo_token_v1",
};

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function clearStore(key) {
  localStorage.removeItem(key);
}
