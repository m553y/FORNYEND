import { useMemo, useRef, useState } from "react";
import PageHeader from "../Components/PageHeader";
import { Icon } from "../Components/Icon";
import FormField from "../Components/FormField";
import { validateEmail, validatePhone } from "../utils/validator";

const CODE = "821600";

function OtpArt() {
  return (
    <div className="relative mx-auto mt-8 h-[330px] w-[330px]">
      <div className="absolute inset-0 rounded-full border border-dashed border-[#83d8bd]" />
      <div className="absolute inset-8 rounded-full border border-dashed border-[#83d8bd]" />
      <div className="absolute left-1/2 top-8 h-60 w-36 -translate-x-1/2 rounded-[18px] border-4 border-slate-200 bg-[#e7e9ff]" />
      <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#16aa78] text-white">
        <Icon name="check" className="h-12 w-12" />
      </div>
      <div className="absolute bottom-10 left-1/2 h-8 w-28 -translate-x-1/2 bg-[#27489f]" />
    </div>
  );
}

export default function OtpPage({ initial = "", onBack, onDone }) {
  const [channel, setChannel] = useState(initial ? "email" : "phone");
  const [value, setValue] = useState(initial);
  const [step, setStep] = useState("request");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const refs = useRef([]);
  const code = useMemo(() => digits.join(""), [digits]);

  const request = () => {
    setError("");
    if (channel === "email" && !validateEmail(value)) return setError("Please enter a valid email.");
    if (channel === "phone" && !validatePhone(value)) return setError("Please enter a valid phone number.");
    setStep("verify");
    setDigits(["8", "2", "1", "6", "", ""]);
    setTimeout(() => refs.current[4]?.focus(), 50);
  };

  const verify = () => {
    if (code.length !== 6) return setError(`Demo OTP is ${CODE}.`);
    setSuccess(true);
  };

  const updateDigit = (index, raw) => {
    const clean = raw.replace(/\D/g, "").slice(-1);
    setDigits((items) => items.map((item, i) => (i === index ? clean : item)));
    if (clean && index < 5) refs.current[index + 1]?.focus();
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-8">
      <PageHeader title="OTP Process" onBack={step === "verify" ? () => setStep("request") : onBack} />
      <OtpArt />
      <section className="mx-auto mt-5 w-[min(1280px,calc(100%-80px))] text-center max-sm:w-[calc(100%-32px)]">
        <h2 className="text-[34px] font-bold">OTP Verification</h2>
        {step === "request" ? (
          <>
            <p className="mx-auto mt-2 max-w-[480px] text-lg text-slate-600">We will send you one-time password to your {channel === "phone" ? "mobile number" : "E-mail Address"}</p>
            <div className="mt-8 text-left">
              <FormField
                label={channel === "phone" ? "Phone Number" : "Email"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={channel === "phone" ? "+1 (555) 123-4567" : "emergency.adam@cityambulance.org"}
                icon={<Icon name={channel === "phone" ? "phone" : "mail"} />}
              />
            </div>
            <p className="mt-5 text-slate-600">Try with {channel === "phone" ? "E-mail Address" : "mobile number"}? <button type="button" onClick={() => { setChannel(channel === "phone" ? "email" : "phone"); setValue(""); }} className="font-bold text-[#27489f]">{channel === "phone" ? "Try E-mail" : "Try Mobile Number"}</button></p>
            {error ? <p className="mt-4 font-semibold text-red-600">{error}</p> : null}
            <button type="button" onClick={request} className="mt-20 h-[52px] w-full rounded-full bg-[#27489f] font-bold text-white">Get OTP</button>
          </>
        ) : (
          <>
            <p className="mt-2 text-lg text-slate-600">Enter the OTP sent to <b>{value || "+91 987987333"}</b></p>
            <div className="mt-8 flex justify-center gap-4">
              {digits.map((digit, index) => (
                <input key={index} ref={(node) => { refs.current[index] = node; }} value={digit} onChange={(event) => updateDigit(index, event.target.value)} className="h-[54px] w-[54px] rounded-2xl border border-slate-300 bg-white text-center text-2xl font-bold outline-none focus:border-[#27489f]" />
              ))}
            </div>
            <p className="mt-4 text-slate-600">Didn't you receive the OTP? <button type="button" onClick={request} className="font-bold text-[#27489f]">Resend OTP</button></p>
            {error ? <p className="mt-4 font-semibold text-red-600">{error}</p> : null}
            <button type="button" onClick={verify} className="mt-32 h-[52px] w-full rounded-full bg-[#27489f] font-bold text-white">Verify</button>
          </>
        )}
      </section>
      {success ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
          <div className="w-[630px] max-w-full rounded-[24px] bg-white p-6 text-center">
            <div className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-[#16aa78] text-white">
              <Icon name="check" className="h-24 w-24" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-[#27489f]">Password Changed!</h3>
            <p className="mt-4 text-slate-600">Your can now use your new password to login to your account.</p>
            <button type="button" onClick={onDone} className="mt-5 h-11 w-full rounded-full bg-[#27489f] font-bold text-white">Login</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
