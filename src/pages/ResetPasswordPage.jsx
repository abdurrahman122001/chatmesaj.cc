import React, { useState, useEffect } from "react";
import whiteLogo from "../../logo_chat_white.svg";
import { api } from "../api.js";
import { loginTranslations } from "../loginData.js";

export default function ResetPasswordPage({ language = "EN", onChangeLanguage }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const copy = loginTranslations[language] || loginTranslations.EN;

  useEffect(() => {
    const tokenParam = new URLSearchParams(window.location.search).get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError(copy.resetError);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError(copy.resetError);
      return;
    }
    if (newPassword.length < 8) {
      setError(copy.resetShortPassword);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.resetPassword({ token, newPassword });
      setMessage(copy.resetSuccess);
      setTimeout(() => { window.location.href = "/"; }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f7ff] text-[#111827]">
      <div className="hidden w-[42%] bg-[linear-gradient(160deg,#2563eb_0%,#1d4ed8_45%,#0f172a_100%)] px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <img src={whiteLogo} alt="TODO" className="h-9 w-auto object-contain" />
        </div>
        <div className="max-w-[420px]">
          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] inline-flex">{copy.badge}</div>
          <div className="mt-7 text-[44px] font-semibold leading-[1.05] tracking-[-0.04em]">{copy.heroTitle}</div>
          <div className="mt-4 text-[15px] leading-[1.6] text-white/75">{copy.resetSubtitle}</div>
        </div>
        <div className="text-[13px] text-white/70">{copy.heroFooter}</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-[440px] rounded-[28px] border border-[#e6ebf4] bg-white p-8 shadow-[0_30px_80px_rgba(37,99,235,0.35)] sm:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <img src={whiteLogo} alt="TODO" className="h-9 w-auto object-contain invert" />
            </div>
            {onChangeLanguage && (
              <div className="ml-auto flex items-center gap-2 rounded-full border border-[#dbe4f0] bg-[#f8fbff] p-1 text-[12px] font-semibold text-[#64748b]">
                {[["EN", "English"], ["TR", "Türkçe"], ["AZ", "Azərbaycan"], ["RU", "Русский"]].map(([code, label]) => (
                  <button key={code} type="button" onClick={() => onChangeLanguage(code)} className={`rounded-full px-3 py-1 transition ${language === code ? "bg-[#2563eb] text-white" : "text-[#64748b] hover:bg-white"}`} title={label}>
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-[34px] font-semibold tracking-[-0.04em] text-[#0f172a]">{copy.resetTitle}</div>
          <div className="mt-2 text-[15px] text-[#7c8aa5]">{copy.resetSubtitle}</div>

          <form onSubmit={handleSubmit} className="mt-8">
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder={copy.resetPlaceholder} 
              className="h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10" 
            />
            {error && <div className="mt-3 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{error}</div>}
            {message && <div className="mt-3 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] text-[#15803d]">{message}</div>}
            <button 
              type="submit" 
              disabled={!token || !newPassword.trim() || loading} 
              className={`mt-6 h-[54px] w-full rounded-[14px] text-[17px] font-semibold transition ${token && newPassword.trim() && !loading ? "bg-[#2563eb] text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)]" : "bg-[#dbeafe] text-[#64748b]"}`}
            >
              {loading ? "Yenilənir..." : copy.resetSubmit}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-[14px] font-medium text-[#2c6cff] hover:underline">{copy.resetBack}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
