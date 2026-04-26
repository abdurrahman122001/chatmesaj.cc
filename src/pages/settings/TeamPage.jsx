import React, { useEffect, useState } from "react";
import { api, getToken } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

function CreateModal({ onClose, onCreated, tr }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("AGENT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const u = await api.createTeamMember({ email, name, password, role });
      onCreated(u);
    } catch (err) {
      setError(err.message || tr("createFailed", "Create failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[480px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold text-[#111827]">{tr("newTeamMember", "New team member")}</div>
        <div className="mt-1 text-[12px] text-[#64748b]">{tr("newTeamMemberDesc", "Create a user and send email/password to yourself.")}</div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("email", "Email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("nameOptional", "Name (optional)")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("passwordMin8", "Password (min 8 characters)")}</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("role", "Role")}</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="rounded-[10px] border border-[#dfe5ee] px-3 py-2 text-[13px]">
              <option value="AGENT">{tr("agent", "Agent")}</option>
              <option value="ADMIN">{tr("admin", "Admin")}</option>
            </select>
          </div>
          {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-[10px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button onClick={save} disabled={saving} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? tr("creating", "Creating...") : tr("create", "Create")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const tr = useT();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [userHasSite, setUserHasSite] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [list, profile] = await Promise.all([api.listTeam(), api.me()]);
      setMembers(list);
      setMe(profile.user);
      
      // Check if user has a site (from profile.sites)
      setUserHasSite(profile.sites && profile.sites.length > 0);
    } catch (err) {
      setError(err.message || tr("loadFailed", "Load failed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function changeRole(u, role) {
    try {
      const updated = await api.updateTeamMember(u.id, { role });
      setMembers((prev) => prev.map((m) => m.id === u.id ? { ...m, ...updated } : m));
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(u) {
    if (!confirm(`${u.email} ${tr("deleteConfirm", "delete?")}`)) return;
    try {
      await api.deleteTeamMember(u.id);
      setMembers((prev) => prev.filter((m) => m.id !== u.id));
    } catch (err) {
      alert(err.message);
    }
  }

  const isAdmin = me?.role === "ADMIN";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#f6f8fb] p-3 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[22px] font-semibold text-[#111827]">{tr("team", "Team")}</div>
          <div className="text-[13px] text-[#64748b]">{tr("teamDesc", "Manage users. Only Admins can create new members.")}</div>
        </div>
        {userHasSite && (
          <button onClick={() => setShowModal(true)}
            className="shrink-0 whitespace-nowrap rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">+ {tr("newMember", "New member")}</button>
        )}
      </div>

      {error && <div className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-3 text-[12px] text-[#b91c1c]">{error}</div>}
      {loading && <div className="text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>}

      <div className="overflow-x-auto rounded-[16px] border border-[#dfe5ee] bg-white">
        <div className="grid min-w-[560px] grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-[#eef2f7] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
          <div>{tr("user", "User")}</div><div>{tr("role", "Role")}</div><div>{tr("created", "Created")}</div><div></div>
        </div>
        {members.map((u) => (
          <div key={u.id} className="grid min-w-[560px] grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center border-b border-[#eef2f7] px-5 py-3 text-[13px] last:border-b-0">
            <div>
              <div className="font-medium text-[#111827]">{u.name || u.email}</div>
              <div className="text-[12px] text-[#64748b]">{u.email}</div>
            </div>
            <div>
              {isAdmin && me?.id !== u.id ? (
                <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                  className="rounded-[8px] border border-[#dfe5ee] px-2 py-1 text-[12px]">
                  <option value="ADMIN">{tr("admin", "Admin")}</option>
                  <option value="AGENT">AGENT</option>
                </select>
              ) : (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${u.role === "ADMIN" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#dbeafe] text-[#1e40af]"}`}>{u.role}</span>
              )}
            </div>
            <div className="text-[12px] text-[#64748b]">{new Date(u.createdAt).toLocaleDateString()}</div>
            <div>
              {isAdmin && me?.id !== u.id && (
                <button onClick={() => remove(u)} className="text-[12px] text-[#ef4444] hover:underline">{tr("delete", "Delete")}</button>
              )}
              {me?.id === u.id && <span className="text-[11px] text-[#94a3b8]">({tr("you", "you")})</span>}
            </div>
          </div>
        ))}
      </div>

      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreated={(u) => { setMembers((prev) => [...prev, u]); setShowModal(false); }} tr={tr} />}
    </div>
  );
}
