import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../Lib/auth";

function validateSignUp({ firstName, lastName, email, password, confirmPassword }) {
  const errors = {};

  if (!String(firstName).trim()) errors.firstName = "First name is required.";
  if (!String(lastName).trim()) errors.lastName = "Last name is required.";

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(normalizedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  const hasMinLength = String(password || "").length >= 8;
  const hasDigit = /\d/.test(String(password || ""));

  if (!password) {
    errors.password = "Password is required.";
  } else if (!hasMinLength || !hasDigit) {
    errors.password = "Password must be at least 8 characters and include a number.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

const inputClassName =
  "w-full rounded-full border border-[#c4c5ca] bg-transparent px-5 py-4 text-xl text-[#131720] placeholder:text-[#7c7d81] outline-none transition focus:border-[#2b468f] focus:ring-2 focus:ring-[#2b468f]/20";

export default function SignUpPage({ onSubmit, onSwitchToLogin, onSocialClick }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialNotice, setSocialNotice] = useState("");
  const [socialLoading, setSocialLoading] = useState("");

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
     

    const nextErrors = validateSignUp(form);
    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      };
      const result = onSubmit ? await onSubmit(payload) : registerUser(payload);

      if (result?.ok) {
        navigate("/home");
      } else {
        setServerError(result?.message || "Sign up failed.");
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
        setSocialNotice(result?.message || `${provider} sign up failed.`);
      }
    } catch {
      setSocialNotice(`${provider} sign up failed. Check your app configuration.`);
    } finally {
      setSocialLoading("");
    }
  };

  return (
    <main className="min-h-screen bg-[#e6e6e8] text-[#0f1117]">
      <header className="h-[13rem] rounded-br-[8rem] bg-[#27489f] px-6 pt-6 md:h-[15rem]">
        <div className="mx-auto flex h-full max-w-[110rem] items-start justify-center">
          <h1 className="cargo-logo cargo-logo--on-dark pt-4 text-[clamp(3.3rem,7vw,6rem)] leading-none">CarGo</h1>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[110rem] px-6 pb-20 pt-14 md:px-16">
        <h2 className="text-6xl font-semibold tracking-tight text-[#11131a] md:text-7xl">Sign Up</h2>

        <form onSubmit={handleSubmit} className="mt-14 space-y-8" noValidate>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-3 block text-2xl font-medium md:text-[2.1rem]">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange("firstName")}
                placeholder="Enter First Name"
                className={inputClassName}
                autoComplete="given-name"
              />
              {errors.firstName && <p className="mt-2 text-sm text-red-600 md:text-lg">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="mb-3 block text-2xl font-medium md:text-[2.1rem]">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange("lastName")}
                placeholder="Enter Last Name"
                className={inputClassName}
                autoComplete="family-name"
              />
              {errors.lastName && <p className="mt-2 text-sm text-red-600 md:text-lg">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-3 block text-2xl font-medium md:text-[2.1rem]">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="example@gmail.com"
              className={inputClassName}
              autoComplete="email"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600 md:text-lg">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-3 block text-2xl font-medium md:text-[2.1rem]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                placeholder="At least 8 - Digital Characters"
                className={`${inputClassName} pr-20`}
                autoComplete="new-password"
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

          <div>
            <label htmlFor="confirmPassword" className="mb-3 block text-2xl font-medium md:text-[2.1rem]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="At least 8 - Digital Characters"
                className={`${inputClassName} pr-20`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#27489f] md:text-base"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 md:text-lg">{errors.confirmPassword}</p>
            )}
          </div>

          {serverError && <p className="text-sm font-medium text-red-600 md:text-lg">{serverError}</p>}

          <div className="mt-2 flex items-center gap-6">
            <span className="h-[2px] flex-1 bg-[#27489f]" />
            <span className="text-4xl font-semibold text-[#27489f]">Or</span>
            <span className="h-[2px] flex-1 bg-[#27489f]" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full rounded-full bg-[#27489f] px-6 py-4 text-3xl font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>

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
            Have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin || (() => navigate("/login"))}
              className="font-semibold text-[#27489f] underline-offset-4 hover:underline"
            >
              Log In
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
