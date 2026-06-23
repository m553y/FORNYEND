import { money } from "../utils/format";
import { Icon } from "./Icon";

export default function ProductCard({ product, favorite, onOpen, onFavorite, compact = false }) {
  return (
    <article className="relative rounded-[18px] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,.08)] ring-1 ring-slate-100">
      <button
        type="button"
        onClick={() => onFavorite(product.id)}
        className={`absolute right-4 top-4 z-10 grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm ${favorite ? "text-red-500" : "text-[#27489f]"}`}
        aria-label="Toggle favorite"
      >
        <Icon name="heart" filled={favorite} className="h-[18px] w-[18px]" />
      </button>
      <button type="button" onClick={() => onOpen(product)} className="block w-full text-left">
        <div className={`flex items-center justify-center ${compact ? "h-[120px]" : "h-[150px]"}`}>
          <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
        </div>
        <h3 className="mt-3 truncate text-[15px] font-bold text-[#17191f]">{product.name}</h3>
        <div className="mt-2 h-px bg-slate-200" />
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-[16px] font-bold text-[#27489f]">{money(product.price)}</span>
          <span className="text-[10px] text-slate-500 line-through">{product.oldPrice} EGP</span>
        </p>
        <p className="mt-1 text-[12px] text-slate-500">Review <span className="text-[#27489f]">({product.rating})</span></p>
      </button>
    </article>
  );
}
