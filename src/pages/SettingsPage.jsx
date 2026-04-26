import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";
import AccountPage from "./settings/AccountPage.jsx";
import MacrosPage from "./settings/MacrosPage.jsx";
import TeamPage from "./settings/TeamPage.jsx";
import NotificationsPage from "./settings/NotificationsPage.jsx";
import OperatingHoursPage from "./settings/OperatingHoursPage.jsx";
import SatisfactionPage from "./settings/SatisfactionPage.jsx";
import IntegrationPage from "./settings/IntegrationPage.jsx";
import IntegrationWizard from "./settings/IntegrationWizard.jsx";
import EmailPage from "./settings/EmailPage.jsx";
import SLAPage from "./settings/SLAPage.jsx";
import QuickActionConfig from "./settings/QuickActionConfig.jsx";
import UsersPage from "./settings/UsersPage.jsx";
import { loadQuickActions, saveQuickActions } from "../quickActions.js";

function Toggle({ on, onChange, size = "md" }) {
  const dims = size === "sm"
    ? { track: "h-5 w-9", knob: "h-[14px] w-[14px] top-[3px]", left: "left-[3px]", on: "left-[19px]" }
    : { track: "h-6 w-11", knob: "h-[18px] w-[18px] top-[3px]", left: "left-[3px]", on: "left-[23px]" };
  return (
    <button type="button" onClick={() => onChange?.(!on)}
      className={`relative ${dims.track} shrink-0 rounded-full transition-colors ${on ? "bg-[#2563eb]" : "bg-[#e5eaf1]"}`}>
      <span className={`absolute ${on ? dims.on : dims.left} ${dims.knob} rounded-full bg-white shadow transition-all`} />
    </button>
  );
}

function getNav(tr, userRole = "AGENT") {
  const nav = [
    {
      group: "WIDGET",
      items: [
        { key: "appearance", label: tr("settingsAppearance", "Appearance") },
        { key: "installation", label: tr("settingsInstallation", "Installation") },
      ],
    },
    {
      group: "CHANNELS",
      items: [
        { key: "email", label: tr("settingsEmail", "Email") },
        { key: "facebook", label: tr("settingsFacebook", "Facebook") },
        { key: "instagram", label: tr("settingsInstagram", "Instagram") },
        { key: "whatsapp", label: tr("settingsWhatsapp", "WhatsApp") },
        { key: "telegram", label: tr("settingsTelegram", "Telegram") },
      ],
    },
    {
      group: "PERSONAL",
      items: [
        { key: "account", label: tr("settingsAccount", "Account") },
        { key: "notifications", label: tr("settingsNotifications", "Notifications") },
        { key: "operating-hours", label: tr("settingsOperatingHours", "Operating hours") },
      ],
    },
    {
      group: "GENERAL",
      items: [
        { key: "macros", label: tr("settingsMacros", "Macros") },
        { key: "team", label: tr("settingsTeam", "Team") },
      ],
    },
  ];

  // Only show Users section for SUPERADMIN
  if (userRole === "SUPERADMIN") {
    nav.push({
      group: "ADMIN",
      items: [
        { key: "users", label: tr("settingsUsers", "Users") },
      ],
    });
  }

  return nav;
}

const ICONS = {
  "live-chat": <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4.5 8.25A2.25 2.25 0 0 1 6.75 6h10.5a2.25 2.25 0 0 1 2.25 2.25v5.5A2.25 2.25 0 0 1 17.25 16H9l-4.5 3V8.25Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  appearance: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  installation: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  "chat-page": <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8 20h8M12 18v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  translations: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7"/><path d="M12 3.75c-2 2.5-3 5.25-3 8.25s1 5.75 3 8.25M12 3.75c2 2.5 3 5.25 3 8.25s-1 5.75-3 8.25M3.75 12h16.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  email: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  facebook: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  instagram: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  whatsapp: <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>,
  telegram: <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.5.5 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/></svg>,
  account: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7"/><path d="M4 20c1.6-3.2 4.4-5 8-5s6.4 1.8 8 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  notifications: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 1 0-12 0c0 5-2.5 7-2.5 7h17S20 13 18 8ZM13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "operating-hours": <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  macros: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  workflows: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.7"/><circle cx="6" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7"/><circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7"/><path d="M12 8.5v4m0 0-6 3m6-3 6 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  team: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.7"/><circle cx="16" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.7"/><path d="M3.5 19c1-2.5 3-4 5.5-4s4.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M15.5 19c.5-1.5 1.8-2.5 3.5-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  users: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.7"/><circle cx="16" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.7"/><path d="M3.5 19c1-2.5 3-4 5.5-4s4.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M15.5 19c.5-1.5 1.8-2.5 3.5-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  sla: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  satisfaction: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  "download-apps": <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fields: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.7"/><rect x="3" y="10.5" width="18" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.7"/><rect x="3" y="16" width="10" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.7"/></svg>,
  tags: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>,
  tracking: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7"/><path d="M12 3.75V2M12 22v-1.75M3.75 12H2M22 12h-1.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  developer: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  billing: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="5.5" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M2 10h20" stroke="currentColor" strokeWidth="1.7"/></svg>,
  preferences: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="19" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7"/></svg>,
};

