import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

const MOCK_CONTACTS = [
  { name: "#202f4", initial: "I", color: "#94a3b8", email: "info@fusiongraphics.co.nz", consent: "-", country: "-", channels: ["chat","fb"] },
  { name: "tlm21269@outlook.com", initial: "T", color: "#ec4899", email: "tlm21269@outlook.com", consent: "Subscribed", country: "(US) United States", channels: ["chat"] },
  { name: "#13cbf", initial: "N", color: "#2563eb", email: "nezepackaging@gmail.com", consent: "-", country: "-", channels: ["chat","fb"] },
  { name: "fiuso@msn.com", initial: "F", color: "#7c3aed", email: "fiuso@msn.com", consent: "Unsubscribed", country: "(US) United States", channels: ["chat"] },
  { name: "fiuso@msn.com", initial: "F", color: "#64748b", email: "fiuso@msn.com", consent: "Unsubscribed", country: "(US) United States", channels: ["chat"] },
  { name: "tjklei@sasktel.net", initial: "T", color: "#38bdf8", email: "tjklei@sasktel.net", consent: "Unsubscribed", country: "(CA) Canada", channels: ["chat"] },
  { name: "1094291771@qq.com", initial: "J", color: "#8b5cf6", email: "1094291771@qq.com", consent: "Subscribed", country: "(US) United States", channels: ["chat"] },
  { name: "peagamirov@gmail.com", initial: "P", color: "#94a3b8", email: "peagamirov@gmail.com", consent: "Subscribed", country: "(NL) Netherlands", channels: ["chat"] },
  { name: "david.m.r@hotmail.com", initial: "D", color: "#2563eb", email: "david.m.r@hotmail.com", consent: "Subscribed", country: "(ES) Spain", channels: ["chat"] },
  { name: "mezz.yano@gmail.com", initial: "M", color: "#a855f7", email: "mezz.yano@gmail.com", consent: "Subscribed", country: "(US) United States", channels: ["chat"] },
];

const Icon = {
  id: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="1.6"/><path d="M14 10h4M14 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  pin: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>),
  email: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  consent: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="m7 11 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  calendar: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  chat: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-5 3V8Z" stroke="currentColor" strokeWidth="1.6"/></svg>),
  phone: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 5c0-.8.7-1.5 1.5-1.5H9l2 5-2.5 1.5c1 2.5 3 4.5 5.5 5.5L15.5 13l5 2v2.5c0 .8-.7 1.5-1.5 1.5C11 19 5 13 5 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  globe: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 12h17M12 3.5c2.5 3 2.5 14 0 17M12 3.5c-2.5 3-2.5 14 0 17" stroke="currentColor" strokeWidth="1.6"/></svg>),
  lang: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h9M8 4v2M6 12c1.5-2 2.5-4 3-6M12 12c-2-2-3.5-4-4-6M4 12c3 .5 7-.5 10-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 20l4-10 4 10M12.5 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  tag: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3H5a2 2 0 0 0-2 2v7l9 9 9-9-9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/></svg>),
  folder: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  filter: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M6 12h12M9 18h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  plus: (<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
  close: (<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  upload: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  cog: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>),
};

const FILTER_OPTIONS = [
  { icon: Icon.id, key: "filterName", label: "Name" },
  { icon: Icon.pin, key: "filterCity", label: "City" },
  { icon: Icon.email, key: "email", label: "Email" },
  { icon: Icon.consent, key: "emailConsent", label: "Email consent" },
  { icon: Icon.calendar, key: "filterCreatedAt", label: "Created at" },
  { icon: Icon.chat, key: "filterChannel", label: "Channel" },
  { icon: Icon.phone, key: "phone", label: "Phone" },
  { icon: Icon.id, key: "filterId", label: "ID" },
  { icon: Icon.globe, key: "filterCountry", label: "Country" },
  { icon: Icon.lang, key: "filterBrowserLanguage", label: "Browser language" },
  { icon: Icon.tag, key: "filterTag", label: "Tag" },
  { icon: Icon.folder, key: "filterContactProperty", label: "Contact Property" },
];

