import React, { useState } from "react";
import whiteLogo from "../../logo_chat_white.svg";
import { api } from "../api.js";
import { loginTranslations } from "../loginData.js";

export default function RegisterPage({ language = "EN", onChangeLanguage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const copy = loginTranslations[language] || loginTranslations.EN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${api.url}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error("Failed to parse response:", await res.text());
        setError("Server error. Please try again.");
        return;
      }
      
      console.log("Register response:", res.status, JSON.stringify(data, null, 2));
      
      if (!res.ok) {
        // Handle error object that might have formErrors or fieldErrors
        const errorMessage = data.error?.formErrors?.[0] || data.error?.fieldErrors?.[0] || data.error || "Registration failed";
        setError(typeof errorMessage === 'string' ? errorMessage : "Registration failed");
        return;
      }
      
      setMessage(data.message || "Registration successful. Please wait for superadmin approval.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Registration failed");
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
          <div className="mt-7 text-[44px] font-semibold leading-[1.05] tracking-[-0.04em]">Create Your Account</div>
          <div className="mt-4 text-[15px] leading-[1.6] text-white/75">Sign up to get started with AI-powered customer support</div>
        </div>
        <div className="text-[13px] text-white/70">{copy.heroFooter}</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-[440px] rounded-[28px] border border-[#e6ebf4] bg-white p-8 shadow-[0_30px_80px_rgba(37,99,235,0.12)] sm:p-10">
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

          <div className="mt-8 text-[34px] font-semibold tracking-[-0.04em] text-[#0f172a]">Sign Up</div>
          <div className="mt-2 text-[15px] text-[#7c8aa5]">Create your account to get started</div>

          <form onSubmit={handleSubmit} className="mt-8">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={copy.namePlaceholder}
              autoComplete="name"
              className="h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10" 
            />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              className="mt-3 h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10" 
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={copy.passwordPlaceholder}
              autoComplete="new-password"
              className="mt-3 h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10" 
            />
            {error && <div className="mt-3 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{error}</div>}
            {message && <div className="mt-3 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] text-[#15803d]">{message}</div>}
            <button 
              type="submit" 
              disabled={!name.trim() || !email.trim() || !password.trim() || loading} 
              className={`mt-6 h-[54px] w-full rounded-[14px] text-[17px] font-semibold transition ${name.trim() && email.trim() && password.trim() && !loading ? "bg-[#2563eb] text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)]" : "bg-[#dbeafe] text-[#64748b]"}`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            Already have an account? <a href="/" className="text-[14px] font-medium text-[#2c6cff] hover:underline">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