function SettingsSidebar({ active, onSelect, liveChatOpen, onToggleLiveChat, searchQuery = "", tr, userRole, mobileShowContent }) {
  const q = searchQuery.trim().toLowerCase();
  const NAV = getNav(tr, userRole);
  const sections = !q ? NAV : NAV.map((section) => {
    const items = section.items
      .map((item) => {
        const subs = item.sub?.filter((s) => s.label.toLowerCase().includes(q));
        const matches = item.label.toLowerCase().includes(q);
        if (matches) return item;
        if (subs && subs.length) return { ...item, sub: subs };
        return null;
      })
      .filter(Boolean);
    return items.length ? { ...section, items } : null;
  }).filter(Boolean);

  return (
    <aside className={`${mobileShowContent ? "hidden" : "flex"} w-full flex-col border-r border-[#dfe5ee] bg-white py-4 overflow-y-auto md:flex md:w-[220px] md:shrink-0`}>
      <div className="px-5 pb-3 text-[18px] font-semibold text-[#111827]">{tr("settingsTitle", "Settings")}</div>
      {sections.length === 0 && (
        <div className="px-5 py-6 text-[12px] text-[#94a3b8]">{tr("noSettingsMatch", "No settings match")} "{searchQuery}"</div>
      )}
      {sections.map((section) => (
        <div key={section.group} className="mt-3">
          <div className="px-5 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">{section.group}</div>
          {section.items.map((item) => (
            <div key={item.key}>
              <button
                type="button"
                onClick={() => item.expandable ? onToggleLiveChat() : onSelect(item.key)}
                className={`flex w-full items-center justify-between px-4 py-[6px] text-[13px] ${active === item.key ? "bg-[#dfe9ff] font-medium text-[#1d3a7a]" : "text-[#334155] hover:bg-[#f4f6f9]"}`}
              >
                <span className="flex items-center gap-2">
                  <span className={active === item.key ? "text-[#2563eb]" : "text-[#64748b]"}>{ICONS[item.key]}</span>
                  {item.label}
                </span>
                {item.expandable && <span className="text-[10px] text-[#94a3b8]">{liveChatOpen ? "▲" : "▼"}</span>}
                {item.suffix && <span className="text-[11px] text-[#94a3b8]">{item.suffix}</span>}
              </button>
              {item.expandable && liveChatOpen && item.sub?.map((sub) => (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => onSelect(sub.key)}
                  className={`flex w-full items-center gap-2 py-[6px] pl-10 pr-4 text-[13px] ${active === sub.key ? "bg-[#dfe9ff] font-medium text-[#1d3a7a]" : "text-[#334155] hover:bg-[#f4f6f9]"}`}
                >
                  <span className={active === sub.key ? "text-[#2563eb]" : "text-[#64748b]"}>{ICONS[sub.key]}</span>
                  {sub.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function WidgetBrandingCard() {
  const tr = useT();
  const [brand, setBrand] = useState({ brandColor: "#059669", brandColorDark: "#047857", title: "", subtitle: "", language: "AZ" });
  const [siteName, setSiteName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [siteId, setSiteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.me().then(({ user, sites }) => {
      if (user?.name) setOwnerName(user.name);
      const s = sites?.[0];
      if (!s) return;
      setSiteId(s.id);
      setSiteName(s.name || "");
      if (s.appearance) setBrand((prev) => ({ ...prev, ...s.appearance }));
    }).catch(() => {});
  }, []);

  async function save() {
    if (!siteId) return;
    setSaving(true);
    setError("");
    try {
      await api.updateSite(siteId, { appearance: brand, name: siteName.trim() || undefined });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.message || tr("saveFailed", "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-[#111827]">{tr("brandingTitle", "Widget branding (live)")}</div>
          <div className="text-[12px] text-[#64748b]">{tr("brandingDesc", "These values are applied in real time on the widget on your customer site.")}</div>
        </div>
        <div className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-[#e5eaf1] bg-[#f8fafc] px-2 pr-3">
          <span className="h-6 w-6 rounded-full ring-2 ring-white" style={{ background: brand.brandColor }} />
          <span className="font-mono text-[11px] text-[#475569]">{brand.brandColor}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="col-span-2">
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("brandingSiteName", "Site name")}</label>
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)}
            placeholder={tr("brandingSiteNamePlaceholder", "e.g. ChatMessage")}
            className="w-full rounded-[8px] border border-[#dfe5ee] px-3 py-2 text-[13px]" />
          <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("brandingSiteNameHint", "This name will appear in email templates and subjects.")}</div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("brandingBrandColor", "Brand color")}</label>
          <div className="flex gap-2">
            <input type="color" value={brand.brandColor} onChange={(e) => setBrand((p) => ({ ...p, brandColor: e.target.value }))}
              className="h-9 w-14 cursor-pointer rounded border border-[#dfe5ee]" />
            <input value={brand.brandColor} onChange={(e) => setBrand((p) => ({ ...p, brandColor: e.target.value }))}
              className="flex-1 rounded-[8px] border border-[#dfe5ee] px-3 py-2 text-[13px]" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("brandingBrandColorDark", "Brand color (dark)")}</label>
          <div className="flex gap-2">
            <input type="color" value={brand.brandColorDark} onChange={(e) => setBrand((p) => ({ ...p, brandColorDark: e.target.value }))}
              className="h-9 w-14 cursor-pointer rounded border border-[#dfe5ee]" />
            <input value={brand.brandColorDark} onChange={(e) => setBrand((p) => ({ ...p, brandColorDark: e.target.value }))}
              className="flex-1 rounded-[8px] border border-[#dfe5ee] px-3 py-2 text-[13px]" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("brandingWidgetTitle", "Widget title")}</label>
          <input value={brand.title} onChange={(e) => setBrand((p) => ({ ...p, title: e.target.value }))}
            placeholder={ownerName ? tr("brandingTitlePlaceholderOwner", "Leave empty → \"{owner}\" will be shown").replace("{owner}", ownerName) : tr("brandingTitlePlaceholder", "e.g. Support")}
            className="w-full rounded-[8px] border border-[#dfe5ee] px-3 py-2 text-[13px]" />
          <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("brandingTitleHint", "If left empty, your account name will be shown.")}</div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("brandingSubtitle", "Subtitle")}</label>
          <input value={brand.subtitle} onChange={(e) => setBrand((p) => ({ ...p, subtitle: e.target.value }))}
            placeholder={tr("brandingSubtitlePlaceholder", "How can we help?")}
            className="w-full rounded-[8px] border border-[#dfe5ee] px-3 py-2 text-[13px]" />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("brandingWidgetLang", "Widget language")}</label>
          <div className="flex flex-wrap gap-2">
            {[["AZ", "Azərbaycan"], ["EN", "English"], ["TR", "Türkçe"], ["RU", "Русский"]].map(([code, label]) => (
              <button key={code} type="button"
                onClick={() => setBrand((p) => ({ ...p, language: code }))}
                className={`rounded-[8px] border px-4 py-2 text-[13px] font-medium transition ${
                  brand.language === code
                    ? "border-[#2563eb] bg-[#eff6ff] text-[#1e40af]"
                    : "border-[#dfe5ee] bg-white text-[#334155] hover:bg-[#f8fafc]"
                }`}>
                {code} — {label}
              </button>
            ))}
          </div>
          <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("brandingWidgetLangHint", "Language of the widget on the customer site (messages, buttons, placeholders).")}</div>
        </div>
      </div>
      {error && <div className="mt-3 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving || !siteId}
          className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
          {saving ? tr("saving", "Saving...") : tr("save", "Save")}
        </button>
        {saved && <span className="text-[12px] text-[#15803d]">✓ {tr("saved", "Saved")}</span>}
      </div>
    </div>
  );
}

function AppearancePage() {
  const tr = useT();
  const [siteId, setSiteId] = useState(null);
  const [header, setHeader] = useState("Hi there 👋");
  const [message, setMessage] = useState("Welcome to our website. Ask us anything 🎉");
  const [ticketToggle, setTicketToggle] = useState(false);
  const [privacyToggle, setPrivacyToggle] = useState(false);
  const [displaySurvey, setDisplaySurvey] = useState(true);
  const [buttonLabelToggle, setButtonLabelToggle] = useState(true);
  const [widgetPos, setWidgetPos] = useState("right");
  const [onlineStatus, setOnlineStatus] = useState("We reply immediately");
  const [offlineStatus, setOfflineStatus] = useState("We typically reply within a few minutes.");
  const [starters, setStarters] = useState(["I have a question about the product", "Do you offer discount codes?", "What is my order status?", "What is the exchange policy?", "What is the return policy?"]);
  const [welcomeImage, setWelcomeImage] = useState("agents");
  const [activeTab, setActiveTab] = useState("Home");
  const [quickActions, setQuickActions] = useState(() => loadQuickActions());
  const [quickSaved, setQuickSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    api.me().then(({ sites }) => {
      const s = sites?.[0];
      if (!s) return;
      setSiteId(s.id);
      if (s.appearance) {
        const a = s.appearance;
        if (a.header) setHeader(a.header);
        if (a.message) setMessage(a.message);
        if (a.onlineStatus) setOnlineStatus(a.onlineStatus);
        if (a.offlineStatus) setOfflineStatus(a.offlineStatus);
        if (a.widgetPos) setWidgetPos(a.widgetPos);
        if (a.welcomeImage) setWelcomeImage(a.welcomeImage);
        if (a.ticketToggle !== undefined) setTicketToggle(a.ticketToggle);
        if (a.privacyToggle !== undefined) setPrivacyToggle(a.privacyToggle);
        if (a.displaySurvey !== undefined) setDisplaySurvey(a.displaySurvey);
        if (a.buttonLabelToggle !== undefined) setButtonLabelToggle(a.buttonLabelToggle);
        if (a.starters) setStarters(a.starters);
      }
      if (s.quickActions) setQuickActions({ whatsapp: "", email: "", telegram: "", ...s.quickActions });
    }).catch(() => {});
  }, []);

  function updateQuickAction(key, value) {
    setQuickActions((prev) => ({ ...prev, [key]: value }));
    setQuickSaved(false);
  }
  async function handleSaveQuickActions() {
    if (!siteId) return;
    setSaving(true); setSaveError("");
    try {
      await api.updateSite(siteId, { quickActions });
      saveQuickActions(quickActions);
      setQuickSaved(true);
      setTimeout(() => setQuickSaved(false), 1800);
    } catch (err) { setSaveError(err.message); }
    finally { setSaving(false); }
  }
  async function handleSaveAppearance() {
    if (!siteId) return;
    setSaving(true); setSaveError("");
    try {
      const appearance = {
        header, message, onlineStatus, offlineStatus, widgetPos, welcomeImage,
        ticketToggle,
        privacyToggle, displaySurvey, buttonLabelToggle, starters,
      };
      await api.updateSite(siteId, { appearance, quickActions });
      saveQuickActions(quickActions);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) { setSaveError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-[#f6f8fb] p-3 md:p-5 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-4">
        <div><div className="text-[22px] font-semibold text-[#111827]">{tr("settingsAppearance", "Appearance")}</div><div className="mt-1 text-[13px] text-[#64748b]">{tr("settingsAppearanceDesc", "Customize your Chat Widget to catch your website visitors' attention or to fit the widget's appearance to your branding.")}</div></div>
        <WidgetBrandingCard />
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white">
          <button className="flex w-full items-center justify-between px-5 py-4 text-[15px] font-semibold text-[#111827]">{tr("settingsContent", "Content")} <span className="text-[#94a3b8]">▲</span></button>
          <div className="border-t border-[#eef2f7] px-4 py-4 space-y-4 md:px-5">
            <div className="flex gap-5 overflow-x-auto border-b border-[#eef2f7] pb-3 text-[13px]">
              {[tr("settingsHome", "Home"), tr("settingsChat", "Chat"), tr("settingsPreChatSurvey", "Pre-chat survey"), tr("settingsMinimized", "Minimized")].map((t) => (
                <button key={t} type="button" onClick={() => setActiveTab(t)} className={activeTab === t ? "border-b-2 border-[#2563eb] pb-2 font-medium text-[#2563eb]" : "pb-2 text-[#334155]"}>{t}</button>
              ))}
            </div>
            {activeTab === tr("settingsHome", "Home") && (<>
            <div>
              <div className="mb-2 text-[13px] font-medium text-[#334155]">{tr("settingsWelcomeImage", "Welcome image")}</div>
              <label className="flex items-center gap-2 text-[13px]"><input type="radio" checked={welcomeImage==="agents"} onChange={() => setWelcomeImage("agents")} className="accent-[#2563eb]" /> <span className="font-medium">{tr("settingsAgentsCollage", "Agents collage")}</span></label>
              <div className="ml-5 text-[12px] text-[#64748b]">{tr("settingsAgentsCollageDesc", "Show a collage of your agents' profile pictures at the top of your widget.")}</div>
              <label className="mt-2 flex items-center gap-2 text-[13px]"><input type="radio" checked={welcomeImage==="logo"} onChange={() => setWelcomeImage("logo")} className="accent-[#2563eb]" /> {tr("settingsYourLogo", "Your logo")}</label>
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsHeader", "Header")}</div>
              <div className="flex items-center justify-between rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px]">
                <input value={header} onChange={(e) => setHeader(e.target.value)} className="flex-1 outline-none bg-transparent" />
                <span className="text-[#94a3b8]">☺</span>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsMessage", "Message")}</div>
              <div className="flex items-end justify-between rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px]">
                <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 outline-none bg-transparent" />
                <span className="text-[#94a3b8]">☺</span>
              </div>
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium text-[#334155]">{tr("settingsConversationStarters", "Conversation starters")}</div>
              <div className="text-[12px] text-[#64748b]">{tr("settingsConversationStartersDesc", "Visitors can quickly start a conversation with just 1 Lyro or an agent is available.")}</div>
              <div className="mt-3 space-y-2">
                {starters.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px]">
                    <span className="text-[#94a3b8] cursor-grab">⠿</span>
                    <span className="h-3.5 w-3.5 rounded-full border border-[#cfd8e3]" />
                    <input value={s} onChange={(e) => setStarters((prev) => prev.map((v, j) => j === i ? e.target.value : v))}
                      className="flex-1 outline-none bg-transparent text-[13px]" />
                    <button type="button" onClick={() => setStarters((prev) => prev.filter((_, j) => j !== i))}
                      className="text-[#94a3b8] hover:text-[#ef4444]">🗑</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setStarters((prev) => [...prev, ""])}
                  className="mt-2 rounded-[10px] bg-[#dfe9ff] px-3 py-2 text-[13px] font-medium text-[#2563eb]">{tr("settingsAddNew", "+ Add new")}</button>
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsOnlineStatus", "Online status")}</div>
              <input value={onlineStatus} onChange={(e) => setOnlineStatus(e.target.value)} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsOfflineStatus", "Offline status")}</div>
              <div className="text-[12px] text-[#64748b]">{tr("settingsAdjustOnlineHours", "Adjust online hours")}</div>
              <input value={offlineStatus} onChange={(e) => setOfflineStatus(e.target.value)} className="mt-1 w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
            </div>
            </>)}

            {activeTab === tr("settingsChat", "Chat") && (<>
              <div className="text-[12px] text-[#64748b]">{tr("chatTabIntro", "All the conversations with Lyro, agents, and Flows take place here.")}</div>
              <div className="flex items-start gap-6">
                <div className="w-28 shrink-0 pt-2 text-[13px] font-medium text-[#334155]">{tr("cfgOfflineMessage", "Offline message")}</div>
                <textarea defaultValue={tr("chatOfflineMessageDefault", "We're currently unavailable. We'll get back to you when one of our operators is able to respond. Please provide your email address so we can get in touch with you.")}
                  className="h-24 flex-1 resize-none rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
              </div>
              <div className="flex items-center gap-6">
                <div className="w-28 shrink-0 text-[13px] font-medium text-[#334155]">{tr("chatLetVisitorsCreateTicket", "Let visitors create ticket when offline")}</div>
                <div className="flex items-center gap-2">
                  <Toggle size="sm" on={ticketToggle} onChange={setTicketToggle} />
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#94a3b8] text-[10px] text-[#94a3b8]">?</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-28 shrink-0 text-[13px] font-medium text-[#334155]">{tr("chatPrivacyPolicyMessage", "Privacy policy message")}</div>
                <Toggle size="sm" on={privacyToggle} onChange={setPrivacyToggle} />
              </div>
            </>)}

            {activeTab === "Pre-chat survey" && (<>
              <div className="text-[12px] text-[#64748b]">Ask your visitor for their personal information (e.g. email) before the conversation starts. The survey will be mandatory for them.</div>
              <div className="flex items-center gap-6">
                <div className="w-24 shrink-0 text-[13px] font-medium text-[#334155]">Display</div>
                <Toggle size="sm" on={displaySurvey} onChange={setDisplaySurvey} />
              </div>
              <div className="flex items-center gap-6">
                <div className="w-24 shrink-0 text-[13px] font-medium text-[#334155]">Message</div>
                <input defaultValue="Please introduce yourself:" className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
              </div>
              <div className="flex items-start gap-6">
                <div className="w-24 shrink-0 pt-2 text-[13px] font-medium text-[#334155]">Survey fields</div>
                <div className="flex-1 space-y-3 rounded-[12px] bg-[#f4f6f9] p-3">
                  <div className="space-y-2 rounded-[10px] bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[12px] text-[#334155]">Email</span>
                      <input placeholder="Enter your email..." className="flex-1 rounded-[8px] border border-[#cfd8e3] px-3 py-1.5 text-[12px] outline-none" />
                      <span className="text-[#94a3b8]">🗑</span>
                    </div>
                    <label className="ml-20 flex items-center gap-2 text-[12px] text-[#334155]"><input type="checkbox" defaultChecked className="accent-[#2563eb]" /> Ask your visitor for newsletter permission</label>
                  </div>
                  <div className="space-y-2 rounded-[10px] bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[12px] text-[#334155]">Department</span>
                      <input placeholder="Select department" className="flex-1 rounded-[8px] border border-[#cfd8e3] px-3 py-1.5 text-[12px] outline-none" />
                      <span className="text-[#94a3b8]">🗑</span>
                    </div>
                    <div className="ml-20 flex items-start gap-2 rounded-[8px] bg-[#e0edff] px-3 py-2 text-[12px] text-[#334155]">
                      <span className="text-[#2563eb]">ⓘ</span>
                      <span>To set routing rules, please add a department first. <span className="underline cursor-pointer">Go to departments' settings</span></span>
                    </div>
                  </div>
                  <button className="rounded-[8px] border border-dashed border-[#cfd8e3] bg-white px-3 py-1.5 text-[12px] text-[#334155]">+ Add new</button>
                </div>
              </div>
              <div className="text-[13px] text-[#2563eb] cursor-pointer">◫ Learn when to use a pre-chat survey</div>
            </>)}

            {activeTab === "Minimized" && (<>
              <div className="text-[12px] text-[#64748b]">You can add button label to encourage visitors to open the widget.</div>
              <div className="flex items-start gap-6">
                <div className="w-24 shrink-0 pt-1 text-[13px] font-medium text-[#334155]">Button label</div>
                <div className="flex-1 space-y-2">
                  <Toggle size="sm" on={buttonLabelToggle} onChange={setButtonLabelToggle} />
                  <input defaultValue="How I can help you?😍" className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white">
          <div className="flex w-full items-center justify-between px-5 py-4 text-[15px] font-semibold text-[#111827]">{tr("settingsVisibility", "Visibility and position")} <span className="text-[#94a3b8]">▲</span></div>
          <div className="border-t border-[#eef2f7] px-5 py-4 space-y-4">
            <div>
              <div className="text-[13px] font-medium text-[#334155]">{tr("settingsDisplayAllPages", "Display on all pages")}</div>
              <div className="text-[12px] text-[#64748b]">{tr("settingsDisplayAllPagesDesc", "Widget will be displayed on all pages of your website")}</div>
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium text-[#334155]">{tr("settingsWidgetPosition", "Widget position")}</div>
              <div className="flex items-center gap-2 text-[12px] text-[#64748b]">
                <button type="button" onClick={() => setWidgetPos("left")} className={widgetPos === "left" ? "font-medium text-[#2563eb]" : ""}>{tr("settingsLeft", "Left")}</button>
                <button type="button" onClick={() => setWidgetPos(widgetPos === "left" ? "right" : "left")} className="relative h-2 flex-1 rounded-full bg-[#e5eaf1]">
                  <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#2563eb] bg-white shadow transition-all ${widgetPos === "left" ? "left-0" : "right-0"}`} />
                </button>
                <button type="button" onClick={() => setWidgetPos("right")} className={widgetPos === "right" ? "font-medium text-[#2563eb]" : ""}>{tr("settingsRight", "Right")}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#dfe5ee] bg-white">
          <div className="flex w-full items-center justify-between px-5 py-4 text-[15px] font-semibold text-[#111827]">{tr("settingsQuickActions", "Quick actions")} <span className="text-[#94a3b8]">▲</span></div>
          <div className="border-t border-[#eef2f7] px-5 py-4 space-y-4">
            <div className="text-[13px] text-[#64748b]">{tr("settingsQuickActionsDesc", "Configure the WhatsApp, Email and Telegram links shown in your chat widget's Quick Actions card. Visitors will open these when they click.")}</div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsWhatsappNumber", "WhatsApp number")}</div>
              <input value={quickActions.whatsapp} onChange={(e) => updateQuickAction("whatsapp", e.target.value)}
                placeholder="+994 XX XXX XX XX"
                className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
              <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("settingsOpensWaMe", "Opens https://wa.me/<number>")}</div>
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsEmailAddress", "Email address")}</div>
              <input value={quickActions.email} onChange={(e) => updateQuickAction("email", e.target.value)}
                placeholder="support@yourdomain.com"
                className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
              <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("settingsOpensMailto", "Opens the default mail app via")} <span className="font-mono">mailto:</span></div>
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsTelegramUser", "Telegram username or link")}</div>
              <input value={quickActions.telegram} onChange={(e) => updateQuickAction("telegram", e.target.value)}
                placeholder="@yourchannel or https://t.me/yourchannel"
                className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
              <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("settingsOpensTelegram", "Opens https://t.me/<username>")}</div>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={handleSaveQuickActions} disabled={saving}
                className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
                {saving ? tr("saving", "Saving...") : tr("settingsSaveQuickActions", "Save quick actions")}
              </button>
              {quickSaved && <span className="text-[12px] text-[#15803d]">✓ Saved</span>}
            </div>
          </div>
        </div>


        {saveError && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{saveError}</div>}
        <div className="flex items-center gap-3">
          <button onClick={handleSaveAppearance} disabled={saving || !siteId}
            className="rounded-[10px] bg-[#2563eb] px-5 py-2 text-[14px] font-medium text-white disabled:opacity-60">
            {saving ? tr("saving", "Saving...") : tr("save", "Save")}
          </button>
          {saved && <span className="text-[12px] text-[#15803d]">✓ {tr("saved", "Saved")}</span>}
        </div>
      </div>
      <div className="w-full shrink-0 lg:w-[260px]">
        <div className="mb-2 text-[13px] text-[#64748b]">{tr("previewHome", "Preview: Home")} ▼</div>
        <div className="overflow-hidden rounded-[20px] bg-[#4f2bd6] shadow-[0_8px_32px_rgba(79,43,214,0.25)]">
          <div className="px-5 pt-5 pb-10">
            <div className="flex justify-end"><span className="text-white opacity-70">⋮</span></div>
            <div className="mt-3 text-[22px] font-semibold leading-[1.2] text-white">{header}</div>
            <div className="mt-1 text-[13px] text-white/80">{message}</div>
          </div>
          <div className="mx-3 rounded-[16px] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <div className="text-[13px] font-medium text-[#111827]">{tr("previewChatWithUs", "Chat with us")}</div>
            <div className="text-[11px] text-[#64748b]">{onlineStatus}</div>
            <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-[10px] bg-[#2563eb] py-2 text-[13px] font-medium text-white">▶ {tr("previewStartConversation", "Start conversation")}</button>
            <div className="mt-3 flex justify-center gap-6 border-t border-[#eef2f7] pt-3 text-[11px] text-[#64748b]">
              <div className="text-center"><div>🏠</div>Home</div>
              <div className="text-center"><div>💬</div>Chat</div>
            </div>
          </div>
          <div className="py-3 text-center text-[10px] text-white/50">POWERED BY TODO</div>
        </div>
        <button className="mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#ef233c] text-white shadow-lg ml-auto">✕</button>
      </div>
    </div>
  );
}

function InstallationPage() {
  const tr = useT();
  const [site, setSite] = useState(null);
  const [copied, setCopied] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4001";

  useEffect(() => {
    api.me().then(({ sites }) => setSite(sites?.[0] || null)).catch(() => {});
  }, []);

  const snippet = site ? `<script>
  window.ChatbotConfig = {
    apiKey: "${site.apiKey}",
    apiUrl: "${apiUrl}"
  };
</script>
<script src="${apiUrl}/widget-embed.js" async></script>` : "Yüklənir...";

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f6f8fb] p-3 md:p-5">
      <div className="text-[22px] font-semibold text-[#111827]">{tr("settingsInstallation", "Installation")}</div>
      <div className="mt-1 text-[13px] text-[#64748b]">{tr("settingsInstallDesc", "Paste this code before </body> to add the widget to your site.")}</div>

      <div className="mt-5 rounded-[14px] border border-[#dfe5ee] bg-white p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[12px] font-semibold text-white">1</span>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-[#111827]">{tr("settingsCodeSnippet", "Code snippet")}</div>
            <pre className="mt-3 max-w-full overflow-x-auto rounded-[10px] bg-[#0f172a] p-4 text-[11px] leading-[1.5] text-[#e2e8f0] whitespace-pre">{snippet}</pre>
            <div className="mt-3 flex gap-2">
              <button onClick={copy} className="flex items-center gap-1.5 rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] text-white">
                {copied ? "✓ Kopyalandı" : "⎘ Copy to clipboard"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-3 border-t border-[#eef2f7] pt-5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[12px] font-semibold text-white">2</span>
          <div className="flex-1">
            <div className="font-medium text-[#111827]">{tr("settingsTestOnSite", "Test on site")}</div>
            <div className="mt-1 text-[13px] text-[#64748b]">{tr("settingsTestOnSiteDesc", "Refresh the page after pasting the code. The chat button should appear at the bottom right.")}</div>
            <div className="mt-2">
              <a href="/demo-site.html" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[12px] text-[#2563eb] hover:bg-[#eff6ff]">
                {tr("settingsDemoSite", "Open on demo site ↗")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {site && (
        <div className="mt-5 rounded-[14px] border border-[#dfe5ee] bg-white p-5">
          <div className="font-medium text-[#111827]">{tr("settingsSiteInfo", "Site information")}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <div><div className="text-[#64748b]">{tr("settingsSiteName", "Site name")}</div><div className="font-medium text-[#111827]">{site.name}</div></div>
            <div><div className="text-[#64748b]">{tr("settingsApiUrl", "API URL")}</div><div className="font-mono text-[12px] text-[#111827]">{apiUrl}</div></div>
            <div className="col-span-2"><div className="text-[#64748b]">{tr("settingsApiKey", "API key")}</div><div className="font-mono text-[12px] text-[#111827]">{site.apiKey}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatPageContent() {
  const tr = useT();
  const [bgColor] = useState("Color 2");
  const [companyUrl, setCompanyUrl] = useState("ripcrack.net");
  const [chatHeader, setChatHeader] = useState("Welcome to ripcrack.me");
  const [welcomeMsg, setWelcomeMsg] = useState("Ask us anything 🎉");
  const [metaTitle, setMetaTitle] = useState("ripcrack.net");
  const [metaDesc, setMetaDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSiteSettings().then(({ settings }) => {
      const cp = settings?.chatPage;
      if (!cp) return;
      if (cp.companyUrl) setCompanyUrl(cp.companyUrl);
      if (cp.chatHeader) setChatHeader(cp.chatHeader);
      if (cp.welcomeMsg) setWelcomeMsg(cp.welcomeMsg);
      if (cp.metaTitle) setMetaTitle(cp.metaTitle);
      if (cp.metaDesc) setMetaDesc(cp.metaDesc);
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true); setError("");
    try {
      await api.updateSiteSettings({ chatPage: { companyUrl, chatHeader, welcomeMsg, metaTitle, metaDesc } });
      setSaved(true); setTimeout(() => setSaved(false), 1800);
    } catch (err) { setError(err.message || "Saxlanmadı"); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex min-h-0 flex-1 gap-5 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="flex-1 space-y-4">
        <div className="text-[22px] font-semibold text-[#111827]">{tr("settingsChatPage", "Chat page")}</div>
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white">
          <button className="flex w-full items-center justify-between px-5 py-4 text-[15px] font-semibold text-[#111827]">{tr("settingsAppearance", "Appearance")} <span className="text-[#94a3b8]">▲</span></button>
          <div className="border-t border-[#eef2f7] px-5 py-4 space-y-4">
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsBgColor", "Background color")}</div>
              <div className="flex items-center gap-2 rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px]">
                <span className="h-4 w-4 rounded-full bg-[#4f2bd6]" />{bgColor}<span className="ml-auto text-[#94a3b8]">▼</span>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsCompanyLogo", "Company logo")}</div>
              <div className="flex h-14 w-28 items-center justify-center rounded-[10px] border border-[#dfe5ee] bg-[#f4f6f9] text-[11px] text-[#94a3b8]">RIPCRACK</div>
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsCompanyUrl", "Company URL")}</div>
              <input value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsHeader", "Header")}</div>
              <textarea value={chatHeader} onChange={(e) => setChatHeader(e.target.value)} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none resize-none h-16" />
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsWelcomeMsg", "Welcome message")}</div>
              <textarea value={welcomeMsg} onChange={(e) => setWelcomeMsg(e.target.value)} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none resize-none h-16" />
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsChatPageUrl", "Chat page URL")}</div>
              <div className="flex items-center gap-2 rounded-[10px] border border-[#cfd8e3] bg-[#f8fbff] px-3 py-2 text-[13px] text-[#64748b]">
                <span className="flex-1">https://chatting.page/nbz22lhbsmxm9wewrgte9dbfgcxglcfg</span>
                <span>⎘</span>
              </div>
              <button className="mt-2 w-full rounded-[10px] border border-[#2563eb] py-2 text-[13px] font-medium text-[#2563eb]">{tr("settingsOpenChatPage", "Open Chat page")}</button>
            </div>
          </div>
        </div>
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white">
          <button className="flex w-full items-center justify-between px-5 py-4 text-[15px] font-semibold text-[#111827]">{tr("settingsSeo", "Search engine optimization")} <span className="text-[#94a3b8]">▲</span></button>
          <div className="border-t border-[#eef2f7] px-5 py-4 space-y-4">
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsMetaTitle", "Meta title")}</div>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("settingsMetaDesc", "Meta description")}</div>
              <input value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
            </div>
          </div>
        </div>
        {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving}
            className="rounded-[10px] bg-[#2563eb] px-5 py-2 text-[14px] font-medium text-white disabled:opacity-60">
            {saving ? "Saxlanılır..." : "Yadda saxla"}
          </button>
          {saved && <span className="text-[12px] text-[#15803d]">✓ Saxlanıldı</span>}
        </div>
      </div>
      <div className="w-[320px] shrink-0 rounded-[20px] bg-[#4f2bd6] p-6 text-white">
        <div className="text-[20px] font-bold">RIPCRACK</div>
        <div className="mt-4 text-center text-[20px] font-bold leading-[1.25]">{chatHeader}</div>
        <div className="mt-2 text-center text-[14px] text-white/75">{welcomeMsg}</div>
        <div className="mt-6 rounded-[16px] bg-white p-3 text-[#111827] shadow-lg">
          <div className="space-y-2 text-[13px]">
            <div className="rounded-[10px] bg-[#f4f6f9] px-3 py-2">Hello 😊</div>
            <div className="ml-auto w-fit rounded-[10px] bg-[#4f2bd6] px-3 py-2 text-white">I've been looking for this model for ages!</div>
            <div className="rounded-[10px] bg-[#f4f6f9] px-3 py-2 text-[12px]">Let me check that for you real quick! We've just had a big delivery...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacebookPage() {
  const [pagesList, setPagesList] = useState([]); // [{ id, name, enabled }]
  const [integrated, setIntegrated] = useState(false);
  const [meta, setMeta] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [newPage, setNewPage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getSiteSettings().then(({ settings }) => {
      setIntegrated(!!settings?.channels?.facebook);
      setMeta(settings?.integrations?.facebook || null);
      if (Array.isArray(settings?.facebookPagesList)) setPagesList(settings.facebookPagesList);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  async function persist(list) {
    setPagesList(list);
    try { await api.updateSiteSettings({ facebookPagesList: list }); } catch {}
  }

  async function addPage(e) {
    e?.preventDefault();
    const name = newPage.trim();
    if (!name) return;
    if (pagesList.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setNewPage(""); return;
    }
    setBusy(true);
    await persist([...pagesList, { id: Date.now().toString(36), name, enabled: true }]);
    setNewPage(""); setBusy(false);
  }

  async function togglePage(id, v) {
    await persist(pagesList.map((p) => p.id === id ? { ...p, enabled: v } : p));
  }

  async function removePage(id) {
    await persist(pagesList.filter((p) => p.id !== id));
  }

  async function cancelIntegration() {
    if (!confirm("Facebook integrasiyasını ayırmaq istəyirsiniz?")) return;
    try {
      await api.updateSiteSettings({
        channels: { facebook: false },
        facebookPagesList: [],
        facebookPages: {},
        integrations: { facebook: null },
      });
      setIntegrated(false);
      setPagesList([]);
      setMeta(null);
    } catch {}
  }

  if (!loaded) return <div className="flex flex-1 items-center justify-center bg-[#f6f8fb] text-[13px] text-[#64748b]">Yüklənir...</div>;

  async function reloadPages() {
    try {
      const { settings } = await api.getSiteSettings();
      if (Array.isArray(settings?.facebookPagesList)) setPagesList(settings.facebookPagesList);
    } catch {}
  }

  if (!integrated) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f6f8fb] p-5">
        <QuickActionConfig channel="facebook" color="#1877f2" />
        <IntegrationWizard
          channel="facebook"
          onDone={async (info) => {
            setIntegrated(true);
            setMeta({ ...(info || {}), connectedAt: new Date().toISOString() });
            await reloadPages();
          }}
          onCancel={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 gap-5 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="flex-1">
        <QuickActionConfig channel="facebook" color="#1877f2" />
        <div className="flex items-center gap-3 text-[22px] font-semibold text-[#111827]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-white text-[18px] font-bold">f</span>
          Facebook integration
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-[13px] text-[#166534]">
          <span className="mt-0.5">✓</span>
          <div>
            <div className="font-medium">Facebook integrasiyası aktivdir.</div>
            {meta?.account && <div className="mt-0.5 text-[12px] text-[#15803d]">Hesab: {meta.account}</div>}
            {meta?.connectedAt && <div className="mt-0.5 text-[12px] text-[#15803d]">Tarix: {new Date(meta.connectedAt).toLocaleString()}</div>}
          </div>
        </div>
        {(() => {
          const connectedCount = pagesList.filter((p) => p.enabled).length;
          return (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[13px] text-[#334155]">
                {tr("fbPagesDesc", "Your Facebook pages are below. Select the ones you want to manage with toggle.")}
              </div>
              <div className="text-[12px] text-[#64748b]">
                <span className="font-semibold text-[#111827]">{connectedCount}</span> / {pagesList.length} {tr("connected", "connected")}
              </div>
            </div>
          );
        })()}

        <div className="mt-3 overflow-hidden rounded-[14px] border border-[#dfe5ee] bg-white">
          {pagesList.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-[#64748b]">
              Bu hesab altında Facebook səhifəsi tapılmadı.<br />
              Aşağıdan manual əlavə edə bilərsiniz.
            </div>
          ) : pagesList.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between px-4 py-3 text-[14px] ${i > 0 ? "border-t border-[#eef2f7]" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2]/10 text-[14px] font-semibold text-[#1877f2]">{p.name[0]?.toUpperCase()}</span>
                <div>
                  <div className="text-[#111827]">{p.name}</div>
                  <div className="text-[11px] text-[#94a3b8]">
                    {typeof p.followers === "number" ? `${p.followers.toLocaleString()} ${tr("followers", "followers")}` : tr("facebookPage", "Facebook page")}
                    {p.enabled && <span className="ml-2 rounded-full bg-[#dcfce7] px-1.5 py-0.5 text-[10px] font-medium text-[#166534]">● {tr("connected", "Connected")}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Toggle on={!!p.enabled} onChange={(v) => togglePage(p.id, v)} />
                <button onClick={() => removePage(p.id)}
                  className="text-[#94a3b8] hover:text-[#ef4444]" title={tr("deletePage", "Delete page")}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        <details className="mt-3 text-[12px] text-[#64748b]">
          <summary className="cursor-pointer hover:text-[#111827]">+ {tr("manualAddPage", "Manual add page")}</summary>
          <form onSubmit={addPage} className="mt-2 flex gap-2">
            <input
              value={newPage}
              onChange={(e) => setNewPage(e.target.value)}
              placeholder="Səhifə adı"
              className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#1877f2]"
            />
            <button type="submit" disabled={busy || !newPage.trim()}
              className="rounded-[10px] bg-[#1877f2] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
              {tr("add", "Add")}
            </button>
          </form>
        </details>

        <div className="mt-4 flex gap-3">
          <button onClick={cancelIntegration} className="rounded-[10px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#ef4444] hover:bg-[#fef2f2]">Integrasiyanı ayır</button>
        </div>
      </div>
      <div className="w-[260px] shrink-0">
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-4">
          <div className="flex h-20 items-center justify-center rounded-[12px] bg-[#eef2ff] text-[28px]">💬 👍</div>
          <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">What's next?</div>
          <div className="mt-1 text-[15px] font-semibold text-[#111827]">Add Flows and solve customers' problems</div>
          <div className="mt-1 text-[13px] text-[#64748b]">Solve customers problems automatically with custom Flow templates</div>
          <button className="mt-3 rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">Explore templates</button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#f6f8fb]">
      <div className="text-center">
        <div className="text-[24px] font-semibold text-[#111827]">{title}</div>
        <div className="mt-2 text-[14px] text-[#64748b]">Bu səhifə tezliklə əlavə olunacaq.</div>
      </div>
    </div>
  );
}

export default function SettingsPage({ searchQuery = "", userRole = "AGENT" }) {
  const tr = useT();
  const [active, setActive] = useState("appearance");
  const [liveChatOpen, setLiveChatOpen] = useState(true);
  const [mobileShowContent, setMobileShowContent] = useState(false);

  const navAll = getNav(tr, userRole);
  const activeLabel = (() => {
    for (const sec of navAll) {
      const found = sec.items.find((it) => it.key === active);
      if (found) return found.label;
      for (const it of sec.items) {
        const sub = it.sub?.find((s) => s.key === active);
        if (sub) return sub.label;
      }
    }
    return active;
  })();
  const handleSelect = (key) => { setActive(key); setMobileShowContent(true); };

  function renderContent() {
    switch (active) {
      case "appearance": return <AppearancePage />;
      case "installation": return <InstallationPage />;
      case "chat-page": return <ChatPageContent />;
      case "facebook": return <FacebookPage />;
      case "email": return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f6f8fb]">
          <div className="p-5 pb-0"><QuickActionConfig channel="email" color="#2563eb" /></div>
          <EmailPage />
        </div>
      );
      case "telegram": return (
        <IntegrationPage channel="telegram"
          name="Telegram" iconBg="#229ED9" iconContent={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.4 4.6 2.9 11.3c-1.2.5-1.2 2.2.2 2.6l4.5 1.5 1.5 4.7c.4 1.3 2.1 1.5 2.8.4l2.6-3.7 4.4 3.1c.9.6 2.1.2 2.4-.9l2.8-12.7c.3-1.2-.9-2.1-2.1-1.7Z" fill="white"/></svg>}
          description="Connect your Telegram bot/username so visitors can message you instantly from the widget."
          features={[
            { icon: "💬", title: "Direct messages", desc: "Klient @handle ilə sizə Telegram-da yaza bilər." },
            { icon: "🔔", title: "Push bildiriş", desc: "Telegram-ın push bildirişləri ilə cavab gecikməsi azalır." },
            { icon: "🌍", title: "Global", desc: "200M+ istifadəçi olan Telegram şəbəkəsi." },
          ]}
          buttonLabel="Integrate Telegram"
        />
      );
      case "account": return <AccountPage />;
      case "macros": return <MacrosPage />;
      case "team": return <TeamPage />;
      case "sla": return <SLAPage />;
      case "notifications": return <NotificationsPage />;
      case "operating-hours": return <OperatingHoursPage />;
      case "satisfaction": return <SatisfactionPage />;
      case "users": return <UsersPage />;
      case "instagram": return (
        <IntegrationPage channel="instagram"
          name="Instagram" iconBg="#e1306c" iconContent="📸"
          description="Manage your Instagram direct messages and comments directly from your TODO Inbox to respond to customer questions quickly. Fewer distractions from switching platforms, more productivity for you."
          features={[
            { icon: "💬", title: "Direct messages and comments", desc: "Reply to all messages and comments from customers." },
            { icon: "🕐", title: "Reply window", desc: "You have 7 days to reply to messages from your customers." },
            { icon: "⚡", title: "Flows", desc: "Boost your productivity by using Flows to automate repetitive conversations." },
          ]}
          buttonLabel="Integrate Instagram"
        />
      );
      case "whatsapp": return (
        <IntegrationPage channel="whatsapp"
          name="WhatsApp" iconBg="#25d366" iconContent="💬"
          description="Handle your WhatsApp conversations directly in your TODO inbox and quickly answer your customers' questions. Less distraction from switching platforms, more productivity."
          features={[
            { icon: "💬", title: "Direct messages", desc: "Respond to all messages from customers. Group chat and calls are not available yet." },
            { icon: "🕐", title: "Reply window", desc: "You have 24 hours to reply to messages from your customers." },
            { icon: "⚡", title: "Flows", desc: "Boost your productivity by using Flows to automate repetitive conversations." },
          ]}
          buttonLabel="Integrate WhatsApp"
        />
      );
      default: return <PlaceholderPage title={active.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} />;
    }
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <SettingsSidebar
        active={active}
        onSelect={handleSelect}
        liveChatOpen={liveChatOpen}
        onToggleLiveChat={() => setLiveChatOpen((v) => !v)}
        searchQuery={searchQuery}
        tr={tr}
        userRole={userRole}
        mobileShowContent={mobileShowContent}
      />
      <div className={`${mobileShowContent ? "flex" : "hidden"} min-w-0 flex-1 flex-col overflow-hidden md:flex`}>
        <div className="flex h-[44px] shrink-0 items-center gap-2 border-b border-[#dfe5ee] bg-white px-3 md:hidden">
          <button onClick={() => setMobileShowContent(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#334155] hover:bg-[#eef2f7]" aria-label={tr("back", "Back")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="text-[14px] font-medium text-[#111827]">{activeLabel}</div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
