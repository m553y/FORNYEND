import { Icon } from "./Icon";

export default function CheckoutStepper({ step = "payment" }) {
  const items = [
    ["cart", "cart", "cart"],
    ["shipping", "cart", "Shipping"],
    ["payment", "mail", "Payment"],
  ];
  return (
    <div className="flex items-center justify-center gap-3 text-[#004274]">
      {items.map(([id, icon, label], index) => (
        <div key={id} className="flex items-center gap-3">
          {index > 0 ? <span className="h-[3px] w-48 bg-[#70bd8e] max-md:w-16" /> : null}
          <span className="flex items-center gap-2 text-2xl">
            <Icon name={icon} />
            {label}
          </span>
          <span className={`h-4 w-4 rounded-full ${step === id ? "bg-[#70bd8e]" : "bg-[#70bd8e]"}`} />
        </div>
      ))}
    </div>
  );
}
