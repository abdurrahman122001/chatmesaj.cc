import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

function AddEditModal({ entry, onClose, onSave }) {
  const tr = useT();
  const [mode, setMode] = useState("manual"); // manual | url | csv
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [url, setUrl] = useState(entry?.url || "");
  const [tags, setTags] = useState((entry?.tags || []).join(", "));
  const [status, setStatus] = useState(entry?.status || "ACTIVE");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [csvText, setCsvText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSave() {
    setError("");
    setInfo("");
    setSaving(true);
    try {
      if (mode === "manual") {
        if (!title.trim() || !content.trim()) throw new Error(tr("kbTitleContentReq", "Title and content are required"));
        const body = {
          title: title.trim(),
          content: content.trim(),
          url: url.trim() || null,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          status,
        };
        const saved = entry ? await api.updateKnowledge(entry.id, body) : await api.createKnowledge(body);
        onSave(saved);
      } else if (mode === "url") {
        if (!scrapeUrl.trim()) throw new Error(tr("urlRequired", "URL is required"));
        setInfo(tr("kbScraping", "Fetching page and extracting text..."));
        const saved = await api.scrapeKnowledgeUrl(scrapeUrl.trim());
        setInfo(`"${saved.title}" ${tr("kbAddedOk", "added successfully")}`);
        setTimeout(() => onSave(saved), 800);
      } else if (mode === "csv") {
        if (!csvText.trim()) throw new Error(tr("csvEmpty", "CSV is empty"));
        const result = await api.importKnowledgeCsv(csvText);
        setInfo(`${result.count} ${tr("kbEntryCountAdded", "entries added")}`);
        setTimeout(() => onSave(result), 800);
      }
    } catch (err) {
      setError(err.message || tr("error", "Error"));
    } finally {
      setSaving(false);
    }
  }

  const tabBtn = (id, label) => (
    <button type="button" onClick={() => { setMode(id); setError(""); setInfo(""); }}
      className={`rounded-[10px] border px-3 py-1.5 text-[12px] ${mode === id ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#dfe5ee] bg-white text-[#64748b] hover:bg-[#f4f6f9]"}`}>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[680px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold text-[#111827]">{entry ? tr("kbEditKnowledge", "Edit knowledge") : tr("kbAddKnowledge", "+ Add knowledge")}</div>
        <div className="mt-1 text-[13px] text-[#64748b]">{tr("kbPageHint", "The bot uses this content to answer customer questions.")}</div>

        {!entry && (
          <div className="mt-4 flex gap-2">
            {tabBtn("manual", tr("kbManualTab", "✍ Manual"))}
            {tabBtn("url", tr("kbUrlTab", "🌐 Website URL"))}
            {tabBtn("csv", tr("kbCsvTab", "📄 CSV import"))}
          </div>
        )}

        {mode === "manual" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("kbTitleLabel", "Title (question / topic)")}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr("kbTitlePlaceholder", "For example: Delivery time")}
                className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("kbContentLabel", "Content (answer)")}</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6}
                placeholder={tr("kbContentPlaceholder", "Write the reply text to show to the customer...")}
                className="w-full resize-none rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("urlOptional", "URL (optional)")}</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
                  className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("tagsCommaLabel", "Tags (comma-separated)")}</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={tr("kbTagsPlaceholder", "shipping, delivery")}
                  className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("status", "Status")}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]">
                <option value="ACTIVE">{tr("productStatusActive", "Active")}</option>
                <option value="DRAFT">{tr("productStatusDraft", "Draft")}</option>
                <option value="ARCHIVED">{tr("productStatusArchived", "Archived")}</option>
              </select>
            </div>
          </div>
        )}

        {mode === "url" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("kbWebsiteUrl", "Website URL")}</label>
              <input value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} placeholder="https://example.com/faq"
                className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
              <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("kbWebsiteHint", "Automatically extracts page text and adds it to the knowledge base.")}</div>
            </div>
          </div>
        )}

        {mode === "csv" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("kbCsvText", "CSV text")}</label>
              <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8}
                placeholder={'title,content,tags,url\n"Çatdırılma","24 saat ərzində","delivery",\n"Qaytarma","14 gün","refund",'}
                className="w-full resize-none rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[12px] font-mono outline-none focus:border-[#2563eb]" />
              <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("kbCsvHint", "Columns: title,content,tags,url. First row may be a header.")}</div>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-[#2563eb]">
              <input type="file" accept=".csv,text/csv" className="text-[11px]"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => setCsvText(String(r.result || ""));
                  r.readAsText(f);
                }} />
            </label>
          </div>
        )}

        {error && <div className="mt-3 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
        {info && <div className="mt-3 rounded-[8px] bg-[#dcfce7] px-3 py-2 text-[12px] text-[#15803d]">{info}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-[10px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button onClick={handleSave} disabled={saving}
            className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? tr("kbWorking", "Working...") : mode === "url" ? tr("kbScrapeBtn", "Scrape") : mode === "csv" ? tr("kbImportBtn", "Import") : tr("save", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestBotModal({ onClose }) {
  const tr = useT();
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runTest() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await api.testKnowledgeSearch(q);
      setResult(r);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[640px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold text-[#111827]">{tr("kbTestTitle", "Test the chatbot")}</div>
        <div className="mt-1 text-[13px] text-[#64748b]">{tr("kbTestHint", "If the visitor typed this question, what would it find?")}</div>

        <div className="mt-4 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()}
            placeholder={tr("kbTestPlaceholder", "For example: how long is delivery")}
            className="flex-1 rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
          <button onClick={runTest} disabled={loading || !q.trim()}
            className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {loading ? "..." : tr("kbTestBot", "Test")}
          </button>
        </div>

        {result && (
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {result.error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{result.error}</div>}
            {result.matches?.length === 0 && (
              <div className="rounded-[8px] bg-[#fef9c3] px-3 py-2 text-[13px] text-[#854d0e]">
                {tr("kbNoMatch", "No matching answer found.")}
              </div>
            )}
            {result.matches?.map((m, i) => (
              <div key={m.id} className="mb-3 rounded-[10px] border border-[#dfe5ee] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-[#111827] text-[14px]">{i + 1}. {m.title}</div>
                  <div className="shrink-0 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] text-[#15803d]">
                    {tr("kbScore", "score")}: {Number(m.score).toFixed(3)}
                  </div>
                </div>
                <div className="mt-1 text-[12px] text-[#64748b] whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DataSourcesPage({ searchQuery, onSearchChange }) {
  const tr = useT();
  const [internalQuery, setInternalQuery] = useState("");
  const query = searchQuery !== undefined ? searchQuery : internalQuery;
  const setQuery = onSearchChange || setInternalQuery;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [selected, setSelected] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const list = await api.listKnowledge();
      setRows(list);
    } catch (err) {
      setError(err.message || tr("kbBackendError", "Could not load. Is the backend running?"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "All" && r.status !== statusFilter.toUpperCase()) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q) || (r.tags || []).join(" ").toLowerCase().includes(q);
    });
  }, [rows, query, statusFilter]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected[r.id]);

  function toggleAll() {
    if (allSelected) {
      setSelected((p) => { const n = { ...p }; filtered.forEach((r) => delete n[r.id]); return n; });
    } else {
      setSelected((p) => { const n = { ...p }; filtered.forEach((r) => { n[r.id] = true; }); return n; });
    }
  }

  async function deleteSelected() {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (!ids.length) return;
    if (!confirm(`${ids.length} ${tr("kbDeleteConfirm", "entries will be deleted. Continue?")}`)) return;
    for (const id of ids) await api.deleteKnowledge(id);
    setSelected({});
    reload();
  }

  function openEdit(r) { setEditEntry(r); setShowAddEdit(true); }
  function openAdd() { setEditEntry(null); setShowAddEdit(true); }
  function onSaved() { setShowAddEdit(false); setEditEntry(null); reload(); }

  const fmt = (d) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-3 md:p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[22px] font-semibold text-[#111827]">{tr("knowledgeBase", "Knowledge base")}</div>
            <div className="mt-1 text-[13px] text-[#64748b]">{tr("kbPageHint", "The bot uses this content to answer customer questions.")}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowTest(true)} className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155] hover:bg-[#f4f6f9]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor"/></svg>
              {tr("kbTestBot", "Test bot")}
            </button>
            {Object.values(selected).some(Boolean) && (
              <button onClick={deleteSelected} className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-[13px] font-medium text-[#b91c1c]">
                {tr("kbDelSelected", "Delete")} ({Object.values(selected).filter(Boolean).length})
              </button>
            )}
            <button onClick={openAdd} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">{tr("kbAddKnowledge", "+ Add knowledge")}</button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 min-w-[280px] items-center gap-2 rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6" stroke="#94a3b8" strokeWidth="1.7"/><path d="m20 20-4-4" stroke="#94a3b8" strokeWidth="1.7" strokeLinecap="round"/></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("kbSearchPlaceholder", "Search by title, content or tag")}
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#94a3b8]" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-2 text-[13px] text-[#334155]">
            <option value="All">{tr("all", "All")}</option>
            <option value="Active">{tr("productStatusActive", "Active")}</option>
            <option value="Draft">{tr("productStatusDraft", "Draft")}</option>
            <option value="Archived">{tr("productStatusArchived", "Archived")}</option>
          </select>
        </div>

        {error && (
          <div className="mt-4 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-3 text-[13px] text-[#b91c1c]">{error}</div>
        )}

        <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#dfe5ee]">
          <div className="border-b border-[#eef2f7] px-4 py-3 text-[14px] font-semibold text-[#111827]">
            {loading ? tr("loading", "Loading...") : `${tr("results", "Results")}: ${filtered.length}`}
          </div>
          <div className="grid min-w-[720px] grid-cols-[32px_2.2fr_1fr_1.2fr_1fr_1.4fr_60px] items-center border-b border-[#eef2f7] px-4 py-2.5 text-[12px] text-[#94a3b8]">
            <input type="checkbox" className="accent-[#2563eb]" checked={allSelected} onChange={toggleAll} />
            <span>{tr("kbTitleCol", "Title")}</span><span>{tr("status", "Status")}</span><span>{tr("tags", "Tags")}</span><span>{tr("kbUrlLabel", "URL")}</span><span>{tr("kbUpdated", "Updated")}</span><span />
          </div>
          {!loading && filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-[13px] text-[#64748b]">
              {rows.length === 0 ? tr("kbNoEntriesYet", "No knowledge entries yet. Add your first one.") : tr("kbNoMatchSearch", "No results match your search.")}
            </div>
          )}
          {filtered.map((r) => (
            <div key={r.id}
              className={`grid min-w-[720px] grid-cols-[32px_2.2fr_1fr_1.2fr_1fr_1.4fr_60px] items-center border-b border-[#eef2f7] px-4 py-3 text-[13px] text-[#111827] last:border-0 ${selected[r.id] ? "bg-[#eff6ff]" : "hover:bg-[#f9fafb]"}`}>
              <input type="checkbox" className="accent-[#2563eb]" checked={!!selected[r.id]} onChange={() => setSelected((p) => ({ ...p, [r.id]: !p[r.id] }))} />
              <div className="min-w-0">
                <div className="truncate font-medium">{r.title}</div>
                <div className="truncate text-[11px] text-[#94a3b8]">{r.content.slice(0, 80)}{r.content.length > 80 ? "…" : ""}</div>
              </div>
              <span>
                <span className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[11px] ${
                  r.status === "ACTIVE" ? "bg-[#dcfce7] text-[#15803d]" : r.status === "DRAFT" ? "bg-[#fef9c3] text-[#854d0e]" : "bg-[#e5e7eb] text-[#6b7280]"
                }`}>{r.status === "ACTIVE" ? tr("productStatusActive", "Active") : r.status === "DRAFT" ? tr("productStatusDraft", "Draft") : tr("productStatusArchived", "Archived")}</span>
              </span>
              <span className="flex flex-wrap gap-1">
                {(r.tags || []).slice(0, 3).map((t) => (
                  <span key={t} className="inline-flex items-center rounded-[6px] bg-[#f1f5f9] px-2 py-0.5 text-[11px] text-[#334155]">{t}</span>
                ))}
              </span>
              <span className="truncate text-[12px] text-[#64748b]">{r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">{r.url}</a> : "—"}</span>
              <span className="text-[12px] text-[#64748b]">{fmt(r.updatedAt)}</span>
              <button onClick={() => openEdit(r)} className="rounded-[6px] px-2 py-1 text-[12px] text-[#2563eb] hover:bg-[#eff6ff]">{tr("edit", "Edit")}</button>
            </div>
          ))}
        </div>
      </div>
      {showAddEdit && <AddEditModal entry={editEntry} onClose={() => { setShowAddEdit(false); setEditEntry(null); }} onSave={onSaved} />}
      {showTest && <TestBotModal onClose={() => setShowTest(false)} />}
    </div>
  );
}
