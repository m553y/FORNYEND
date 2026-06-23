import BrandLogo from "./BrandLogo";
import { Icon } from "./Icon";

const baseNav = [
  { id: "home", label: "Home", icon: "home" },
  { id: "categories", label: "Categories", icon: "grid" },
  { id: "favorites", label: "Favorites", icon: "heart" },
  { id: "profile", label: "Profile", icon: "user" },
];

export default function TopBar({ active, search, cartCount, onSearch, onNavigate, onCart, showAdmin }) {
  const nav = showAdmin
    ? [...baseNav, { id: "admin", label: "Admin", icon: "grid" }]
    : baseNav;
  return (
    <header className="relative bg-[#fbfbfc]">
      <div className="rounded-br-[92px] bg-[#27489f] px-6 pb-7 pt-8 shadow-sm">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-7">
          <button type="button" onClick={() => onNavigate("home")} aria-label="Go home">
            <BrandLogo dark size="text-[58px]" />
          </button>
          <div className="flex w-full items-center gap-5">
            <label className="relative min-w-0 flex-1">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                <Icon name="search" />
              </span>
              <input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search..."
                className="h-[52px] w-full rounded-full border border-slate-200 bg-white pl-14 pr-5 text-[14px] outline-none"
              />
            </label>
            <button
              type="button"
              onClick={onCart}
              className="relative grid h-[52px] w-[52px] place-items-center rounded-full bg-white text-[#27489f]"
              aria-label="Open cart"
            >
              <Icon name="cart" className="h-8 w-8" />
              {cartCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{cartCount}</span> : null}
            </button>
          </div>
        </div>
      </div>

      <nav className="mt-7 flex justify-center px-4">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-[#27489f] bg-white p-1 shadow-[0_14px_28px_rgba(15,23,42,.18)] no-scrollbar">
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex h-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${isActive ? "gap-2 bg-[#27489f] px-4 text-white" : "w-11 border border-[#27489f] text-[#27489f] hover:bg-[#edf3ff]"}`}
                title={item.label}
              >
                <Icon name={item.icon} filled={item.id === "favorites" && isActive} />
                <span className={isActive ? "" : "sr-only"}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