function ConsentPill({ value }) {
  if (value === "-") return <span className="text-[#94a3b8]">-</span>;
  const cls = value === "Subscribed"
    ? "bg-[#dcfce7] text-[#15803d]"
    : "bg-[#fef3c7] text-[#b45309]";
  return <span className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[12px] ${cls}`}>{value} <span className="text-[10px]">▼</span></span>;
}

function ChannelIcons({ channels }) {
  return (
    <div className="flex items-center gap-1.5 text-[#94a3b8]">
      {channels.includes("chat") && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-5 3V8Z" stroke="currentColor" strokeWidth="1.6"/></svg>}
      {channels.includes("fb") && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2H17V2h-3c-3 0-4.5 1.8-4.5 4.5V10H7v4h2.5v8H13z"/></svg>}
    </div>
  );
}

const CUSTOMIZE_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name", locked: true },
  { key: "channels", label: "Channels" },
  { key: "recent", label: "Recent activity" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "consent", label: "Email consent" },
  { key: "created", label: "Created at" },
  { key: "language", label: "Browser language" },
  { key: "ip", label: "IP Address" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "browser", label: "Browser" },
  { key: "os", label: "OS" },
  { key: "device", label: "Device" },
  { key: "timezone", label: "Timezone" },
  { key: "tags", label: "Tags" },
  { key: "whatsapp", label: "WhatsApp Number" },
];

const DEFAULT_VISIBLE = ["name", "channels", "email", "phone", "ip", "country", "city", "browser", "tags"];

function ImportModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[560px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold text-[#111827]">Import your contacts</div>
        <div className="mt-3 flex flex-wrap gap-5 text-[13px] text-[#2563eb]">
          <span className="cursor-pointer">◫ How to format your file</span>
          <span className="cursor-pointer">◫ How to map data</span>
          <span className="cursor-pointer underline">◫ How to finalize your import</span>
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#111827]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb] text-[12px] text-white">1</span>
            Upload your file
          </div>
          <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-[#cfd8e3] px-6 py-8 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round"/><path d="M14 3v6h6" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            <div className="text-[13px]"><span className="text-[#2563eb] cursor-pointer">Click here</span> <span className="text-[#334155]">to upload your file or drag and drop it here.</span></div>
            <div className="text-[12px] text-[#94a3b8]">(.csv)</div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-[14px] text-[#94a3b8]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5eaf1] text-[12px] text-[#94a3b8]">2</span>
          Map contact data
        </div>
        <div className="mt-3 flex items-center gap-2 text-[14px] text-[#94a3b8]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5eaf1] text-[12px] text-[#94a3b8]">3</span>
          Finalize your import
        </div>
      </div>
    </div>
  );
}

function ContactsTable({ rows, title, chips = null, externalSearchQuery, onExternalSearchChange }) {
  const tr = useT();
  const [showFilter, setShowFilter] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchMode, setMatchMode] = useState("all");
  const [showCustomize, setShowCustomize] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [visible, setVisible] = useState(new Set(DEFAULT_VISIBLE));
  const [internalQuery, setInternalQuery] = useState("");
  const query = externalSearchQuery !== undefined ? externalSearchQuery : internalQuery;
  const setQuery = onExternalSearchChange || setInternalQuery;
  const [selected, setSelected] = useState(new Set());

  const filteredRows = rows.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.country.toLowerCase().includes(q);
  });

  const allSelected = filteredRows.length > 0 && filteredRows.every((_, i) => selected.has(i));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredRows.map((_, i) => i)));
  }
  function toggleRow(i) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  function toggleCol(key) {
    const col = CUSTOMIZE_COLUMNS.find((c) => c.key === key);
    if (col?.locked) return;
    setVisible((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const localizedColLabel = (key) => tr("col" + key.charAt(0).toUpperCase() + key.slice(1), CUSTOMIZE_COLUMNS.find((c) => c.key === key)?.label || key);

  function exportCSV() {
    const cols = CUSTOMIZE_COLUMNS.filter((c) => visible.has(c.key));
    const src = selected.size > 0 ? filteredRows.filter((_, i) => selected.has(i)) : filteredRows;
    const esc = (v) => `"${String(v ?? "-").replace(/"/g, '""')}"`;
    const lines = [cols.map((c) => localizedColLabel(c.key)).join(","), ...src.map((r) => cols.map((c) => esc(r[c.key])).join(","))];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "contacts.csv"; a.click();
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f6f8fb] p-3 md:p-5">
      <div className="text-[22px] font-semibold text-[#111827]">{title}</div>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[14px] border border-[#dfe5ee] bg-white p-3">
        <div className="relative">
          <button onClick={() => setMatchOpen((v) => !v)} className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] text-[#334155] hover:bg-[#f4f6f9]">
            <span className="text-[#94a3b8]">{Icon.filter}</span>
            {tr("thatMatch", "That match")} {matchMode === "all" ? tr("matchAll", "all filters") : tr("matchAny", "any filter")}
            <span className="text-[#94a3b8]">▼</span>
          </button>
          {matchOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-[12px] border border-[#dfe5ee] bg-white p-1 shadow-lg">
              {[["all", tr("thatMatch", "That match") + " " + tr("matchAll", "all filters")], ["any", tr("thatMatch", "That match") + " " + tr("matchAny", "any filter")]].map(([k, l]) => (
                <button key={k} onClick={() => { setMatchMode(k); setMatchOpen(false); }} className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] text-[#334155] hover:bg-[#f4f6f9]">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${matchMode === k ? "border-[#2563eb]" : "border-[#cfd8e3]"}`}>
                    {matchMode === k && <span className="h-2 w-2 rounded-full bg-[#2563eb]" />}
                  </span>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
        {chips}
        <div className="relative">
          <button onClick={() => setShowFilter((v) => !v)} className="text-[13px] text-[#2563eb]">{tr("addFilter", "+ Add filter")}</button>
          {showFilter && (
            <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-[12px] border border-[#dfe5ee] bg-white p-1 shadow-lg">
              {FILTER_OPTIONS.map((o) => (
                <div key={o.label} className="flex cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] text-[#334155] hover:bg-[#f4f6f9]">
                  <span className="text-[#94a3b8]">{o.icon}</span><span>{tr(o.key, o.label)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 rounded-[8px] bg-[#eef2f7] px-3 py-1.5 text-[13px] text-[#a1acbb]">{Icon.plus} {tr("saveAsSegment", "Save as segment")}</button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[13px] text-[#334155]">{tr("results", "Results")}: {filteredRows.length}</div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 md:flex-none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6" stroke="#94a3b8" strokeWidth="1.7"/><path d="m20 20-4-4" stroke="#94a3b8" strokeWidth="1.7" strokeLinecap="round"/></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("searchPlaceholder", "Search by name, email or country")} className="w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-[#94a3b8] md:w-[260px]" />
            {query && <button onClick={() => setQuery("")} className="text-[#94a3b8] hover:text-[#334155]">✕</button>}
          </div>
          {selected.size > 0 && <div className="text-[13px] text-[#2563eb]">{selected.size} {tr("selectedCount", "selected")}</div>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[13px] text-[#334155]"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#334155" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{selected.size > 0 ? `${tr("export", "Export")} (${selected.size})` : tr("exportCsv", "Export CSV")}</button>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[13px] text-[#334155]">{Icon.upload} {tr("importFromFile", "Import from file")}</button>
          <div className="relative">
            <button onClick={() => setShowCustomize((v) => !v)} className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[13px] text-[#334155]">{Icon.cog} {tr("customize", "Customize")}</button>
            {showCustomize && (
              <div className="absolute right-0 top-full z-20 mt-1 max-h-[320px] w-60 overflow-y-auto rounded-[12px] border border-[#dfe5ee] bg-white p-1 shadow-lg">
                {CUSTOMIZE_COLUMNS.map((c) => {
                  const checked = visible.has(c.key);
                  return (
                    <label key={c.key} className={`flex cursor-pointer items-center justify-between rounded-[8px] px-3 py-2 text-[13px] ${c.locked ? "text-[#94a3b8]" : "text-[#334155] hover:bg-[#f4f6f9]"}`}>
                      <span>{localizedColLabel(c.key)}</span>
                      <input type="checkbox" checked={checked} disabled={c.locked} onChange={() => toggleCol(c.key)} className="accent-[#2563eb]" />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div className="mt-3 overflow-x-auto rounded-[12px] border border-[#dfe5ee] bg-white">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead>
            <tr className="border-b border-[#eef2f7] text-left text-[12px] text-[#94a3b8]">
              <th className="w-10 px-3 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#2563eb]" /></th>
              {CUSTOMIZE_COLUMNS.filter((c) => visible.has(c.key)).map((c) => (
                <th key={c.key} className="py-3 font-medium">
                  {localizedColLabel(c.key)}
                  {c.key === "consent" && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#cfd8e3] text-[10px] text-[#ef233c]">?</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={i} className={`border-b border-[#eef2f7] last:border-0 ${selected.has(i) ? "bg-[#eff6ff]" : ""}`}>
                <td className="px-3 py-3"><input type="checkbox" checked={selected.has(i)} onChange={() => toggleRow(i)} className="accent-[#2563eb]" /></td>
                {CUSTOMIZE_COLUMNS.filter((c) => visible.has(c.key)).map((c) => {
                  switch (c.key) {
                    case "id": return <td key={c.key} className="py-3 text-[#94a3b8]">-</td>;
                    case "name": return (
                      <td key={c.key} className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: r.color }}>{r.initial}</div>
                          <span className="text-[#111827]">{r.name}</span>
                        </div>
                      </td>
                    );
                    case "channels": return <td key={c.key} className="py-3"><ChannelIcons channels={r.channels} /></td>;
                    case "recent": return (
                      <td key={c.key} className="py-3 text-[#94a3b8]">
                        <span className="inline-flex items-center gap-1"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-5 3V8Z" stroke="currentColor" strokeWidth="1.6"/></svg></span>
                        <span className="ml-2 inline-flex items-center gap-1"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M4 9h16" stroke="currentColor" strokeWidth="1.6"/></svg></span>
                      </td>
                    );
                    case "email": return <td key={c.key} className="py-3 text-[#334155]">{r.email}</td>;
                    case "consent": return <td key={c.key} className="py-3"><ConsentPill value={r.consent} /></td>;
                    case "country": return <td key={c.key} className="py-3 text-[#334155]">{r.country}</td>;
                    case "phone": return <td key={c.key} className="py-3 text-[#334155]">{r.phone}</td>;
                    case "ip": return <td key={c.key} className="py-3 font-mono text-[12px] text-[#334155]">{r.ip}</td>;
                    case "city": return <td key={c.key} className="py-3 text-[#334155]">{r.city}</td>;
                    case "browser": return <td key={c.key} className="py-3 text-[#334155]">{r.browser}</td>;
                    case "os": return <td key={c.key} className="py-3 text-[#334155]">{r.os}</td>;
                    case "device": return <td key={c.key} className="py-3 text-[#334155]">{r.device}</td>;
                    case "timezone": return <td key={c.key} className="py-3 text-[#334155]">{r.timezone}</td>;
                    case "language": return <td key={c.key} className="py-3 text-[#334155]">{r.language}</td>;
                    case "tags": return <td key={c.key} className="py-3 text-[#94a3b8]">-</td>;
                    default: return <td key={c.key} className="py-3 text-[#94a3b8]">-</td>;
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CountryFlag({ code, size = 18 }) {
  if (!code || code.length !== 2) return null;
  const lc = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w20/${lc}.png`}
      srcSet={`https://flagcdn.com/w40/${lc}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={code}
      className="inline-block rounded-[2px] border border-[#e5eaf1]"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}

function browserIcon(browser) {
  const b = (browser || "").toLowerCase();
  if (b.includes("chrome")) return <span title={browser} className="text-[14px]">🌐</span>;
  if (b.includes("firefox")) return <span title={browser} className="text-[14px]">🦊</span>;
  if (b.includes("safari")) return <span title={browser} className="text-[14px]">🧭</span>;
  if (b.includes("edge")) return <span title={browser} className="text-[14px]">🌀</span>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="13" rx="2" stroke="#94a3b8" strokeWidth="1.6"/><path d="M8 20h8M12 17v3" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

function timeAgo(iso, tr) {
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  const t = tr || ((_, fb) => fb);
  if (s < 10) return t("justNow", "just now");
  if (s < 60) return `${s} ${t("secondsAgo", "seconds ago")}`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} ${t("minutesAgo", "minutes ago")}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${t("hoursAgo", "hours ago")}`;
  const d = Math.floor(h / 24);
  return `${d} ${t("daysAgo", "days ago")}`;
}

function NowLivePanel({ liveContacts, onStartChat }) {
  const tr = useT();
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  if (liveContacts.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#f6f8fb] p-4 md:p-8">
        <div className="mx-auto max-w-[900px] rounded-[16px] bg-white p-5 md:p-10">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
            <div>
              <div className="text-[26px] font-semibold leading-tight text-[#111827]">{tr("noVisitors", "There are no visitors on your website right now")}</div>
              <div className="mt-4 text-[13px] text-[#64748b]">{tr("noVisitorsHint", "This list will be updated automatically when you get visitors on your website.")}</div>
              <div className="mt-3 text-[13px] text-[#64748b]">{tr("addWidgetHint", "Add the widget to your site so that visitors appear here.")}</div>
            </div>
            <div className="space-y-3 rounded-[14px] bg-[#f6f8fb] p-5">
              {[
                { c: "#22d3ee", letter: "G", flag: "🇧🇪", bar: "bg-[#2563eb]" },
                { c: "#fca5a5", letter: "", flag: "🇨🇴", bar: "bg-[#dbeafe]" },
                { c: "#e5e7eb", letter: "", flag: "", bar: "bg-[#eef2f7]" },
                { c: "#e5e7eb", letter: "", flag: "", bar: "bg-[#eef2f7]" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: r.c }}>{r.letter}</div>
                  <div className="h-3 flex-1 rounded-full bg-[#e5eaf1]" />
                  <span className="text-base">{r.flag}</span>
                  <div className={`h-6 w-20 rounded-full ${r.bar}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const countries = ["all", ...Array.from(new Set(liveContacts.map((c) => c.country).filter(Boolean)))];
  const rows = liveContacts.filter((c) => {
    if (countryFilter !== "all" && c.country !== countryFilter) return false;
    if (typeFilter === "new" && c.returning) return false;
    if (typeFilter === "returning" && !c.returning) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#f6f8fb] p-3 md:p-5">
      <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-4 md:p-6">
        <div className="text-[22px] font-semibold text-[#111827]">{tr("nowLiveCount", "Now live:")} {liveContacts.length}</div>
        <div className="mt-1 text-[13px] text-[#64748b]">{tr("nowLiveHint", "Use real-time overview to track customers visiting your website.")}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[13px] text-[#334155] outline-none">
            {countries.map((c) => <option key={c} value={c}>{c === "all" ? tr("allCountries", "All countries") : c}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[13px] text-[#334155] outline-none">
            <option value="all">{tr("newAndReturning", "New & Returning")}</option>
            <option value="new">{tr("newVisitor", "New")}</option>
            <option value="returning">{tr("returningVisitor", "Returning")}</option>
          </select>
        </div>

        <div className="mt-5 overflow-hidden rounded-[12px] border border-[#eef2f7]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#eef2f7] bg-[#fafbfd] text-left text-[12px] text-[#94a3b8]">
                <th className="px-4 py-3 font-medium">{tr("colName", "Name")}</th>
                <th className="px-4 py-3 font-medium">{tr("entered", "Entered")} <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#cfd8e3] text-[10px]">?</span></th>
                <th className="px-4 py-3 font-medium"><span className="inline-flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#94a3b8" strokeWidth="1.6"/><path d="M3.5 12h17M12 3.5c2.5 3 2.5 14 0 17M12 3.5c-2.5 3-2.5 14 0 17" stroke="#94a3b8" strokeWidth="1.6"/></svg> / <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="13" rx="2" stroke="#94a3b8" strokeWidth="1.6"/><path d="M8 20h8M12 17v3" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/></svg></span></th>
                <th className="px-4 py-3 font-medium">{tr("lastVisitedPage", "Last Visited Page")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const label = c.name || c.email || `#${(c.id || "").slice(-5)}`;
                return (
                  <tr key={c.id} className="border-b border-[#eef2f7] last:border-0 hover:bg-[#f8fafc]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                        <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: colorFor(c.id) }}>{(label[0] || "?").toUpperCase()}</div>
                        <div>
                          <div className="text-[#111827]">{label}</div>
                          {!c.returning && <div className="text-[11px] text-[#64748b]">{tr("newVisitor", "New")}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">{timeAgo(c.lastSeenAt, tr)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.country ? <CountryFlag code={c.country} /> : <span className="text-[#cbd5e1]">—</span>}
                        {browserIcon(c.browser)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {c.currentUrl ? (
                        <a href={c.currentUrl} target="_blank" rel="noopener noreferrer" className="max-w-[280px] truncate text-[#2563eb] hover:underline block">
                          {c.currentUrl.replace(/^https?:\/\//, "")}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onStartChat && onStartChat(c.id)}
                        className="rounded-[8px] border border-[#2563eb] bg-white px-3 py-1.5 text-[12px] font-medium text-[#2563eb] hover:bg-[#eff6ff]">
                        {tr("startChatBtn", "Start Chat")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const PALETTE = ["#9eacbe","#f3497b","#4b6fff","#6a98f2","#6d31f3","#6c7cff","#ff7b52","#41b8ff","#ff6457","#9f6630","#5f7cff","#d56cff","#f9b233","#5e7683"];
function colorFor(id) {
  let h = 0;
  for (const c of id || "") h = (h * 31 + c.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function mapContact(c) {
  const display = c.name || c.email || `#${c.id.slice(-4)}`;
  const createdAt = c.createdAt ? new Date(c.createdAt).getTime() : 0;
  const seenAt = c.lastSeenAt ? new Date(c.lastSeenAt).getTime() : 0;
  return {
    id: c.id,
    name: display,
    initial: display.slice(0, 1).toUpperCase(),
    color: colorFor(c.id),
    email: c.email || "-",
    phone: c.phone || "-",
    ip: c.ip || "-",
    consent: "-",
    country: c.country || "",
    countryName: c.countryName || "",
    countryDisplay: c.countryName ? `(${c.country || ""}) ${c.countryName}` : c.country || "-",
    city: c.city || "-",
    channels: ["chat"],
    browser: c.browser || "-",
    os: c.os || "-",
    device: c.device || "-",
    timezone: c.timezone || "-",
    language: c.language || "-",
    currentUrl: c.currentUrl || "",
    lastSeenAt: c.lastSeenAt,
    createdAt: c.createdAt,
    returning: seenAt - createdAt > 5 * 60 * 1000,
  };
}

const LIVE_WINDOW_MS = 2 * 60 * 1000; // 2 dəqiqə

export default function CustomersPage({ searchQuery, onSearchChange, onStartChat }) {
  const tr = useT();
  const [active, setActive] = useState("now-live");
  const [mobileShowContent, setMobileShowContent] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [filtered, all] = await Promise.all([
          api.listContacts(),
          api.listAllContacts(),
        ]);
        if (cancelled) return;
        setContacts(filtered.map(mapContact));
        setAllContacts(all.map(mapContact));
      } catch {
        if (!cancelled) { setContacts([]); setAllContacts([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const iv = setInterval(() => { load(); setTick((t) => t + 1); }, 15000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // Real varsa onu göstər, yoxsa mock (All contacts/Subscribers üçün)
  const useReal = contacts.length > 0;
  const CONTACTS = useReal ? contacts.map((c) => ({ ...c, country: c.countryDisplay })) : MOCK_CONTACTS;
  const subscribersRows = CONTACTS.filter((c) => c.consent === "Subscribed");

  // Live ziyarətçilər: son 2 dəq içində görünüb (anonim daxil)
  const now = Date.now();
  const liveContacts = allContacts.filter((c) => c.lastSeenAt && now - new Date(c.lastSeenAt).getTime() < LIVE_WINDOW_MS);

  const subscriberChips = (
    <>
      <div className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe5ee] px-3 py-1.5 text-[12px] text-[#334155]">
        <span className="text-[#94a3b8]">{Icon.consent}</span>
        <span><span className="text-[#94a3b8]">Email consent</span> <span className="text-[#94a3b8]">is:</span> Subscribed</span>
        <span className="cursor-pointer text-[#94a3b8]">✕</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe5ee] px-3 py-1.5 text-[12px] text-[#334155]">
        <span className="text-[#94a3b8]">{Icon.email}</span>
        <span>Email <span className="text-[#94a3b8]">has any value</span></span>
        <span className="cursor-pointer text-[#94a3b8]">✕</span>
      </div>
    </>
  );

  const activeLabel = active === "now-live" ? tr("nowLive", "Now live")
    : active === "all" ? tr("allContacts", "All contacts")
    : active === "subscribers" ? tr("subscribersTitle", "Subscribers")
    : "";
  const pickItem = (key) => { setActive(key); setMobileShowContent(true); };

  return (
    <div className="flex min-h-0 flex-1">
      <aside className={`${mobileShowContent ? "hidden" : "flex"} w-full flex-col border-r border-[#dfe5ee] bg-white p-4 md:flex md:w-[220px] md:shrink-0`}>
        <div className="text-[18px] font-semibold text-[#111827]">{tr("pageCustomers", "Customers")}</div>
        <div className="mt-5 text-[11px] font-semibold tracking-wider text-[#94a3b8]">{tr("visitors", "VISITORS")}</div>
        <div className="mt-1 space-y-1">
          <button onClick={() => pickItem("now-live")}
            className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-[13px] ${active === "now-live" ? "bg-[#eef2f7] text-[#111827]" : "text-[#334155] hover:bg-[#f4f6f9]"}`}>
            <span>{tr("nowLive", "Now live")}</span>
            <span className={`rounded-full px-2 text-[11px] ${liveContacts.length > 0 ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#dde5ee] text-[#334155]"}`}>{liveContacts.length}</span>
          </button>
        </div>
        <div className="mt-5 text-[11px] font-semibold tracking-wider text-[#94a3b8]">{tr("segments", "SEGMENTS")}</div>
        <div className="mt-1 space-y-1">
          <button onClick={() => pickItem("all")}
            className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-[13px] ${active === "all" ? "bg-[#eef2f7] text-[#111827]" : "text-[#334155] hover:bg-[#f4f6f9]"}`}>
            <span>{tr("allContacts", "All contacts")}</span>
            <span className="text-[12px] text-[#94a3b8]">{CONTACTS.length}</span>
          </button>
          <button onClick={() => pickItem("subscribers")}
            className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-[13px] ${active === "subscribers" ? "bg-[#eef2f7] text-[#111827]" : "text-[#334155] hover:bg-[#f4f6f9]"}`}>
            <span>{tr("subscribersTitle", "Subscribers")}</span>
            <span className="text-[12px] text-[#94a3b8]">{subscribersRows.length}</span>
          </button>
        </div>
      </aside>
      <div className={`${mobileShowContent ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
        <div className="flex h-[44px] shrink-0 items-center gap-2 border-b border-[#dfe5ee] bg-white px-3 md:hidden">
          <button onClick={() => setMobileShowContent(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#334155] hover:bg-[#eef2f7]" aria-label={tr("back", "Back")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="text-[14px] font-medium text-[#111827]">{activeLabel}</div>
        </div>
        {active === "now-live" && <NowLivePanel liveContacts={liveContacts} onStartChat={onStartChat} />}
        {active === "all" && <ContactsTable rows={CONTACTS} title={tr("allContacts", "All contacts")} externalSearchQuery={searchQuery} onExternalSearchChange={onSearchChange} />}
        {active === "subscribers" && <ContactsTable rows={subscribersRows} title={tr("subscribersTitle", "Subscribers")} chips={subscriberChips} externalSearchQuery={searchQuery} onExternalSearchChange={onSearchChange} />}
      </div>
    </div>
  );
}
