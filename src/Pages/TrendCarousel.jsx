import { useEffect, useState } from "react";
import { trendCars } from "../Lib/homeData";

export default function TrendCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const nextIndex = (activeIndex + 1) % trendCars.length;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % trendCars.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative mt-6">
      <div className="relative h-[260px] overflow-hidden sm:h-[390px] lg:h-[505px]">
        <div className="absolute inset-y-0 left-0 right-[76px] overflow-hidden rounded-[34px] shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:right-[92px] sm:rounded-[54px] lg:rounded-[70px]">
          {trendCars.map((car, index) => (
            <img
              key={car.id}
              src={car.image}
              alt={car.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                index === activeIndex ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
            />
          ))}
        </div>

        <div className="absolute inset-y-5 right-0 w-16 overflow-hidden rounded-l-[52px] rounded-r-[6px] sm:w-20 lg:w-24">
          <img
            src={trendCars[nextIndex].image}
            alt=""
            className="h-full w-[460px] max-w-none object-cover object-left opacity-95"
          />
        </div>

        <button
          type="button"
          aria-label="Open chatbot"
          onClick={() => window.dispatchEvent(new CustomEvent("cargo:toggle-chat"))}
          className="absolute right-3 top-1/2 z-10 grid h-[86px] w-[86px] -translate-y-1/2 place-items-center rounded-full bg-[#27489f] text-white shadow-[0_16px_28px_rgba(19,45,114,0.28)] transition hover:-translate-y-[54%] hover:brightness-110 sm:right-9 sm:h-[112px] sm:w-[112px]"
        >
         
        </button>
      </div>
    </div>
  );
}
