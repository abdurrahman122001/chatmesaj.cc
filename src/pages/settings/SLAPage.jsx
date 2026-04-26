import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

function AddPolicyModal({ onClose, onAdd, tr }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [first, setFirst] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");

  function save() {
    if (!name.trim()) { setError(tr("nameRequired", "Name is required")); return; }
    const firstH = Number(first);
    const nextH = Number(next);
    if (first && (isNaN(firstH) || firstH < 0)) { setError(tr("invalidFirstReply", "Invalid First reply")); return; }
    if (next && (isNaN(nextH) || nextH < 0)) { setError(tr("invalidNextReply", "Invalid Next reply")); return; }
    onAdd({
      id: Date.now().toString(36),
      name: name.trim(),
      source: source.trim(),
      firstReply: first ? firstH : null,
      nextReply: next ? nextH : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[440px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-center text-[20px] font-semibold text-[#111827]">{tr("addPolicy", "Add policy")}</div>
        <div className="mt-6 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("policyName", "Policy name")} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2.5 text-[13px] outline-none placeholder:text-[#94a3b8]" />
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder={tr("applyToSources", "Apply to sources (e.g: Email, Live Chat)")} className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2.5 text-[13px] outline-none placeholder:text-[#94a3b8]" />
          <div className="flex gap-3">
            <div className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2">
              <div className="text-[11px] text-[#94a3b8]">{tr("firstReply", "First reply")}</div>
              <div className="flex items-center justify-between text-[13px]">
                <input type="number" min="0" value={first} onChange={(e) => setFirst(e.target.value)} className="w-full bg-transparent outline-none" />
                <span className="text-[#94a3b8]">{tr("hours", "hours")}</span>
              </div>
            </div>
            <div className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2">
              <div className="text-[11px] text-[#94a3b8]">{tr("nextReply", "Next reply")}</div>
              <div className="flex items-center justify-between text-[13px]">
                <input type="number" min="0" value={next} onChange={(e) => setNext(e.target.value)} className="w-full bg-transparent outline-none" />
                <span className="text-[#94a3b8]">{tr("hours", "hours")}</span>
              </div>
            </div>
          </div>
          {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
          <div className="flex items-start gap-2 rounded-[10px] bg-[#e0edff] p-3 text-[12px] text-[#334155]">
            <span className="text-[#2563eb]">ⓘ</span>
            <span>{tr("slaCalendarDesc", "Calculated using SLA calendar hours.")}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-[8px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button onClick={save} className="rounded-[8px] bg-[#2563eb] px-5 py-2 text-[13px] font-medium text-white">{tr("add", "Add")}</button>
        </div>
      </div>
    </div>
  );
}

export default function SLAPage() {
  const tr = useT();
  const [showModal, setShowModal] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [siteId, setSiteId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.me().then(({ sites }) => {
      const s = sites?.[0];
      if (!s) return;
      setSiteId(s.id);
      const sla = s.settings?.sla;
      if (Array.isArray(sla)) setPolicies(sla);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  async function persist(next) {
    setPolicies(next);
    try { await api.updateSiteSettings({ sla: next }); } catch {}
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="w-full rounded-[16px] border border-[#dfe5ee] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[22px] font-semibold text-[#111827]">Service Level Agreements</div>
            <div className="mt-1 max-w-[560px] text-[13px] text-[#64748b]">
              SLA — müştərilərinizə cavab müddətləri üzrə öhdəliklərinizi müəyyən edir.
            </div>
          </div>
          <button onClick={() => setShowModal(true)} disabled={!siteId} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {tr("addPolicy", "Add policy")}
          </button>
        </div>
        <div className="mt-5 overflow-hidden rounded-[12px] border border-[#dfe5ee]">
          <div className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[12px] font-medium text-[#94a3b8]">
            <span className="flex-1">{tr("policyName", "Policy name")}</span>
            <span className="flex-1">{tr("appliedTo", "Applied to")}</span>
            <span className="w-24">{tr("firstReply", "First reply")}</span>
            <span className="w-24">{tr("nextReply", "Next reply")}</span>
            <span className="w-16"></span>
          </div>
          {!loaded ? (
            <div className="px-5 py-6 text-center text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>
          ) : policies.length === 0 ? (
            <div className="px-5 py-6 text-center text-[13px] text-[#64748b]">{tr("noSlaPolicies", "You haven't added any SLA policies yet.")}</div>
          ) : policies.map((p) => (
            <div key={p.id} className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[13px] last:border-b-0">
              <span className="flex-1 font-medium text-[#111827]">{p.name}</span>
              <span className="flex-1 text-[#64748b]">{p.source || "—"}</span>
              <span className="w-24">{p.firstReply != null ? `${p.firstReply}h` : "—"}</span>
              <span className="w-24">{p.nextReply != null ? `${p.nextReply}h` : "—"}</span>
              <button onClick={() => persist(policies.filter((x) => x.id !== p.id))} className="w-16 text-right text-[12px] text-[#ef4444] hover:underline">{tr("delete", "Delete")}</button>
            </div>
          ))}
        </div>
      </div>
      {showModal && <AddPolicyModal onClose={() => setShowModal(false)} onAdd={(p) => { persist([...policies, p]); setShowModal(false); }} tr={tr} />}
    </div>
  );
}
