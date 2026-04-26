import React, { useState } from "react";

export default function TopBar({ title, searchPlaceholder, showTestButton = false, searchQuery = "", onSearchChange, onLogout, notificationsBadge = 0, t, language, languages = [], onChangeLanguage, onToggleMobileNav, mobileBack = false, onMobileBack }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  return (
    <div className="relative flex h-[58px] shrink-0 items-center justify-between border-b border-[#dfe5ee] bg-[#f6f8fb] px-0 md:rounded-t-[16px]">
      <div className="flex min-w-0 flex-1 items-center pl-0">
        {/* Mobile hamburger / back */}
        <button
          type="button"
          onClick={mobileBack ? onMobileBack : onToggleMobileNav}
          className="flex h-10 w-12 items-center justify-center text-[#334155] md:hidden"
          aria-label={mobileBack ? (t?.back || "Back") : (t?.menu || "Menu")}
        >
          {mobileBack ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
        </button>
        <div className="hidden w-[58px] shrink-0 md:block" />
        <div className="min-w-0 flex-1 truncate pl-1 text-[17px] font-semibold tracking-[-0.02em] text-[#111827] md:w-[214px] md:flex-none md:truncate-0 md:pl-0 md:text-[19px]" style={{}}>
          <span className="md:hidden">{title}</span>
          <span className="hidden md:inline md:pl-7">{title}</span>
        </div>
        <div className="hidden md:flex md:w-[300px] md:shrink-0 md:items-center md:px-0">
          <div className="ml-[-4px] flex h-9 w-[292px] items-center rounded-full bg-[#edf1f6] px-4 text-[13px] text-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2563eb]/30">
            <span className="mr-2 text-[14px] text-[#8390a4]">⌕</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent outline-none placeholder:text-[#8390a4]"
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange?.("")}
                className="ml-2 text-[#8390a4] hover:text-[#334155]" aria-label={t?.clearSearch || "Clear search"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 pr-3 text-[13px] text-[#2a3344] md:mr-6 md:gap-5">
        {/* Mobile search toggle */}
        <button type="button" onClick={() => setMobileSearchOpen((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] hover:bg-[#eef2f7] md:hidden" aria-label={t?.search || "Search"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <button type="button" className="hidden h-8 w-8 items-center justify-center rounded-full text-[#64748b] hover:bg-[#eef2f7] hover:text-[#334155] md:flex" aria-label={t?.help || "Help"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
            <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        </button>
        <button type="button" className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] hover:bg-[#eef2f7] hover:text-[#334155]" aria-label={t?.notifications || "Notifications"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 10a6 6 0 0 1 12 0v3l1.5 3h-15L6 13v-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          {notificationsBadge > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[9px] font-semibold text-white">{notificationsBadge}</span>}
        </button>
        {onChangeLanguage ? (
          <>
            <div className="hidden items-center gap-1 rounded-full border border-[#dbe4f0] bg-[#f8fbff] p-1 text-[11px] font-semibold text-[#64748b] md:flex" title={t?.language || "Language"}>
              {languages.map((code) => (
                <button key={code} type="button" onClick={() => onChangeLanguage(code)} className={`rounded-full px-2 py-1 ${language === code ? "bg-[#2563eb] text-white" : "text-[#64748b] hover:bg-white"}`}>
                  {code}
                </button>
              ))}
            </div>
            <div className="relative md:hidden">
              <button type="button" onClick={() => setMobileLangOpen((v) => !v)}
                className="flex h-8 items-center gap-1 rounded-full border border-[#dbe4f0] bg-[#f8fbff] px-2.5 text-[11px] font-semibold text-[#334155]"
                aria-label={t?.language || "Language"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth="1.6"/></svg>
                {language}
              </button>
              {mobileLangOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMobileLangOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full z-40 mt-2 flex flex-col gap-1 rounded-[12px] border border-[#dfe5ee] bg-white p-1 shadow-lg">
                    {languages.map((code) => (
                      <button key={code} type="button" onClick={() => { onChangeLanguage(code); setMobileLangOpen(false); }}
                        className={`rounded-[8px] px-3 py-1.5 text-left text-[12px] font-semibold ${language === code ? "bg-[#2563eb] text-white" : "text-[#334155] hover:bg-[#f1f5f9]"}`}>
                        {code}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
        {showTestButton ? <button className="hidden rounded-[10px] border border-[#d6dee9] bg-white px-4 py-[8px] text-[13px] font-medium text-[#111827] md:inline-block">{t?.testLyro || "◉ Test Lyro"}</button> : null}
        <button type="button" onClick={onLogout} className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] hover:bg-[#eef2f7] hover:text-[#334155] md:h-auto md:w-auto md:gap-1.5 md:rounded-[9px] md:border md:border-[#dfe5ee] md:bg-white md:px-4 md:py-[8px] md:text-[13px] md:font-medium md:text-[#334155]" aria-label={t?.logout || "Log out"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 17l-5-5 5-5M5 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="hidden md:inline">{t?.logout || "Log out"}</span>
        </button>
      </div>
      {/* Mobile expanded search */}
      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-[58px] z-30 border-b border-[#dfe5ee] bg-white p-2 md:hidden">
          <div className="flex h-9 items-center rounded-full bg-[#edf1f6] px-4 text-[13px] text-[#111827] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2563eb]/30">
            <span className="mr-2 text-[14px] text-[#8390a4]">⌕</span>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent outline-none placeholder:text-[#8390a4]"
            />
            <button type="button" onClick={() => { onSearchChange?.(""); setMobileSearchOpen(false); }} className="ml-2 text-[#8390a4] hover:text-[#334155]" aria-label={t?.clearSearch || "Clear"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
