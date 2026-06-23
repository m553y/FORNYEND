import { Icon } from "./Icon";

export default function PageHeader({ title, onBack, right }) {
  return (
    <header className="mx-auto flex h-[112px] w-[min(1280px,calc(100%-80px))] items-center justify-between max-sm:w-[calc(100%-32px)]">
      <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center rounded-full text-[#27489f] hover:bg-[#edf3ff]" aria-label="Go back">
        <Icon name="back" className="h-8 w-8" />
      </button>
      <h1 className="text-center text-[32px] font-bold text-[#17191f] max-sm:text-2xl">{title}</h1>
      <div className="flex h-11 w-11 items-center justify-center">{right}</div>
    </header>
  );
}
