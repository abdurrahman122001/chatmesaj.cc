import React, { useEffect, useState } from "react";
import { loadQuickActions, saveQuickActions } from "../../quickActions.js";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

const META = {
  whatsapp: { label: "WhatsApp phone", labelKey: "qaWhatsappLabel", placeholder: "+994501234567", hint: "Beynəlxalq formatda nömrə. Widget-də klik wa.me link açır.", hintKey: "qaWhatsappHint" },
  email: { label: "Support e-mail", labelKey: "qaEmailLabel", placeholder: "support@example.com", hint: "Ziyarətçi klik edəndə mailto: açılır.", hintKey: "qaEmailHint" },
  telegram: { label: "Telegram username/link", labelKey: "qaTelegramLabel", placeholder: "@yourhandle", hint: "@ ilə handle və ya tam link.", hintKey: "qaTelegramHint" },
  facebook: { label: "Facebook page", labelKey: "qaFacebookLabel", placeholder: "yourpage və ya https://facebook.com/...", hint: "Səhifə adı və ya tam URL.", hintKey: "qaFacebookHint" },
  instagram: { label: "Instagram handle", labelKey: "qaInstagramLabel", placeholder: "@yourhandle", hint: "@ ilə istifadəçi adı.", hintKey: "qaInstagramHint" },
};

export default function QuickActionConfig({ channel, color = "#2563eb" }) {
  const tr = useT();
  const m = META[channel];
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [siteId, setSiteId] = useState(null);

  useEffect(() => {
    api.me().then(({ sites }) => {
      const s = sites?.[0];
      if (!s) return;
      setSiteId(s.id);
      const remote = s.quickActions || {};
      const local = loadQuickActions();
      const merged = { ...local, ...remote };
      saveQuickActions(merged);
      setValue(merged[channel] || "");
    }).catch(() => {
      const qa = loadQuickActions();
      setValue(qa[channel] || "");
    });
  }, [channel]);

  async function save() {
    const qa = loadQuickActions();
    const next = { ...qa, [channel]: value.trim() };
    saveQuickActions(next);
    if (siteId) {
      try { await api.updateSite(siteId, { quickActions: next }); } catch {}
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function clear() {
    setValue("");
    const qa = loadQuickActions();
    const next = { ...qa, [channel]: "" };
    saveQuickActions(next);
    if (siteId) {
      try { await api.updateSite(siteId, { quickActions: next }); } catch {}
    }
  }

  if (!m) return null;
  return (
    <div className="mb-5 rounded-[14px] border border-[#dfe5ee] bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <div className="text-[14px] font-semibold text-[#111827]">{tr("qaTitle", "Widget Quick Action")}</div>
        {value && <span className="ml-auto rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-medium text-[#166534]">{tr("qaActive", "Active")}</span>}
      </div>
      <div className="mt-1 text-[12px] text-[#64748b]">{tr(m.hintKey, m.hint)}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-[12px] font-medium text-[#334155]">{tr(m.labelKey, m.label)}</label>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={m.placeholder}
          className="min-w-[260px] flex-1 rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
        <button onClick={save} className="rounded-[10px] px-4 py-2 text-[13px] font-medium text-white" style={{ background: color }}>
          {saved ? `${tr("saved", "Saved")} ✓` : tr("save", "Save")}
        </button>
        {value && (
          <button onClick={clear} className="rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-2 text-[13px] text-[#334155] hover:bg-[#f6f8fb]">{tr("clear", "Clear")}</button>
        )}
      </div>
    </div>
  );
}
