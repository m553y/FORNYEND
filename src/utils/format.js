export function money(value) {
  return `EGP ${Number(value || 0).toLocaleString("en-US")}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
