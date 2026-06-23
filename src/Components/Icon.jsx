export function Icon({ name, className = "h-5 w-5", filled = false }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };

  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "search") {
    return <svg {...common}><path {...stroke} d="m20 20-4.3-4.3M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" /></svg>;
  }
  if (name === "cart") {
    return <svg {...common}><path {...stroke} d="M4 5h2.3l1.4 9.1a2 2 0 0 0 2 1.7h6.9a2 2 0 0 0 1.9-1.4l1.3-4.2H7.1" /><path {...stroke} d="M10 20h.01M17 20h.01" /></svg>;
  }
  if (name === "home") {
    return <svg {...common}><path {...stroke} d="M4 10.7 12 4l8 6.7V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.3Z" /></svg>;
  }
  if (name === "grid") {
    return <svg {...common}><path {...stroke} d="M5 5h5v5H5V5ZM14 5h5v5h-5V5ZM5 14h5v5H5v-5ZM14 14h5v5h-5v-5Z" /></svg>;
  }
  if (name === "heart") {
    return <svg {...common} fill={filled ? "currentColor" : "none"}><path {...stroke} d="M20.3 6.7a5 5 0 0 0-7.1 0L12 7.9l-1.2-1.2a5 5 0 1 0-7.1 7.1L12 22l8.3-8.2a5 5 0 0 0 0-7.1Z" /></svg>;
  }
  if (name === "user") {
    return <svg {...common}><path {...stroke} d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM4.8 20.3a7.2 7.2 0 0 1 14.4 0" /></svg>;
  }
  if (name === "back") {
    return <svg {...common}><path {...stroke} d="m15 18-6-6 6-6" /></svg>;
  }
  if (name === "plus") {
    return <svg {...common}><path {...stroke} d="M12 5v14M5 12h14" /></svg>;
  }
  if (name === "minus") {
    return <svg {...common}><path {...stroke} d="M6 12h12" /></svg>;
  }
  if (name === "eye") {
    return <svg {...common}><path {...stroke} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle {...stroke} cx="12" cy="12" r="2.5" /></svg>;
  }
  if (name === "mic") {
    return <svg {...common}><path {...stroke} d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" /><path {...stroke} d="M19 11a7 7 0 0 1-14 0M12 18v3" /></svg>;
  }
  if (name === "check") {
    return <svg {...common}><path {...stroke} d="m5 12 4 4L19 6" /></svg>;
  }
  if (name === "mail") {
    return <svg {...common}><path {...stroke} d="M4 6h16v12H4V6Z" /><path {...stroke} d="m4 7 8 6 8-6" /></svg>;
  }
  if (name === "phone") {
    return <svg {...common}><path {...stroke} d="M22 16.9v2.3a2 2 0 0 1-2.2 2A19.6 19.6 0 0 1 3 4.2 2 2 0 0 1 5 2h2.3a2 2 0 0 1 2 1.7l.4 2.6a2 2 0 0 1-.6 1.8L8 9.1a16 16 0 0 0 6.9 6.9l1-1a2 2 0 0 1 1.8-.6l2.6.4a2 2 0 0 1 1.7 2Z" /></svg>;
  }
  return <svg {...common}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9" /></svg>;
}

export function ChatFace({ className = "h-14 w-14" }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
      <path d="M37 29h18c11 0 20 9 20 20s-9 20-20 20H37c-11 0-20-9-20-20s9-20 20-20Z" fill="#f8fbff" />
      <circle cx="39" cy="49" r="4" fill="#27489f" />
      <circle cx="57" cy="49" r="4" fill="#27489f" />
      <path d="M42 60c4 3 10 3 14 0" stroke="#27489f" strokeWidth="4" strokeLinecap="round" />
      <path d="m73 20 3.4 8.2 8.6 3.3-8.6 3.3L73 43l-3.4-8.2-8.6-3.3 8.6-3.3L73 20Z" fill="#f8fbff" />
      <circle cx="23" cy="34" r="4" fill="#f8fbff" />
    </svg>
  );
}
