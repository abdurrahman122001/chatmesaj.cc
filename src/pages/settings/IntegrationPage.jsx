import React, { useEffect, useState } from "react";
import QuickActionConfig from "./QuickActionConfig.jsx";
import IntegrationWizard from "./IntegrationWizard.jsx";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

export default function IntegrationPage({ name, iconBg, iconContent, description, features, channel }) {
  const tr = useT();
  const [connected, setConnected] = useState(false);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!channel) { setLoading(false); return; }
    api.getSiteSettings().then(({ settings }) => {
      setConnected(!!settings?.channels?.[channel]);
      setMeta(settings?.integrations?.[channel] || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [channel]);

  async function disconnect() {
    if (!channel) return;
    if (!confirm(tr("disconnectIntegrationConfirm", "Do you want to disconnect the {name} integration?", { name }))) return;
    setBusy(true);
    try {
      const res = await api.updateSiteSettings({
        channels: { [channel]: false },
        integrations: { [channel]: null },
      });
      setConnected(!!res.settings?.channels?.[channel]);
      setMeta(null);
    } catch {}
    finally { setBusy(false); }
  }

  async function handleDone(info) {
    setConnected(true);
    setMeta({ ...(info || {}), connectedAt: new Date().toISOString() });
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center bg-[#f6f8fb] text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f6f8fb] p-5">
      {channel && <QuickActionConfig channel={channel} color={iconBg} />}

      {!connected ? (
        <IntegrationWizard channel={channel} onDone={handleDone} onCancel={() => { /* stays on page */ }} />
      ) : (
        <div className="w-full rounded-[16px] border border-[#dfe5ee] bg-white p-6">
          <div className="flex items-center gap-3 text-[22px] font-semibold text-[#111827]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-white text-[18px]"
              style={{ backgroundColor: iconBg }}>{iconContent}</span>
            {name} {tr("integration", "integration")}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-[13px] text-[#166534]">
            <span className="mt-0.5">✓</span>
            <div>
              <div className="font-medium">{name} {tr("isConnected", "is connected.")}</div>
              {meta?.account && <div className="mt-0.5 text-[12px] text-[#15803d]">{tr("account", "Account")}: {meta.account}</div>}
              {meta?.phone && <div className="mt-0.5 text-[12px] text-[#15803d] font-mono">{tr("number", "Number")}: {meta.phone}{meta.method ? ` (${meta.method === "sms" ? "SMS" : "voice"})` : ""}</div>}
              {meta?.token && <div className="mt-0.5 text-[12px] text-[#15803d] font-mono">Token: {meta.token.slice(0, 8)}•••{meta.token.slice(-4)}</div>}
              {meta?.connectedAt && <div className="mt-0.5 text-[12px] text-[#15803d]">{tr("date", "Date")}: {new Date(meta.connectedAt).toLocaleString()}</div>}
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-[17px] font-semibold text-[#111827]">{name} with TODO</div>
            <div className="mt-1 mx-auto max-w-[540px] text-[13px] text-[#64748b]">{description}</div>
          </div>
          <div className="mt-6 flex justify-center gap-12">
            {features.map((f) => (
              <div key={f.title} className="max-w-[160px] text-center">
                <div className="mb-2 flex justify-center text-[22px]">{f.icon}</div>
                <div className="text-[13px] font-semibold text-[#111827]">{f.title}</div>
                <div className="mt-1 text-[12px] text-[#64748b]">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={disconnect} disabled={busy}
              className="rounded-[10px] border border-[#dfe5ee] bg-white px-6 py-2.5 text-[13px] font-medium text-[#ef4444] hover:bg-[#fef2f2] disabled:opacity-60">
              {busy ? "..." : tr("disconnectIntegration", "Disconnect integration")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
