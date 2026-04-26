import React from "react";
import { useT } from "../LanguageContext.jsx";

const I = {
  user: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6"/><path d="M5 19c1.2-3 4-4.5 7-4.5s5.8 1.5 7 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  mail: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  phone: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 5c0-.8.7-1.5 1.5-1.5H9l2 5-2.5 1.5c1 2.5 3 4.5 5.5 5.5L15.5 13l5 2v2.5c0 .8-.7 1.5-1.5 1.5C11 19 5 13 5 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  status: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  globe: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 12h17M12 3.5c2.5 3 2.5 14 0 17M12 3.5c-2.5 3-2.5 14 0 17" stroke="currentColor" strokeWidth="1.6"/></svg>),
  clock: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  monitor: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  cog: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  device: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  lang: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h9M8 4v2M6 12c1.5-2 2.5-4 3-6M12 12c-2-2-3.5-4-4-6M4 12c3 .5 7-.5 10-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 20l4-10 4 10M12.5 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  link: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  arrow: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  tag: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3H5a2 2 0 0 0-2 2v7l9 9 9-9-9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/></svg>),
};

function Flag({ code }) {
  if (!code || code.length !== 2) return I.globe;
  const lc = code.toLowerCase();
  return (
    <img src={`https://flagcdn.com/w20/${lc}.png`} srcSet={`https://flagcdn.com/w40/${lc}.png 2x`}
      width={16} height={12} alt={code}
      className="inline-block rounded-[2px] border border-[#e5eaf1] align-middle"
      onError={(e) => { e.currentTarget.style.display = "none"; }} />
  );
}

function Row({ icon, label, value, mono = false, muted = false }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-[2px] w-4 shrink-0 text-center text-[#9aa5b5]">{icon}</span>
      <div className="min-w-0 flex-1">
        {label && <div className="text-[11px] text-[#94a3b8]">{label}</div>}
        <div className={`truncate ${mono ? "font-mono text-[12px]" : ""} ${muted ? "text-[#6b82a7]" : "text-[#334155]"}`} title={String(value)}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function RightPanel({ conversation, onMobileClose }) {
  const tr = useT();
  const c = conversation || {};
  const location = [c.city, c.region, c.countryName || c.country].filter(Boolean).join(", ");

  return (
    <aside className="flex h-full w-full flex-col bg-white lg:w-[240px] lg:shrink-0">
      <div className="flex h-[50px] items-end gap-6 border-b border-[#dfe5ee] px-5 pt-2 text-[14px]">
        {onMobileClose && (
          <button type="button" onClick={onMobileClose} className="mb-2 flex h-7 w-7 items-center justify-center rounded-full text-[#64748b] hover:bg-[#eef2f7] lg:hidden" aria-label={tr("close", "Close")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        )}
        <div className="border-b-[3px] border-[#2c6cff] pb-[11px] font-medium text-[#2563eb]">{tr("infoTab", "Info")}</div>
        <div className="pb-3 text-[#111827]">{tr("viewedPages", "Viewed pages")}</div>
        <div className="pb-3 text-[#111827]">{tr("notes", "Notes")}</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-[#dfe5ee] px-5 py-5">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">{tr("customerData", "Customer data")}</div>
          <div className="space-y-4 text-[13px]">
            <Row icon={I.user} value={c.name || "—"} />
            <Row icon={I.mail} value={c.email || "—"} muted={!c.email} />
            <Row icon={I.phone} value={c.phone || "—"} muted={!c.phone} />
            {c.status && (
              <div className="flex items-center gap-3">
                <span className="w-4 text-center text-[#9aa5b5]">{I.status}</span>
                <div className="flex h-6 items-center rounded-[8px] border border-[#d6dee9] bg-[#f8fafc] px-3 text-[12px] text-[#64748b]">
                  {c.status} <span className="ml-2 text-[10px]">▼</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-[#dfe5ee] px-5 py-5">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">{tr("location", "Location")}</div>
          <div className="space-y-3 text-[13px]">
            <Row icon={<Flag code={c.country} />} label={tr("countryCity", "Country / City")} value={location || tr("unknown", "Unknown")} muted={!location} />
            <Row icon={I.globe} label="IP" value={c.ip} mono />
            <Row icon={I.clock} label={tr("timezone", "Timezone")} value={c.timezone} />
          </div>
        </div>

        <div className="border-b border-[#dfe5ee] px-5 py-5">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">{tr("device", "Device")}</div>
          <div className="space-y-3 text-[13px]">
            <Row icon={I.monitor} label={tr("browser", "Browser")} value={c.browser} />
            <Row icon={I.cog} label={tr("os", "OS")} value={c.os} />
            <Row icon={I.device} label={tr("device", "Device")} value={c.device} />
            <Row icon={I.lang} label={tr("language", "Language")} value={c.language} />
          </div>
        </div>

        {c.rating && (
          <div className="border-b border-[#dfe5ee] px-5 py-5">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">{tr("rating", "Rating")}</div>
            <div className="space-y-3 text-[13px]">
              <div className="flex items-center gap-1">
                {["😞","🙁","😐","😊","😁"].map((f, i) => (
                  <span key={i} className={`text-[20px] ${i < c.rating ? "" : "opacity-25"}`}>{f}</span>
                ))}
                <span className="ml-2 text-[12px] text-[#64748b]">{c.rating}/5</span>
              </div>
              {c.ratingComment && <div className="rounded-[8px] bg-[#f8fafc] p-2 text-[12px] text-[#475569] italic">"{c.ratingComment}"</div>}
            </div>
          </div>
        )}

        {(c.currentUrl || c.referrer) && (
          <div className="border-b border-[#dfe5ee] px-5 py-5">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">{tr("pageInfo", "Page")}</div>
            <div className="space-y-3 text-[13px]">
              <Row icon={I.link} label={tr("currentUrl", "Current URL")} value={c.currentUrl} mono />
              <Row icon={I.arrow} label={tr("referrer", "Referrer")} value={c.referrer} mono />
            </div>
          </div>
        )}

        <div className="px-5 py-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">{tr("tags", "Tags")}</div>
          <div className="flex items-center gap-2 text-[13px] text-[#6b82a7]">
            <span className="text-[#9aa5b5]">{I.tag}</span>
            <span>{tr("addCustomerTag", "Add a customer tag...")}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
