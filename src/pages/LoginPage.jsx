import React from "react";
import whiteLogo from "../../logo_chat_white.svg";
import { loginTranslations } from "../loginData.js";

export default function LoginPage({ language = "EN", onChangeLanguage, email, password, showPassword, onChangeEmail, onChangePassword, onTogglePassword, onSubmit, onForgotPassword, onRegister, error, loading }) {
  const copy = loginTranslations[language] || loginTranslations.EN;

  return (
    <div className="flex h-screen w-full bg-[#f4f7ff] text-[#111827]">
      <div className="hidden w-[42%] bg-[linear-gradient(160deg,#2563eb_0%,#1d4ed8_45%,#0f172a_100%)] px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <img src={whiteLogo} alt="TODO" className="h-9 w-auto object-contain" />
        </div>
        <div className="max-w-[420px]">
          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] inline-flex">{copy.badge}</div>
          <div className="mt-7 text-[44px] font-semibold leading-[1.05] tracking-[-0.04em]">{copy.heroTitle}</div>
          <div className="mt-4 text-[15px] leading-[1.6] text-white/75">{copy.heroText}</div>
        </div>
        <div className="text-[13px] text-white/70">{copy.heroFooter}</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-[440px] rounded-[28px] border border-[#e6ebf4] bg-white p-8 shadow-[0_30px_80px_rgba(37,99,235,0.12)] sm:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <img src={whiteLogo} alt="TODO" className="h-9 w-auto object-contain invert" />
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-full border border-[#dbe4f0] bg-[#f8fbff] p-1 text-[12px] font-semibold text-[#64748b]">
              {[["EN", "English"], ["TR", "Türkçe"], ["AZ", "Azərbaycan"], ["RU", "Русский"]].map(([code, label]) => (
                <button key={code} type="button" onClick={() => onChangeLanguage(code)} className={`rounded-full px-3 py-1 transition ${language === code ? "bg-[#2563eb] text-white" : "text-[#64748b] hover:bg-white"}`} title={label}>
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-[34px] font-semibold tracking-[-0.04em] text-[#0f172a]">{copy.title}</div>
          <div className="mt-2 text-[15px] text-[#7c8aa5]">{copy.subtitle}</div>

          <form onSubmit={onSubmit} className="mt-8">
            <input type="email" value={email} onChange={(e) => onChangeEmail(e.target.value)} placeholder={copy.emailPlaceholder} autoComplete="username" className="h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10" />
            <div className="relative mt-4">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => onChangePassword(e.target.value)} placeholder={copy.passwordPlaceholder} autoComplete="current-password" className="h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 pr-12 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10" />
              <button type="button" onClick={onTogglePassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111827]">
                {showPassword ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.2 12c2.25-3.55 5.7-5.8 9.8-5.8 4.1 0 7.55 2.25 9.8 5.8-2.25 3.55-5.7 5.8-9.8 5.8-4.1 0-7.55-2.25-9.8-5.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="4.2" fill="currentColor"/>
                    <circle cx="10.4" cy="10.3" r="1.2" fill="white"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.2 12c2.25-3.55 5.7-5.8 9.8-5.8 4.1 0 7.55 2.25 9.8 5.8-2.25 3.55-5.7 5.8-9.8 5.8-4.1 0-7.55-2.25-9.8-5.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 20 20 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
            <button type="button" onClick={onForgotPassword} className="mt-3 text-[14px] font-medium text-[#2c6cff]">{copy.forgotPassword}</button>
            {error && <div className="mt-3 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{error}</div>}
            <button type="submit" disabled={!email.trim() || !password.trim() || loading} className={`mt-6 h-[54px] w-full rounded-[14px] text-[17px] font-semibold transition ${email.trim() && password.trim() && !loading ? "bg-[#5ee879] text-[#08210f] shadow-[0_12px_30px_rgba(94,232,121,0.35)]" : "bg-[#dff7e6] text-[#7aa287]"}`}>
              {loading ? "..." : copy.submit}
            </button>
          </form>
          <div className="mt-4 text-center">
            {onRegister && (
              <button type="button" onClick={onRegister} className="text-[14px] font-medium text-[#2c6cff] hover:underline">
                Don't have an account? Sign up
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
