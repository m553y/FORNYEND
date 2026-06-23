import { useState } from "react";
import BrandLogo from "../Components/BrandLogo";
import FormField from "../Components/FormField";
import { validateEmail, validatePassword } from "../utils/validator";
import { authApi, saveToken, extractToken } from "../services/api";
import { mapApiUser } from "../utils/productUtils";

function AuthShell({ title, children }) {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#17191f]">
      <header className="h-[220px] rounded-br-[100px] bg-[#27489f] pt-14 text-center">
        <BrandLogo dark size="text-[76px] max-sm:text-[56px]" />
      </header>
      <section className="mx-auto w-[min(1280px,calc(100%-80px))] py-10 max-sm:w-[calc(100%-32px)]">
        <h1 className="text-[42px] font-bold">{title}</h1>
        {children}
      </section>
    </main>
  );
}

export function SignUpPage({ onSubmit, onLogin, onSocial }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) =>
    setForm((value) => ({ ...value, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim())
      return setError("Please enter your full name.");
    if (!validateEmail(form.email))
      return setError("Please enter a valid email.");
    if (!validatePassword(form.password))
      return setError("Password must be at least 8 characters and include a number.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      const username = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const data = await authApi.register({
        username,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        address: form.address.trim() || "Not provided",
        role: "seller",
      });

      const token = extractToken(data);
      if (token) saveToken(token);

      const user = mapApiUser(
        data?.user ?? {
          username,
          email: form.email.trim().toLowerCase(),
          address: form.address.trim() || "Not provided",
          role: "seller",
        }
      );

      onSubmit({ ok: true, user });
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign Up">
      <form onSubmit={submit} className="mt-10 space-y-7">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="First Name"
            placeholder="Enter First Name"
            value={form.firstName}
            onChange={update("firstName")}
          />
          <FormField
            label="Last Name"
            placeholder="Enter Last Name"
            value={form.lastName}
            onChange={update("lastName")}
          />
        </div>
        <FormField
          label="E-Mail"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={update("email")}
        />
        <FormField
          label="Password"
          placeholder="At least 8 characters with a number"
          type="password"
          value={form.password}
          onChange={update("password")}
        />
        <FormField
          label="Confirm Password"
          placeholder="Repeat your password"
          type="password"
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
        />

        {error ? <p className="font-semibold text-red-600">{error}</p> : null}

        <div className="flex items-center gap-4 text-[#27489f]">
          <span className="h-px flex-1 bg-[#27489f]" />
          Or
          <span className="h-px flex-1 bg-[#27489f]" />
        </div>

        <button
          disabled={loading}
          className="h-11 w-full rounded-full bg-[#27489f] font-bold text-white disabled:opacity-60"
        >
          {loading ? "Creating Account…" : "Sign Up"}
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onSocial("Google")}
            className="h-11 rounded-full border border-[#27489f] font-bold text-[#27489f]"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => onSocial("Facebook")}
            className="h-11 rounded-full border border-[#27489f] font-bold text-[#27489f]"
          >
            Facebook
          </button>
        </div>

        <p className="text-center">
          Have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="font-bold text-[#27489f]"
          >
            Log In
          </button>
        </p>
      </form>
    </AuthShell>
  );
}

export function LoginPage({ onSubmit, onSignup, onOtp, onSocial }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) =>
    setForm((value) => ({ ...value, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateEmail(form.email))
      return setError("Please enter a valid email.");
    if (!form.password.trim())
      return setError("Please enter your password.");

    setLoading(true);
    try {
      const data = await authApi.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const token = extractToken(data);
      if (token) saveToken(token);

      const user = mapApiUser(
        data?.user ?? { email: form.email.trim().toLowerCase() }
      );
      onSubmit({ ok: true, user });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Log In">
      <form onSubmit={submit} className="mt-16 space-y-7">
        <FormField
          label="E-Mail"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={update("email")}
        />
        <div>
          <FormField
            label="Password"
            placeholder="At least 8 characters with a number"
            type="password"
            value={form.password}
            onChange={update("password")}
          />
          <button
            type="button"
            onClick={() => onOtp(form.email)}
            className="mt-3 block w-full text-right text-sm text-[#17191f]"
          >
            Forget Password?
          </button>
        </div>

        {error ? <p className="font-semibold text-red-600">{error}</p> : null}

        <div className="flex items-center gap-4 text-[#27489f]">
          <span className="h-px flex-1 bg-[#27489f]" />
          Or
          <span className="h-px flex-1 bg-[#27489f]" />
        </div>

        <button
          disabled={loading}
          className="h-11 w-full rounded-full bg-[#27489f] font-bold text-white disabled:opacity-60"
        >
          {loading ? "Signing In…" : "Log In"}
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onSocial("Google")}
            className="h-11 rounded-full border border-[#27489f] font-bold text-[#27489f]"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => onSocial("Facebook")}
            className="h-11 rounded-full border border-[#27489f] font-bold text-[#27489f]"
          >
            Facebook
          </button>
        </div>

        <p className="text-center">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSignup}
            className="font-bold text-[#27489f]"
          >
            Sign Up
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
