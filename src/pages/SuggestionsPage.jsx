import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useT, useLanguage } from "../LanguageContext.jsx";

function formatDate(d, tr, localeTag) {
  if (!d) return "";
  const t = tr || ((_, fb) => fb);
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return t("now", "now");
  if (diff < 3600) return Math.floor(diff / 60) + " " + t("minsAgo", "min ago");
  if (diff < 86400) return Math.floor(diff / 3600) + " " + t("hrsAgo", "h ago");
  return date.toLocaleDateString(localeTag || "en");
}

function AddToKnowledgeModal({ suggestion, onClose, onSaved }) {
  const tr = useT();
  const [title, setTitle] = useState(suggestion.question.slice(0, 120));
  const [content, setContent] = useState(suggestion.answer || "");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!title.trim() || !content.trim()) {
      setError(tr("titleRequired", "Title and Content are required"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.addSuggestionToKnowledge(suggestion.id, {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      onSaved();
    } catch (e) {
      setError(e.message || tr("error", "Error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="relative w-full max-w-[640px] rounded-[16px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold text-[#111827]">{tr("addToKb", "Add to Knowledge")}</div>
        <div className="mt-1 text-[12px] text-[#64748b]">{tr("visitorQuestion", "Visitor question:")} "{suggestion.question}"</div>
        {error && <div className="mt-3 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("entryTitleLabel", "Title")}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("contentAnswer", "Content (answer)")}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={7}
              placeholder={suggestion.answered ? "" : tr("writeAnswerHere", "Write an answer for this question...")}
              className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("tagsCommaLabel", "Tags (comma-separated)")}</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={tr("tagsPlaceholder", "price, shipping...")}
              className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-[10px] border border-[#e5eaf1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#f8fafc]">{tr("cancel", "Cancel")}</button>
          <button onClick={save} disabled={saving} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60">
            {saving ? tr("saving", "Saving...") : tr("saveToKb", "Save to Knowledge")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuggestionsPage() {
  const tr = useT();
  const { language } = useLanguage();
  const localeTag = { AZ: "az-AZ", EN: "en-US", TR: "tr-TR", RU: "ru-RU" }[language] || "en-US";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unanswered | answered
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const list = await api.listSuggestions();
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDismiss(id) {
    try {
      await api.dismissSuggestion(id);
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (e) { alert(e.message || tr("error", "Error")); }
  }

  const filtered = useMemo(() => {
    if (filter === "unanswered") return items.filter((s) => !s.answered);
    if (filter === "answered") return items.filter((s) => s.answered);
    return items;
  }, [items, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    unanswered: items.filter((s) => !s.answered).length,
    answered: items.filter((s) => s.answered).length,
  }), [items]);

  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb]">
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-[960px]">
          <h1 className="text-[22px] font-semibold text-[#111827]">{tr("suggestionsTitle", "Suggestions")}</h1>
          <p className="mt-1 text-[13px] text-[#64748b]">
            {tr("sugPageHint", "Unanswered questions and operator replies.")}
          </p>

          <div className="mt-5 rounded-[12px] border border-[#e0e7ef] bg-[#eef4ff] p-4">
            <div className="text-[14px] font-semibold text-[#111827]">{tr("sugHeroTitle", "Improve AI Agent knowledge")}</div>
            <div className="mt-1 text-[13px] text-[#475569]">
              {tr("sugHeroHint", "Questions the bot could not answer are collected below.")}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 border-b border-[#e5eaf1]">
            {[
              { key: "all", label: `${tr("all", "All")} (${counts.all})` },
              { key: "unanswered", label: `${tr("unanswered", "Unanswered")} (${counts.unanswered})` },
              { key: "answered", label: `${tr("answered", "Answered")} (${counts.answered})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={`px-3 py-2 text-[13px] ${filter === t.key ? "border-b-2 border-[#2563eb] font-medium text-[#2563eb]" : "text-[#64748b] hover:text-[#111827]"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="py-10 text-center text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#cbd5e1] bg-white py-12 text-center">
                <div className="text-[14px] font-medium text-[#334155]">{tr("sugEmpty", "Nothing here yet")}</div>
                <div className="mt-1 text-[12px] text-[#64748b]">{tr("sugEmptyHint", "Shown when the bot cannot answer or an operator replies.")}</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((s) => (
                  <div key={s.id} className="rounded-[12px] border border-[#e5eaf1] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.answered ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>
                            {s.answered ? tr("answered", "Answered") : tr("unanswered", "Unanswered")}
                          </span>
                          <span className="text-[11px] text-[#94a3b8]">{formatDate(s.createdAt, tr, localeTag)}</span>
                          {s.contact?.name && <span className="text-[11px] text-[#64748b]">· {s.contact.name}</span>}
                          {s.contact?.email && <span className="text-[11px] text-[#64748b]">· {s.contact.email}</span>}
                        </div>
                        <div className="mt-2 text-[14px] font-medium text-[#111827]">❓ {s.question}</div>
                        {s.answer && (
                          <div className="mt-2 rounded-[8px] bg-[#f8fafc] p-3 text-[13px] text-[#334155] whitespace-pre-wrap">
                            <div className="mb-1 text-[11px] font-medium text-[#64748b]">{tr("operatorAnswer", "Operator reply:")}</div>
                            {s.answer}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button onClick={() => setSelected(s)} className="rounded-[10px] bg-[#2563eb] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1d4ed8]">
                          {tr("addToKbAction", "+ Add to Knowledge")}
                        </button>
                        <button onClick={() => handleDismiss(s.id)} className="rounded-[10px] border border-[#e5eaf1] bg-white px-3 py-1.5 text-[12px] font-medium text-[#64748b] hover:bg-[#f8fafc]">
                          {tr("dismissAction", "Dismiss")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <AddToKnowledgeModal
          suggestion={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            // Əlavə edildi → siyahıdan çıxar
            setItems((p) => p.filter((x) => x.id !== selected.id));
          }}
        />
      )}
    </div>
  );
}
