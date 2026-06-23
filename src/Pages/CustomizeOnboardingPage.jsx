import onboardingCustomize from "../assets/image1.png";

function SlideDots({ onGoToPage }) {
  return (
    <div className="flex items-center gap-3">
      {[0, 1, 2].map((page) => (
        <button
          key={page}
          type="button"
          aria-label={`Go to slide ${page + 1}`}
          onClick={() => onGoToPage(page)}
          className={`h-2 w-16 rounded-full transition md:w-24 ${
            page === 1 ? "bg-white" : "bg-[#143370]"
          }`}
        />
      ))}
    </div>
  );
}

function NextButton({ onNext }) {
  return (
    <button
      type="button"
      aria-label="Next slide"
      onClick={onNext}
      className="flex h-16 w-16 items-center justify-center justify-self-end rounded-full bg-white shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition hover:scale-105 md:h-24 md:w-24"
    >
      <svg aria-hidden="true" className="h-9 w-9 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24">
        <path
          d="M8.5 4.5 16 12l-7.5 7.5"
          stroke="#264597"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.7"
        />
      </svg>
    </button>
  );
}

export default function CustomizeOnboardingPage({ onNext, onSkip, onGoToPage }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f7f8]">
      <div className="flex h-[48vh] min-h-[18rem] items-end justify-center px-4">
        <img
          src={onboardingCustomize}
          alt="Choose Customize Order"
          className="max-h-full w-full max-w-5xl object-contain"
        />
      </div>

      <section className="relative flex flex-1 flex-col rounded-tr-[7rem] bg-[#264597] px-6 pb-7 pt-9 text-center text-white md:rounded-tr-[14rem] md:px-24 md:pb-10 md:pt-12">
        <h1 className="text-[2rem] font-semibold leading-tight md:text-[3.5rem]">
          Choose Customize Order
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#d7def4] md:text-2xl md:leading-snug">
          Explore thousands of car accessories and customize your selection
          with ease.
        </p>

        <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-end gap-4 pt-8">
          <button
            type="button"
            onClick={onSkip}
            className="justify-self-start text-2xl font-semibold text-white transition hover:opacity-85 md:text-[2.5rem]"
          >
            Skip
          </button>

          <SlideDots onGoToPage={onGoToPage} />
          <NextButton onNext={onNext} />
        </div>
      </section>
    </main>
  );
}