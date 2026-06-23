export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim().toLowerCase());
}

export function validatePassword(password) {
  const value = String(password || "");
  return value.length >= 8 && /\d/.test(value);
}

export function validatePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}
