import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

const I = {
  check: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  user: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6"/><path d="M5 19c1.2-3 4-4.5 7-4.5s5.8 1.5 7 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  reply: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 14 4 9l5-5M4 9h9a7 7 0 0 1 7 7v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  smile: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7"/><circle cx="9.25" cy="10.5" r="1" fill="currentColor"/><circle cx="14.75" cy="10.5" r="1" fill="currentColor"/><path d="M8.5 14.5c.8 1.5 2.2 2 3.5 2s2.7-.5 3.5-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>),
  paperclip: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.65l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  macro: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  assign: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 21a8 8 0 1 1 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M15 18h6M18 15v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>),
  circle: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7"/></svg>),
  refresh: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0 1 15.5-6.3M21 4v6h-6M21 12a9 9 0 0 1-15.5 6.3M3 20v-6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

function Shortcut({ keys }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd key={k} className="rounded-[4px] border border-[#dfe5ee] bg-[#f8fafc] px-1.5 py-0.5 text-[10px] font-medium text-[#64748b]">{k}</kbd>
      ))}
    </div>
  );
}

export default function CommandPalette({ open, onClose, actions }) {
  const tr = useT();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setActiveTab("all");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const tabs = useMemo(() => {
    const set = new Set(actions.map((a) => a.group || "Other"));
    return ["all", ...Array.from(set)];
  }, [actions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actions.filter((a) => {
      if (a.disabled) return false;
      if (activeTab !== "all" && (a.group || "Other") !== activeTab) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q);
    });
  }, [actions, query, activeTab]);

  useEffect(() => { setActiveIdx(0); }, [query, activeTab]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        const a = filtered[activeIdx];
        if (a) { onClose(); setTimeout(() => a.run(), 0); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, filtered, activeIdx, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[10vh]" onMouseDown={onClose}>
      <div className="w-full max-w-[560px] overflow-hidden rounded-[14px] border border-[#e5eaf1] bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-[#eef2f7] px-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#94a3b8]"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8"/><path d="m20 20-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("cmdSearchPlaceholder", "Search conversation actions…")}
            className="h-11 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#94a3b8]" />
        </div>

        <div className="flex items-center gap-1 border-b border-[#eef2f7] px-3 py-2 text-[12px]">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`rounded-[6px] px-2.5 py-1 capitalize ${activeTab === t ? "bg-[#eff6ff] text-[#2563eb] font-medium" : "text-[#64748b] hover:bg-[#f4f6f9]"}`}>
              {t === "all" ? tr("cmdAll", "All") : t}
            </button>
          ))}
        </div>

        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px] text-[#94a3b8]">{tr("cmdNoResults", "No results found")}</div>
          )}
          {filtered.map((a, i) => (
            <button key={a.id} data-idx={i}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => { onClose(); setTimeout(() => a.run(), 0); }}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === activeIdx ? "bg-[#f4f6f9]" : ""}`}>
              <span className="text-[#64748b]">{a.icon || I.circle}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] text-[#111827]">{a.title}</div>
                {a.description && <div className="truncate text-[11px] text-[#94a3b8]">{a.description}</div>}
              </div>
              {a.shortcut && <Shortcut keys={a.shortcut} />}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#eef2f7] bg-[#fbfcfe] px-3 py-1.5 text-[11px] text-[#94a3b8]">
          <div className="flex items-center gap-3">
            <span>{tr("cmdNavigate", "↑↓ navigate")}</span>
            <span>{tr("cmdSelect", "⤵ select")}</span>
            <span>{tr("cmdCloseHint", "Esc close")}</span>
          </div>
          <span>{tr("cmdOpenHint", "Ctrl+K to open")}</span>
        </div>
      </div>
    </div>
  );
}

// Assign picker — shown when user picks "Assign to..."
export function AssignModal({ open, onClose, onSelect, currentAssigneeId, currentUserId }) {
  const tr = useT();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setQ("");
    api.listTeam().then((list) => setTeam(list || [])).catch(() => setTeam([])).finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;
  const filtered = team.filter((m) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (m.name || "").toLowerCase().includes(s) || (m.email || "").toLowerCase().includes(s);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[15vh]" onMouseDown={onClose}>
      <div className="w-full max-w-[420px] overflow-hidden rounded-[14px] border border-[#e5eaf1] bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="border-b border-[#eef2f7] px-4 py-3 text-[14px] font-semibold text-[#111827]">{tr("assignConversationTo", "Assign conversation to…")}</div>
        <div className="border-b border-[#eef2f7] px-3 py-2">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("searchTeam", "Search team member…")}
            className="h-9 w-full rounded-[8px] border border-[#e5eaf1] bg-white px-3 text-[13px] outline-none focus:border-[#2563eb]" />
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {loading && <div className="px-4 py-4 text-center text-[13px] text-[#94a3b8]">{tr("loading", "Loading…")}</div>}
          {!loading && currentUserId && (
            <button onClick={() => onSelect(currentUserId)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#f4f6f9]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff6ff] text-[12px] text-[#2563eb]">★</span>
              <div className="flex-1 text-[13px] text-[#111827]">{tr("assignToMe", "Assign to me")}</div>
              {currentAssigneeId === currentUserId && <span className="text-[#2563eb]">{I.check}</span>}
            </button>
          )}
          <button onClick={() => onSelect(null)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#f4f6f9]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f5f9] text-[12px] text-[#94a3b8]">—</span>
            <div className="flex-1 text-[13px] text-[#111827]">{tr("unassign", "Unassign")}</div>
            {!currentAssigneeId && <span className="text-[#2563eb]">{I.check}</span>}
          </button>
          <div className="my-1 border-t border-[#eef2f7]" />
          {!loading && filtered.length === 0 && (
            <div className="px-4 py-4 text-center text-[13px] text-[#94a3b8]">{tr("teamMemberNotFound", "No team members found")}</div>
          )}
          {filtered.map((m) => (
            <button key={m.id} onClick={() => onSelect(m.id)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#f4f6f9]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e0e6ef] text-[12px] font-medium text-[#475569]">
                {(m.name || m.email || "?").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] text-[#111827]">{m.name || m.email}</div>
                {m.name && <div className="truncate text-[11px] text-[#94a3b8]">{m.email}</div>}
              </div>
              {currentAssigneeId === m.id && <span className="text-[#2563eb]">{I.check}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { I as CmdIcons };
