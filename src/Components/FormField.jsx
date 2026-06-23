export default function FormField({ label, error, icon, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[16px] font-medium text-[#17191f]">{label}</span>
      <span className="relative block">
        {icon ? <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span> : null}
        <input
          {...props}
          className={`h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-[15px] text-[#17191f] outline-none transition placeholder:text-slate-400 focus:border-[#27489f] focus:ring-2 focus:ring-[#27489f]/15 ${icon ? "pl-12" : ""} ${props.className || ""}`}
        />
      </span>
      {error ? <span className="mt-1 block text-sm font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
