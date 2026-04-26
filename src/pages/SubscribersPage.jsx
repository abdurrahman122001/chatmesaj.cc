import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

export default function SubscribersPage() {
  const tr = useT();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listSubscribers();
      setSubs(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm(tr("confirmDeleteSub", "Delete this subscriber?"))) return;
    try {
      await api.deleteSubscriber(id);
      setSubs((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(tr("deleteFailed", "Could not delete"));
    }
  }

  function exportCsv() {
    const rows = [[tr("email", "Email"), tr("name", "Name"), tr("site", "Site"), tr("date", "Date")], ...filtered.map((s) => [s.email, s.name || "", s.site?.name || "", new Date(s.createdAt).toLocaleString()])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = subs.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.email.toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f8fafc]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e5eaf1] bg-white px-4 py-4 md:px-6">
        <div>
          <h1 className="text-[18px] font-semibold text-[#111827]">{tr("subscribersTitle", "Subscribers")}</h1>
          <p className="text-[12px] text-[#64748b]">{tr("subscribersHint", "Users who subscribed after a conversation")}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("search", "Search...") + "..."} className="h-9 w-full min-w-0 flex-1 rounded-[8px] border border-[#cfd8e3] px-3 text-[13px] outline-none focus:border-[#059669] md:w-64 md:flex-none" />
          <button onClick={exportCsv} className="h-9 shrink-0 rounded-[8px] border border-[#cfd8e3] bg-white px-3 text-[13px] text-[#334155] hover:bg-[#f4f6f9]">{tr("exportCsv", "Export CSV")}</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-4 flex flex-wrap gap-3 md:gap-4">
          <div className="rounded-[12px] border border-[#e5eaf1] bg-white px-5 py-3">
            <div className="text-[11px] text-[#64748b]">{tr("totalSubscribers", "Total subscribers")}</div>
            <div className="text-[22px] font-semibold text-[#111827]">{subs.length}</div>
          </div>
          <div className="rounded-[12px] border border-[#e5eaf1] bg-white px-5 py-3">
            <div className="text-[11px] text-[#64748b]">{tr("last7days", "Last 7 days")}</div>
            <div className="text-[22px] font-semibold text-[#111827]">{subs.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 7 * 86400000).length}</div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e5eaf1] bg-white overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#64748b]">{tr("subscribersNone", "No subscribers")}</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#f8fafc] text-[#64748b]">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">{tr("email", "Email")}</th>
                  <th className="px-4 py-2 text-left font-medium">{tr("name", "Name")}</th>
                  <th className="px-4 py-2 text-left font-medium">{tr("site", "Site")}</th>
                  <th className="px-4 py-2 text-left font-medium">{tr("date", "Date")}</th>
                  <th className="px-4 py-2 w-20" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-[#eef2f7]">
                    <td className="px-4 py-2.5 font-medium text-[#111827]">{s.email}</td>
                    <td className="px-4 py-2.5 text-[#475569]">{s.name || "—"}</td>
                    <td className="px-4 py-2.5 text-[#475569]">{s.site?.name || "—"}</td>
                    <td className="px-4 py-2.5 text-[#64748b]">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => handleDelete(s.id)} className="text-[#ef4444] hover:underline">{tr("delete", "Delete")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
