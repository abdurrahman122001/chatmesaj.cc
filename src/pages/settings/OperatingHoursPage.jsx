import React, { useEffect, useRef, useState } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

const DAYS = [
  { key: "mon", labelKey: "dayMon", label: "Bazar ertəsi" },
  { key: "tue", labelKey: "dayTue", label: "Çərşənbə axşamı" },
  { key: "wed", labelKey: "dayWed", label: "Çərşənbə" },
  { key: "thu", labelKey: "dayThu", label: "Cümə axşamı" },
  { key: "fri", labelKey: "dayFri", label: "Cümə" },
  { key: "sat", labelKey: "daySat", label: "Şənbə" },
  { key: "sun", labelKey: "daySun", label: "Bazar" },
];
const STORAGE_KEY = "chatbot_operating_hours";

function defaultSchedule() {
  const s = {};
  DAYS.forEach((d) => {
    s[d.key] = { enabled: !["sat", "sun"].includes(d.key), from: "09:00", to: "18:00" };
  });
  return s;
}

function loadCfg() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, schedule: defaultSchedule() };
    return { enabled: false, schedule: defaultSchedule(), ...JSON.parse(raw) };
  } catch { return { enabled: false, schedule: defaultSchedule() }; }
}

function isOnlineNow(cfg) {
  if (!cfg.enabled) return true;
  const now = new Date();
  const dayIdx = now.getDay(); // 0=Sunday
  const keyMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const day = cfg.schedule[keyMap[dayIdx]];
  if (!day?.enabled) return false;
  const hhmm = now.toTimeString().slice(0, 5);
  return hhmm >= day.from && hhmm <= day.to;
}

export default function OperatingHoursPage() {
  const tr = useT();
  const [cfg, setCfg] = useState(loadCfg);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    api.me().then(({ sites }) => {
      const s = sites?.[0];
      const oh = s?.settings?.operatingHours;
      if (oh) setCfg({ enabled: !!oh.enabled, schedule: { ...defaultSchedule(), ...(oh.schedule || {}) } });
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    if (!loaded) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await api.updateSiteSettings({ operatingHours: cfg });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } catch {}
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [cfg, loaded]);

  function updateDay(key, patch) {
    setCfg((prev) => ({ ...prev, schedule: { ...prev.schedule, [key]: { ...prev.schedule[key], ...patch } } }));
  }

  const online = isOnlineNow(cfg);

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="w-full max-w-[720px] space-y-4">
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[22px] font-semibold text-[#111827]">{tr("operatingHours", "Operating Hours")}</div>
              <div className="mt-1 max-w-[560px] text-[13px] text-[#64748b]"
                dangerouslySetInnerHTML={{ __html: tr("operatingHoursDesc", "Set your operating hours — outside these hours, status will automatically show as <strong>offline</strong>.") }}
              />
            </div>
            {saved && <span className="text-[12px] text-[#22c55e]">✓ {tr("saved", "Saved")}</span>}
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-[10px] border border-[#dfe5ee] bg-[#f8fafc] px-4 py-3">
            <span className="text-[13px] font-medium text-[#334155]">{tr("enableOperatingHours", "Enable operating hours")}</span>
            <button type="button" onClick={() => setCfg((p) => ({ ...p, enabled: !p.enabled }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${cfg.enabled ? "bg-[#2563eb]" : "bg-[#e5eaf1]"}`}>
              <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${cfg.enabled ? "left-[23px]" : "left-[3px]"}`} />
            </button>
            <div className="ml-auto text-[12px]">
              {tr("currentStatus", "Current status")}: <span className={online ? "font-medium text-[#22c55e]" : "font-medium text-[#ef4444]"}>
                {online ? "● " + tr("online", "Online") : "● " + tr("offline", "Offline")}
              </span>
            </div>
          </div>

          <div className={`mt-5 space-y-2 ${cfg.enabled ? "" : "opacity-50 pointer-events-none"}`}>
            {DAYS.map((d) => {
              const day = cfg.schedule[d.key];
              return (
                <div key={d.key} className="flex items-center gap-4 rounded-[10px] border border-[#eef2f7] px-4 py-3">
                  <label className="flex w-[180px] items-center gap-2">
                    <input type="checkbox" checked={day.enabled}
                      onChange={(e) => updateDay(d.key, { enabled: e.target.checked })}
                      className="h-4 w-4 accent-[#2563eb]" />
                    <span className="text-[13px] text-[#111827]">{tr(d.labelKey, d.label)}</span>
                  </label>
                  <div className={`flex items-center gap-2 ${day.enabled ? "" : "opacity-40 pointer-events-none"}`}>
                    <input type="time" value={day.from} onChange={(e) => updateDay(d.key, { from: e.target.value })}
                      className="rounded-[8px] border border-[#cfd8e3] px-2 py-1 text-[13px]" />
                    <span className="text-[12px] text-[#94a3b8]">—</span>
                    <input type="time" value={day.to} onChange={(e) => updateDay(d.key, { to: e.target.value })}
                      className="rounded-[8px] border border-[#cfd8e3] px-2 py-1 text-[13px]" />
                  </div>
                  {!day.enabled && <span className="text-[12px] text-[#94a3b8]">{tr("closed", "Closed")}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
