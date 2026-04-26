import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

const DEFAULTS = [
  { type: "newMessage", key: "newMessage", email: false, web: true },
  { type: "newChat", key: "newChat", email: false, web: true },
  { type: "newVisitor", key: "newVisitor", email: null, web: false },
  { type: "needsHuman", key: "needsHuman", email: true, web: true },
];

const STORAGE_KEY = "chatbot_notifications";

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return DEFAULTS.map((d) => ({ ...d, ...(parsed[d.key] || {}) }));
  } catch { return DEFAULTS; }
}

function savePrefs(rows) {
  const obj = {};
  rows.forEach((r) => { obj[r.key] = { email: r.email, web: r.web }; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-[#2563eb]" : "bg-[#e5eaf1]"}`}>
      <span className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all ${on ? "left-[19px]" : "left-[3px]"}`} />
    </button>
  );
}

export default function NotificationsPage() {
  const tr = useT();
  const [rows, setRows] = useState(loadPrefs());
  const [me, setMe] = useState(null);
  const [permission, setPermission] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.me().then((res) => setMe(res?.user || null)).catch(() => {});
  }, []);

  function toggle(i, field) {
    setRows((prev) => {
      const next = prev.map((r, idx) => idx === i ? { ...r, [field]: !r[field] } : r);
      savePrefs(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function requestPerm() {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPermission(p);
  }

  function testNotification() {
    if (typeof Notification === "undefined") return alert(tr("browserNotSupported", "This browser does not support notifications"));
    if (Notification.permission !== "granted") return alert(tr("grantPermissionFirst", "Please grant permission first"));
    new Notification(tr("testNotification", "Test notification"), { body: tr("notificationsWorking", "Chatbot notifications are working ✓") });
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="w-full space-y-4">
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[22px] font-semibold text-[#111827]">{tr("notifications", "Notifications")}{me ? ` — ${me.name || me.email}` : ""}</div>
              <div className="mt-1 text-[13px] text-[#64748b]">{tr("notificationsDesc", "Settings for browser and email notifications. Changes are saved automatically.")}</div>
            </div>
            {saved && <span className="text-[12px] text-[#22c55e]">✓ {tr("saved", "Saved")}</span>}
          </div>

          <div className="mt-4 rounded-[10px] border border-[#dfe5ee] bg-[#f8fafc] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#111827]">{tr("browserNotifications", "Browser notifications")}</div>
                <div className="text-[12px] text-[#64748b]">
                  {tr("status", "Status")}: <span className={permission === "granted" ? "text-[#22c55e]" : permission === "denied" ? "text-[#ef4444]" : "text-[#f59e0b]"}>
                    {permission === "granted" ? tr("granted", "Granted") : permission === "denied" ? tr("blocked", "Blocked") : tr("notGranted", "Not granted")}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {permission !== "granted" && (
                  <button onClick={requestPerm} className="rounded-[8px] bg-[#2563eb] px-3 py-1.5 text-[12px] text-white">{tr("grantPermission", "Grant permission")}</button>
                )}
                {permission === "granted" && (
                  <button onClick={testNotification} className="rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[12px] text-[#334155]">{tr("test", "Test")}</button>
                )}
              </div>
            </div>
          </div>

          <table className="mt-5 w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#eef2f7] text-left text-[#94a3b8]">
                <th className="pb-3 font-medium">{tr("notificationType", "Notification type")}</th>
                <th className="pb-3 font-medium w-[100px]">{tr("email", "Email")}</th>
                <th className="pb-3 font-medium w-[140px]">{tr("browserNotification", "Browser notification")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.key} className="border-b border-[#eef2f7] last:border-0">
                  <td className="py-3 text-[#111827]">{tr(row.type, row.type)}</td>
                  <td className="py-3">
                    {row.email === null
                      ? <span className="text-[#94a3b8] text-[12px]">—</span>
                      : <Toggle on={row.email} onChange={() => toggle(i, "email")} />}
                  </td>
                  <td className="py-3">
                    <Toggle on={row.web} onChange={() => toggle(i, "web")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
