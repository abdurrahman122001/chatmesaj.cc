import React from "react";
import railIcon from "../../icon.svg";
import { leftIcons } from "../navigation.jsx";

export default function LeftRail({ activePage, onSelectPage, inboxBadge = 0 }) {
  const isHomeActive = activePage === "dashboard";
  return (
    <aside className="flex w-[58px] shrink-0 flex-col items-center border-r border-[#dfe5ee] bg-[#f5f7fa] py-3">
      <button type="button" onClick={() => onSelectPage("dashboard")} className="relative mb-5 outline-none">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${isHomeActive ? "bg-[#dfe9ff]" : ""}` }>
          <img src={railIcon} alt="TODO icon" className="h-5 w-5 object-contain" />
        </div>
      </button>

      <div className="flex flex-col items-center gap-3">
        {leftIcons.map((item) => {
          const pageKey = item.key === "inbox" ? "inbox"
            : item.key === "settings" ? "settings"
            : item.key === "team" ? "customers"
            : item.key === "tickets" ? "tickets"
            : item.key === "subscribers" ? "subscribers"
            : item.key === "reports" ? "analytics"
            : item.key === "bot" ? "data-sources"
            : "dashboard";
          const isActive = activePage === pageKey;

          return (
            <button key={item.key} type="button" className="relative" onClick={() => onSelectPage(pageKey)}>
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-[12px] ${isActive ? "bg-[#dfe9ff]" : "bg-transparent"}`}>
                <span className={`inline-flex items-center justify-center ${isActive ? "text-[#24406f]" : "text-[#31415f]"}`}>
                  {item.svg}
                </span>
              </div>
              {(item.key === "inbox" ? inboxBadge : item.badge) !== undefined ? (
                <span className="absolute right-[4px] top-[4px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#ef233c] px-[4px] text-[9px] font-semibold leading-none text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                  {item.key === "inbox" ? inboxBadge : item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dde5ee] text-[#a0acbb]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="9" r="4" fill="#c7d2df"/>
            <path d="M5 20c1.8-3.4 4.4-5 7-5s5.2 1.6 7 5" fill="#c7d2df"/>
          </svg>
        </div>
        <span className="absolute bottom-[1px] right-0 h-[8px] w-[8px] rounded-full border border-white bg-[#22c55e]" />
      </div>
    </aside>
  );
}
