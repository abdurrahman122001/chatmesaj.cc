import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

function MacroModal({ macro, onClose, onSave, tr }) {
  const [name, setName] = useState(macro?.name || "");
  const [text, setText] = useState(macro?.text || "");
  const [tag, setTag] = useState(macro?.tag || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!name.trim() || !text.trim()) { setError(tr("nameAndTextRequired", "Name and text are required")); return; }
    setSaving(true);
    setError("");
    try {
      const body = { name: name.trim(), text: text.trim(), tag: tag.trim() || null };
      const saved = macro ? await api.updateMacro(macro.id, body) : await api.createMacro(body);
      onSave(saved);
    } catch (err) {
      setError(err.message || tr("saveFailed", "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[560px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold text-[#111827]">{macro ? tr("editMacro", "Edit macro") : tr("newMacro", "New macro")}</div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("nameShortcut", "Name (shortcut)")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("macroNamePlaceholder", "e.g. Hello")}
              className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("text", "Text")}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
              placeholder={tr("macroPlaceholder", "Quick reply to send in chat...")}
              className="w-full resize-none rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("tagOptional", "Tag (optional)")}</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder={tr("tagPlaceholder", "Greeting / Support / Sales")}
              className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
          </div>
          {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-[10px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button onClick={save} disabled={saving} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? tr("saving", "Saving...") : tr("save", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MacrosPage() {
  const tr = useT();
  const [macros, setMacros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const list = await api.listMacros();
      setMacros(list);
    } catch (err) {
      setError(err.message || tr("loadFailed", "Load failed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm(tr("deleteConfirm", "delete?"))) return;
    try {
      await api.deleteMacro(id);
      setMacros((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message || tr("deleteFailed", "Delete failed"));
    }
  }

  function handleSaved(saved) {
    setModalOpen(false);
    setEditing(null);
    if (editing) {
      setMacros((prev) => prev.map((m) => m.id === saved.id ? saved : m));
    } else {
      setMacros((prev) => [saved, ...prev]);
    }
  }

  // Tag-lar üzrə qruplaşdır
  const groups = macros.reduce((acc, m) => {
    const tag = m.tag || "Untagged";
    (acc[tag] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#f6f8fb] p-3 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[22px] font-semibold text-[#111827]">{tr("macros", "Macros")}</div>
          <div className="text-[13px] text-[#64748b]">{tr("macrosDesc", "Quick replies — operators can send with one click during chat.")}</div>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="shrink-0 whitespace-nowrap rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">+ {tr("newMacro", "New macro")}</button>
      </div>

      {loading && <div className="text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>}
      {error && <div className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-3 text-[12px] text-[#b91c1c]">{error}</div>}
      {!loading && !macros.length && (
        <div className="rounded-[12px] border border-dashed border-[#cbd5e1] bg-white p-8 text-center text-[13px] text-[#64748b]">
          {tr("noMacros", "No macros yet. Create a new one.")}
        </div>
      )}

      {Object.entries(groups).map(([tag, list]) => (
        <div key={tag} className="rounded-[16px] border border-[#dfe5ee] bg-white">
          <div className="border-b border-[#eef2f7] px-5 py-3 text-[13px] font-semibold text-[#334155]">{tag} <span className="ml-2 text-[11px] text-[#94a3b8]">{list.length}</span></div>
          <div className="divide-y divide-[#eef2f7]">
            {list.map((m) => (
              <div key={m.id} className="flex items-start gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#111827]">{m.name}</div>
                  <div className="mt-0.5 truncate text-[12px] text-[#64748b]">{m.text}</div>
                </div>
                <button onClick={() => { setEditing(m); setModalOpen(true); }}
                  className="text-[12px] text-[#2563eb] hover:underline">{tr("edit", "Edit")}</button>
                <button onClick={() => handleDelete(m.id)}
                  className="text-[12px] text-[#ef4444] hover:underline">{tr("delete", "Delete")}</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {modalOpen && <MacroModal macro={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSaved} tr={tr} />}
    </div>
  );
}
