export default function BrandLogo({ dark = false, size = "text-6xl" }) {
  return (
    <span className={`cargo-logo ${dark ? "cargo-logo--on-dark" : "cargo-logo--on-light"} ${size} leading-none`}>
      CarGo
    </span>
  );
}
