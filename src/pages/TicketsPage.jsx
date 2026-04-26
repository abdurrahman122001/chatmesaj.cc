import React, { useState, useEffect } from "react";
import { api } from "../api.js";
import { useT, useLanguage } from "../LanguageContext.jsx";

const SC = { OPEN: "#f59e0b", IN_REVIEW: "#3b82f6", IN_PROGRESS: "#8b5cf6", RESOLVED: "#22c55e", CANCELLED: "#94a3b8" };
const PC = { LOW: "#94a3b8", MEDIUM: "#3b82f6", HIGH: "#f59e0b", URGENT: "#ef4444" };
const STATS = ["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CANCELLED"];
const PRIS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUS_KEYS = { OPEN: "stOpen", IN_REVIEW: "stInReview", IN_PROGRESS: "stInProgress", RESOLVED: "stResolved", CANCELLED: "stCancelled" };
const PRIORITY_KEYS = { LOW: "stLow", MEDIUM: "stMedium", HIGH: "stHigh", URGENT: "stUrgent" };

function Badge({ color, children }) {
  return <span style={{ background: color + "18", color, border: `1px solid ${color}40` }} className="inline-block rounded-[6px] px-2 py-0.5 text-[11px] font-medium">{children}</span>;
}

export default function TicketsPage({ initialStatus = "" }) {
  const tr = useT();
  const { language } = useLanguage();
  const SL = (s) => tr(STATUS_KEYS[s] || "", s);
  const PL = (p) => tr(PRIORITY_KEYS[p] || "", p);
  const localeTag = { AZ: "az-AZ", EN: "en-US", TR: "tr-TR", RU: "ru-RU" }[language] || "en-US";
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState(initialStatus || "");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => { api.listTickets(filter || undefined).then(setTickets).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { setLoading(true); load(); }, [filter]);
  useEffect(() => { setFilter(initialStatus || ""); }, [initialStatus]);

  function update(id, data) {
    api.updateTicket(id, data).then((t) => {
      setTickets((p) => p.map((x) => x.id === id ? t : x));
      if (selected?.id === id) setSelected(t);
    });
  }

  function exportCsv() {
    const rows = [["ID", tr("ticketSubject", "Subject"), tr("ticketStatus", "Status"), tr("ticketPriority", "Priority"), tr("ticketCustomer", "Customer"), tr("email", "Email"), tr("phone", "Phone"), tr("description", "Description"), tr("ticketNotes", "Notes"), tr("createdAt", "Created")], ...tickets.map((t) => ["#"+t.id.slice(-6).toUpperCase(), t.subject, SL(t.status), PL(t.priority), t.contact?.name||"", t.contact?.email||"", t.contact?.phone||"", t.description, t.notes||"", new Date(t.createdAt).toLocaleString(localeTag)])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `tickets-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  const det = selected;
  const tid = det ? "#" + det.id.slice(-6).toUpperCase() : "";

  return (
    <div className="flex flex-1 overflow-hidden bg-[#f6f8fb]">
      {/* Sol — siyahı */}
      <div className="flex w-[420px] shrink-0 flex-col border-r border-[#dfe5ee] bg-white">
        <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
          <div className="text-[20px] font-semibold text-[#111827]">{tr("pageTickets", "Tickets")}</div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[13px] text-[#334155] hover:bg-[#f4f6f9]"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#334155" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{tr("exportCsv", "Export CSV")}</button>
            <span className="rounded-full bg-[#eef2f7] px-2.5 py-0.5 text-[12px] text-[#64748b]">{tickets.length}</span>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto border-b border-[#eef2f7] px-4 py-2">
          <button onClick={() => setFilter("")} className={`shrink-0 rounded-[8px] px-3 py-1 text-[12px] ${!filter ? "bg-[#2563eb] text-white" : "bg-[#f4f6f9] text-[#334155]"}`}>{tr("all", "All")}</button>
          {STATS.map((s) => <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-[8px] px-3 py-1 text-[12px] ${filter === s ? "bg-[#2563eb] text-white" : "bg-[#f4f6f9] text-[#334155]"}`}>{SL(s)}</button>)}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="py-8 text-center text-[13px] text-[#94a3b8]">{tr("loading", "Loading...")}</div>}
          {!loading && tickets.length === 0 && <div className="py-8 text-center text-[13px] text-[#94a3b8]">{tr("ticketNone", "No tickets")}</div>}
          {tickets.map((t) => (
            <div key={t.id} onClick={() => setSelected(t)} className={`cursor-pointer border-b border-[#eef2f7] px-5 py-3 ${selected?.id === t.id ? "bg-[#eff6ff]" : "hover:bg-[#f8fafc]"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#111827] truncate max-w-[240px]">{t.subject}</span>
                <Badge color={SC[t.status]}>{SL(t.status)}</Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[12px] text-[#94a3b8]">
                <span>{t.contact?.name || t.contact?.email || tr("anonymous", "Anonymous")}</span>
                <span>#{t.id.slice(-6).toUpperCase()}</span>
                <Badge color={PC[t.priority]}>{PL(t.priority)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sağ — detal */}
      <div className="flex-1 overflow-y-auto p-6">
        {!det ? (
          <div className="flex h-full items-center justify-center text-[14px] text-[#94a3b8]">{tr("selectTicket", "Select a ticket")}</div>
        ) : (
          <div className="mx-auto max-w-[640px] space-y-6">
            <div>
              <div className="text-[11px] text-[#94a3b8]">{tid}</div>
              <div className="text-[22px] font-semibold text-[#111827]">{det.subject}</div>
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-5 space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-[100px] text-[13px] text-[#64748b]">{tr("ticketStatus", "Status")}</label>
                <select value={det.status} onChange={(e) => update(det.id, { status: e.target.value })} className="rounded-[8px] border border-[#cfd8e3] px-3 py-1.5 text-[13px] outline-none">
                  {STATS.map((s) => <option key={s} value={s}>{SL(s)}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-[100px] text-[13px] text-[#64748b]">{tr("ticketPriority", "Priority")}</label>
                <select value={det.priority} onChange={(e) => update(det.id, { priority: e.target.value })} className="rounded-[8px] border border-[#cfd8e3] px-3 py-1.5 text-[13px] outline-none">
                  {PRIS.map((p) => <option key={p} value={p}>{PL(p)}</option>)}
                </select>
              </div>
              <div className="flex items-start gap-4">
                <label className="w-[100px] pt-1 text-[13px] text-[#64748b]">{tr("ticketCustomer", "Customer")}</label>
                <div className="text-[13px]">
                  <div className="text-[#111827]">{det.contact?.name || "-"}</div>
                  <div className="text-[#64748b]">{det.contact?.email || "-"}</div>
                  <div className="text-[#64748b]">{det.contact?.phone || ""}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-5">
              <div className="mb-2 text-[13px] font-medium text-[#111827]">{tr("description", "Description")}</div>
              <div className="whitespace-pre-wrap text-[13px] text-[#334155]">{det.description || "-"}</div>
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-5">
              <div className="mb-2 text-[13px] font-medium text-[#111827]">{tr("internalNote", "Internal note")}</div>
              <textarea defaultValue={det.notes || ""} onBlur={(e) => update(det.id, { notes: e.target.value })} className="w-full resize-none rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" rows={3} placeholder={tr("adminNotePlaceholder", "Admin note...")} />
            </div>
            <div className="text-[12px] text-[#94a3b8]">{tr("createdAt", "Created")}: {new Date(det.createdAt).toLocaleString(localeTag)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
