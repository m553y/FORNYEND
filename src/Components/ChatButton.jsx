import { ChatFace } from "./Icon";

export default function ChatButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-20 right-20 z-30 grid h-[120px] w-[120px] place-items-center rounded-full bg-[#27489f] text-white shadow-[0_18px_30px_rgba(15,23,42,.24)] transition hover:scale-105 max-lg:right-8 max-lg:h-24 max-lg:w-24 ${className}`}
      aria-label="Open chatbot"
    >
      <ChatFace />
    </button>
  );
}
