import { useEffect, useMemo, useState } from "react";
import PageHeader from "../Components/PageHeader";
import { Icon } from "../Components/Icon";

const QUICK_PROMPTS = [
  "Which parts fit my car?",
  "What is the best tire for city driving?",
  "Can you check this damage photo?",
  "How do I install a headlight?",
];

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function makeReply(text) {
  const query = text.toLowerCase();

  if (
    query.includes("damage") ||
    query.includes("crack") ||
    query.includes("scratch") ||
    query.includes("dent")
  ) {
    return "I can help with that. If you upload a photo, I can identify the likely issue and suggest the right replacement parts. If you already know the problem, tell me the model and year too.";
  }

  if (
    query.includes("tire") ||
    query.includes("tyre") ||
    query.includes("wheel")
  ) {
    return "For tires and wheels, I usually recommend checking your vehicle size first. If you share the car model and driving style, I can suggest the most suitable options for comfort, safety, and budget.";
  }

  if (
    query.includes("fit") ||
    query.includes("compatible") ||
    query.includes("match")
  ) {
    return "Compatibility depends on your car model, year, trim, and engine type. I can narrow it down quickly if you tell me those details.";
  }

  if (
    query.includes("install") ||
    query.includes("replace") ||
    query.includes("change")
  ) {
    return "That’s a common question. Most replacements are straightforward, but some parts need extra care. I can walk you through the steps or tell you when it’s better to ask a technician.";
  }

  if (
    query.includes("price") ||
    query.includes("cost") ||
    query.includes("cheap") ||
    query.includes("budget")
  ) {
    return "Prices vary by brand, quality, and availability. I can help compare budget-friendly and premium options so you can choose what matches your needs.";
  }

  return "I’m here to help with parts, compatibility, maintenance tips, and damage checking. Tell me what you need, and I’ll guide you step by step.";
}

export default function ChatbotPage({ user, onBack, onAnalyze }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const firstName = user?.firstName || user?.name || "there";

  useEffect(() => {
    const welcome = {
      from: "bot",
      text: `Hi ${firstName}! I’m your AutoCare assistant. I can help you find parts, understand compatibility, and check what to do next.`,
      time: formatTime(new Date()),
    };
    setMessages([welcome]);
  }, [firstName]);

  const send = (draft = message) => {
    const text = draft.trim();
    if (!text) return;

    const now = new Date();
    setMessages((items) => [
      ...items,
      {
        from: "me",
        text,
        time: formatTime(now),
      },
    ]);
    setMessage("");
    setIsTyping(true);

    window.setTimeout(() => {
      setIsTyping(false);
      setMessages((items) => [
        ...items,
        {
          from: "bot",
          text: makeReply(text),
          time: formatTime(new Date()),
        },
      ]);
    }, 850);
  };

  const hasMessages = messages.length > 0;

  const quickPromptButtons = useMemo(() => QUICK_PROMPTS, []);

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-7">
      <PageHeader title="Chatbot" onBack={onBack} />

      <section className="mx-auto w-[min(1280px,calc(100%-80px))] max-sm:w-[calc(100%-32px)]">
        <div className="mx-auto max-w-5xl rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Support assistant
              </p>
              <h2 className="mt-1 text-lg font-bold text-[#1f3778]">
                AutoCare AI
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
              Online now
            </span>
          </div>

          <div className="h-[520px] space-y-4 overflow-y-auto px-5 py-6">
            {hasMessages ? (
              messages.map((item, index) => (
                <div
                  key={`${item.from}-${index}`}
                  className={`flex ${item.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                      item.from === "me"
                        ? "bg-[#27489f] text-white"
                        : "bg-[#eef3ff] text-[#1f3778]"
                    }`}
                  >
                    <p className="text-sm leading-6">{item.text}</p>
                    <span
                      className={`mt-2 block text-[11px] ${
                        item.from === "me" ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {item.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center">
                <h3 className="text-center text-2xl font-bold text-[#1f3778]">
                  Hi, {firstName}
                </h3>
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[#eef3ff] px-4 py-3 text-[#1f3778]">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#27489f]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#27489f] [animation-delay:0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#27489f] [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPromptButtons.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setMessages((items) => [
                    ...items,
                    {
                      from: "me",
                      text: "Voice note",
                      time: formatTime(new Date()),
                    },
                  ])
                }
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#27489f] shadow"
              >
                <Icon name="mic" />
              </button>

              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && send()}
                placeholder="Ask about parts, fit, pricing, or damage..."
                className="h-11 min-w-0 flex-1 rounded-full border border-[#27489f] bg-white px-4 outline-none"
              />

              <button
                type="button"
                onClick={message.trim() ? () => send() : onAnalyze}
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#27489f] shadow"
              >
                <Icon name={message.trim() ? "check" : "plus"} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
