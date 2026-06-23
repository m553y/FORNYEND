const USERS_KEY = "cargo_auth_users_v1";
const SESSION_KEY = "cargo_auth_session_v1";
const OTP_KEY = "cargo_auth_otp_v1";
const OTP_TTL_MS = 2 * 60 * 1000;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function toPublicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function readJson(key, fallbackValue) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallbackValue;

  try {
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readOtpStore() {
  const parsed = readJson(OTP_KEY, {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return parsed;
}

function writeOtpStore(store) {
  writeJson(OTP_KEY, store);
}

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `${"*".repeat(Math.max(digits.length - 3, 1))}${digits.slice(-3)}`;
}

function buildChallenge({ channel, value, userId }) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const now = Date.now();
  const id = `${now}-${Math.random().toString(16).slice(2, 8)}`;

  return {
    id,
    channel,
    value,
    maskedValue: channel === "email" ? maskEmail(value) : maskPhone(value),
    userId: userId ?? null,
    code,
    attempts: 0,
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
  };
}

export function readUsers() {
  const parsed = readJson(USERS_KEY, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: Number(item.id) || Date.now(),
      firstName: String(item.firstName || "").trim(),
      lastName: String(item.lastName || "").trim(),
      email: normalizeEmail(item.email),
      password: String(item.password || ""),
      createdAt: item.createdAt || new Date().toISOString(),
    }))
    .filter((item) => item.firstName && item.lastName && item.email && item.password);
}

function findUserByEmail(email) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;

  return readUsers().find((item) => item.email === cleanEmail) || null;
}

export function getSessionUser() {
  const parsed = readJson(SESSION_KEY, null);
  if (!parsed || typeof parsed !== "object") return null;

  const email = normalizeEmail(parsed.email);
  if (!email) return null;

  return {
    id: Number(parsed.id) || Date.now(),
    firstName: String(parsed.firstName || "").trim() || "User",
    lastName: String(parsed.lastName || "").trim() || "",
    email,
    createdAt: parsed.createdAt || new Date().toISOString(),
  };
}

export function registerUser({ firstName, lastName, email, password }) {
  const cleanFirstName = String(firstName || "").trim();
  const cleanLastName = String(lastName || "").trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");

  const users = readUsers();
  const exists = users.some((user) => user.email === cleanEmail);

  if (exists) {
    return {
      ok: false,
      message: "This email is already registered.",
    };
  }

  const nextUser = {
    id: Date.now(),
    firstName: cleanFirstName,
    lastName: cleanLastName,
    email: cleanEmail,
    password: cleanPassword,
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [...users, nextUser];
  writeJson(USERS_KEY, nextUsers);

  const sessionUser = toPublicUser(nextUser);
  writeJson(SESSION_KEY, sessionUser);

  return {
    ok: true,
    user: sessionUser,
  };
}

export function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");

  const users = readUsers();
  const user = users.find((item) => item.email === cleanEmail && item.password === cleanPassword);

  if (!user) {
    return {
      ok: false,
      message: "Invalid email or password.",
    };
  }

  const sessionUser = toPublicUser(user);
  writeJson(SESSION_KEY, sessionUser);

  return {
    ok: true,
    user: sessionUser,
  };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function requestOtp({ channel, value }) {
  const cleanChannel = channel === "email" ? "email" : "phone";
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    return { ok: false, message: "Value is required." };
  }

  if (cleanChannel === "email") {
    const user = findUserByEmail(cleanValue);

    const challenge = buildChallenge({
      channel: cleanChannel,
      value: normalizeEmail(cleanValue),
      userId: user?.id ?? null,
    });

    const store = readOtpStore();
    store[challenge.id] = challenge;
    writeOtpStore(store);

    return {
      ok: true,
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt,
      maskedValue: challenge.maskedValue,
      debugCode: challenge.code,
      message: `OTP has been sent to ${challenge.maskedValue}`,
    };
  }

  const challenge = buildChallenge({
    channel: cleanChannel,
    value: cleanValue,
    userId: null,
  });

  const store = readOtpStore();
  store[challenge.id] = challenge;
  writeOtpStore(store);

  return {
    ok: true,
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    maskedValue: challenge.maskedValue,
    debugCode: challenge.code,
    message: `OTP has been sent to ${challenge.maskedValue}`,
  };
}

export function verifyOtp({ challengeId, code }) {
  const store = readOtpStore();
  const challenge = store[challengeId];

  if (!challenge) {
    return { ok: false, message: "OTP session not found. Request a new OTP." };
  }

  if (Date.now() > challenge.expiresAt) {
    delete store[challengeId];
    writeOtpStore(store);
    return { ok: false, message: "OTP expired. Please request a new one." };
  }

  const cleanCode = String(code || "").trim();
  if (cleanCode !== challenge.code) {
    challenge.attempts = Number(challenge.attempts || 0) + 1;

    if (challenge.attempts >= 5) {
      delete store[challengeId];
      writeOtpStore(store);
      return { ok: false, message: "Too many attempts. Request a new OTP." };
    }

    store[challengeId] = challenge;
    writeOtpStore(store);
    return { ok: false, message: "Incorrect OTP code." };
  }

  delete store[challengeId];
  writeOtpStore(store);

  if (challenge.userId) {
    const user = readUsers().find((item) => item.id === challenge.userId);
    if (user) {
      const sessionUser = toPublicUser(user);
      writeJson(SESSION_KEY, sessionUser);
      return { ok: true, user: sessionUser, message: "OTP verified successfully." };
    }
  }

  return { ok: true, user: null, message: "OTP verified successfully." };
}
