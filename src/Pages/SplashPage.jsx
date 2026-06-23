import BrandLogo from "../Components/BrandLogo";

export default function SplashPage({ variant = "dark" }) {
  const dark = variant === "dark";
  return (
    <main className={`grid min-h-screen place-items-center ${dark ? "bg-[#27489f]" : "bg-[#f7f7f8]"}`}>
      <BrandLogo dark={dark} size="text-[96px] max-sm:text-[64px]" />
    </main>
  );
}
