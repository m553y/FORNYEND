import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Lib/auth";
const inputClassName =
  "w-full rounded-full border border-[#c4c5ca] bg-transparent px-5 py-4 text-xl text-[#131720] placeholder:text-[#7c7d81] outline-none transition focus:border-[#2b468f] focus:ring-2 focus:ring-[#2b468f]/20";

function validateLogin({ email, password }) {
  const errors = {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 

  if (!normalizedEmail) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(normalizedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!String(password || "").trim()) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginPage({
  onSubmit,
  onSwitchToSignUp,
  onSocialClick,
  onSwitchToOtp,
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialNotice, setSocialNotice] = useState("");
  const [socialLoading, setSocialLoading] = useState("");

  const hasValidShape = useMemo(() => {
    const previewErrors = validateLogin({ email, password });
    return Object.keys(previewErrors).length === 0;
  }, [email, password]);

  const clearFieldError = (field) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    setSocialNotice("");

    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = onSubmit
        ? await onSubmit({ email, password })
        : loginUser({ email, password });

      if (result?.ok) {
        navigate("/home");
      } else {
        setServerError(result?.message || "Login failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocial = async (provider) => {
    setServerError("");
    setSocialNotice("");
    setSocialLoading(provider);

    try {
      const result = await onSocialClick?.(provider);
      if (!result?.ok) {
        setSocialNotice(result?.message || `${provider} login failed.`);
      }
    } catch {
      setSocialNotice(`${provider} login failed. Check your app configuration.`);
    } finally {
      setSocialLoading("");
    }
  };

  return (
    <main className="min-h-screen bg-[#e6e6e8] text-[#0f1117]">
      <header className="h-[13rem] rounded-br-[8rem] bg-[#27489f] px-6 pt-6 md:h-[15rem]">
        <div className="mx-auto flex h-full max-w-[110rem] items-start justify-center">
          <h1 className="cargo-logo cargo-logo--on-dark pt-4 text-[clamp(3.3rem,7vw,6rem)] leading-none">
            CarGo
          </h1>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[110rem] px-6 pb-20 pt-14 md:px-16">
        <h2 className="text-6xl font-semibold tracking-tight text-[#11131a] md:text-7xl">Log In</h2>

        <form onSubmit={handleSubmit} className="mt-14 space-y-8" noValidate>
          <div>
            <label htmlFor="loginEmail" className="mb-3 block text-2xl font-medium md:text-[2.1rem]">
              E-Mail
            </label>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              placeholder="example@gmail.com"
              className={inputClassName}
              autoComplete="email"
              required
            />
            {errors.email && <p className="mt-2 text-sm text-red-600 md:text-lg">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="loginPassword" className="mb-3 block text-2xl font-medium md:text-[2.1rem]">
              Password
            </label>
            <div className="relative">
              <input
                id="loginPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                placeholder="At least 8 - Digital Characters"
                className={`${inputClassName} pr-20`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#27489f] md:text-base"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-600 md:text-lg">{errors.password}</p>}
          </div>

          {serverError && <p className="text-sm font-medium text-red-600 md:text-lg">{serverError}</p>}

          <div className="mt-2 flex items-center gap-6">
            <span className="h-[2px] flex-1 bg-[#27489f]" />
            <span className="text-4xl font-semibold text-[#27489f]">Or</span>
            <span className="h-[2px] flex-1 bg-[#27489f]" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasValidShape}
            className="w-full rounded-full bg-[#27489f] px-6 py-4 text-3xl font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing In..." : "Log In"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                if (onSwitchToOtp) {
                  onSwitchToOtp({ email });
                  return;
                }
                const cleanEmail = email.trim();
                navigate(cleanEmail ? `/otp?email=${encodeURIComponent(cleanEmail)}` : "/otp");
              }}
              className="text-lg font-semibold text-[#27489f] underline-offset-4 hover:underline md:text-2xl"
            >
              Verify with OTP Process
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSocial("Google")}
              disabled={Boolean(socialLoading)}
              className="rounded-full border-2 border-[#27489f] bg-transparent px-6 py-4 text-3xl font-semibold text-[#27489f] transition hover:bg-[#27489f]/8 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {socialLoading === "Google" ? "Connecting..." : "Google"}
            </button>
            <button
              type="button"
              onClick={() => handleSocial("Facebook")}
              disabled={Boolean(socialLoading)}
              className="rounded-full border-2 border-[#27489f] bg-transparent px-6 py-4 text-3xl font-semibold text-[#27489f] transition hover:bg-[#27489f]/8 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {socialLoading === "Facebook" ? "Connecting..." : "Facebook"}
            </button>
          </div>

          {socialNotice && <p className="text-center text-sm text-[#27489f] md:text-lg">{socialNotice}</p>}

          <p className="pt-4 text-center text-2xl text-[#1f2430] md:text-4xl">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={navigate.bind(null, "/signup")}
              className="font-semibold text-[#27489f] underline-offset-4 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
