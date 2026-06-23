import { Icon } from "./Icon";

export default function CategoryCard({ category, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(category)} className="relative rounded-[18px] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,.08)] ring-1 ring-slate-100 transition hover:-translate-y-1">
      <span className="absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full bg-white text-[#27489f] shadow">
        <Icon name="eye" className="h-4 w-4" />
      </span>
      <div className="flex h-[150px] items-center justify-center">
        <img src={category.image} alt={category.title} className="h-full w-full object-contain" />
      </div>
      <div className="mt-2 h-px bg-slate-200" />
      <p className="mt-2 text-center text-[22px] font-bold text-[#27489f]">{category.title}</p>
    </button>
  );
}
