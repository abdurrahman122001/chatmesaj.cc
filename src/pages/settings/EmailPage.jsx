import React, { useState, useEffect, useRef } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

const CLOUDFLARE_OAUTH_WAIT_MS = 10 * 60 * 1000;

function ModalShell({ onClose, children, maxWidth = "max-w-[560px]" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`relative w-full ${maxWidth} rounded-[16px] bg-white p-6 shadow-xl`}>
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        {children}
      </div>
    </div>
  );
}

function CloudflareConfigModal({ onClose, onSave, initialZoneId = "", initialEmail = "", initialAuthType = "none", loadZonesOnOpen = false }) {
  const [apiToken, setApiToken] = useState("");
  const [zoneId, setZoneId] = useState(initialZoneId);
  const [accountEmail, setAccountEmail] = useState(initialEmail);
  const [hasConfiguredToken, setHasConfiguredToken] = useState(Boolean(loadZonesOnOpen));
  const [configuredAuthType, setConfiguredAuthType] = useState(initialAuthType || (loadZonesOnOpen ? "manual" : "none"));
  const [saving, setSaving] = useState(false);
  const [oauthConnecting, setOauthConnecting] = useState(false);
  const [oauthInfo, setOauthInfo] = useState("");
  const [oauthCanReopen, setOauthCanReopen] = useState(false);
  const [zones, setZones] = useState([]);
  const oauthPopupRef = useRef(null);
  const oauthTimeoutRef = useRef(null);
  const oauthPollRef = useRef(null);
  const oauthRejectRef = useRef(null);
  const oauthCancelledRef = useRef(false);
  const oauthAuthorizeUrlRef = useRef("");

  function cleanupOAuthFlow() {
    if (oauthTimeoutRef.current) {
      clearTimeout(oauthTimeoutRef.current);
      oauthTimeoutRef.current = null;
    }
    if (oauthPollRef.current) {
      clearInterval(oauthPollRef.current);
      oauthPollRef.current = null;
    }
    if (oauthPopupRef.current && !oauthPopupRef.current.closed) {
      oauthPopupRef.current.close();
    }
    oauthPopupRef.current = null;
    oauthRejectRef.current = null;
    oauthAuthorizeUrlRef.current = "";
    setOauthCanReopen(false);
  }

  function cancelOAuthFlow() {
    oauthCancelledRef.current = true;
    const reject = oauthRejectRef.current;
    cleanupOAuthFlow();
    setOauthConnecting(false);
    setOauthInfo("");
    if (reject) reject(new Error("oauth_flow_cancelled"));
  }

  function reopenOAuthAuthorizePage() {
    const authorizeUrl = oauthAuthorizeUrlRef.current;
    if (!authorizeUrl) return;
    if (!oauthPopupRef.current || oauthPopupRef.current.closed) {
      oauthPopupRef.current = window.open("about:blank", "cloudflare-oauth", "width=560,height=760");
      if (!oauthPopupRef.current) {
        alert("Popup blocked. Please allow popups and try again.");
        return;
      }
    }
    oauthPopupRef.current.location.href = authorizeUrl;
  }

  async function loadZones() {
    try {
      const data = await api.get("/api/email/cloudflare/zones");
      const zoneList = data.zones || [];
      setZones(zoneList);
      if (!zoneId && zoneList.length === 1) setZoneId(zoneList[0].id);
    } catch {
      setZones([]);
    }
  }

  async function handleClearToken() {
    if (!confirm("Cloudflare token silinsin?")) return;
    try {
      const cfg = await api.delete("/api/email/cloudflare/config/token");
      setApiToken("");
      setOauthInfo("");
      setHasConfiguredToken(Boolean(cfg?.hasApiToken));
      setConfiguredAuthType(cfg?.authType || "none");
      onSave(cfg || { hasApiToken: false, authType: "none" });
      if (cfg?.source === "env") {
        alert("Site token cleared. Environment token is still active.");
      } else {
        alert("Cloudflare token cleared.");
      }
    } catch (err) {
      alert(err.message || "Failed to clear Cloudflare token");
    }
  }

  useEffect(() => {
    if (!loadZonesOnOpen) return;
    let active = true;
    (async () => {
      try {
        const data = await api.get("/api/email/cloudflare/zones");
        if (!active) return;
        const zoneList = data.zones || [];
        setZones(zoneList);
        if (!zoneId && zoneList.length === 1) setZoneId(zoneList[0].id);
      } catch {
        if (!active) return;
        setZones([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadZonesOnOpen]);

  useEffect(() => {
    return () => {
      cleanupOAuthFlow();
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cfg = await api.get("/api/email/cloudflare/config");
        if (!active) return;
        setHasConfiguredToken(Boolean(cfg?.hasApiToken));
        setConfiguredAuthType(cfg?.authType || "none");
        if (cfg?.email) setAccountEmail(cfg.email);
        if (cfg?.zoneId) setZoneId(cfg.zoneId);
      } catch {
        if (!active) return;
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function connectWithCloudflareOAuth() {
    setOauthConnecting(true);
    setOauthInfo("");
    oauthCancelledRef.current = false;
    oauthPopupRef.current = window.open("about:blank", "cloudflare-oauth", "width=560,height=760");
    if (!oauthPopupRef.current) {
      setOauthConnecting(false);
      alert("Popup blocked. Please allow popups and try again.");
      return;
    }
    try {
      const beforeCfg = await api.get("/api/email/cloudflare/config");
      const beforeUpdatedAt = beforeCfg?.updatedAt || null;
      const frontendOrigin = window.location.origin;
      const data = await api.get(`/api/email/cloudflare/oauth/start?frontendOrigin=${encodeURIComponent(frontendOrigin)}`);
      oauthAuthorizeUrlRef.current = data.authorizeUrl;
      setOauthCanReopen(true);
      oauthPopupRef.current.location.href = data.authorizeUrl;

      const result = await new Promise((resolve, reject) => {
        oauthRejectRef.current = reject;
        oauthTimeoutRef.current = setTimeout(() => {
          cleanup();
          reject(new Error("Cloudflare connect timed out. Please try again."));
        }, CLOUDFLARE_OAUTH_WAIT_MS);

        oauthPollRef.current = setInterval(async () => {
          if (oauthCancelledRef.current) {
            cleanup();
            reject(new Error("oauth_flow_cancelled"));
            return;
          }
          if (!oauthPopupRef.current || oauthPopupRef.current.closed) {
            cleanup();
            reject(new Error("Cloudflare login window was closed."));
            return;
          }
          try {
            const cfg = await api.get("/api/email/cloudflare/config");
            const changed = cfg?.updatedAt && cfg.updatedAt !== beforeUpdatedAt;
            const oauthConnected = cfg?.authType === "oauth";
            if (changed && oauthConnected && cfg?.hasApiToken) {
              cleanup();
              resolve({ type: "cloudflare-oauth-result", ok: true, message: "Cloudflare account connected." });
            }
          } catch {
            // keep polling
          }
        }, 1000);

        function onMessage(event) {
          if (event?.data?.type !== "cloudflare-oauth-result") return;
          cleanup();
          resolve(event.data);
        }

        function cleanup() {
          cleanupOAuthFlow();
          window.removeEventListener("message", onMessage);
        }

        window.addEventListener("message", onMessage);
      });

      if (!result?.ok) {
        throw new Error(result?.message || "Cloudflare OAuth failed");
      }

      const cfg = await api.get("/api/email/cloudflare/config");
      setAccountEmail(cfg.email || "");
      setHasConfiguredToken(Boolean(cfg?.hasApiToken));
      setConfiguredAuthType(cfg?.authType || "manual");
      setOauthInfo("Cloudflare account connected successfully.");
      onSave(cfg);
      await loadZones();
    } catch (err) {
      setOauthInfo("");
      if (err?.message !== "oauth_flow_cancelled") {
        alert(err.message || "Failed to connect Cloudflare account");
      }
    } finally {
      cleanupOAuthFlow();
      setOauthConnecting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (oauthConnecting) {
      cancelOAuthFlow();
    }
    setSaving(true);
    try {
      if (!apiToken.trim()) {
        const liveCfg = await api.get("/api/email/cloudflare/config");
        if (!liveCfg?.hasApiToken) {
          alert("Cloudflare API token is required");
          return;
        }
      }
      await api.put("/api/email/cloudflare/config", {
        ...(apiToken.trim() ? { apiToken: apiToken.trim() } : {}),
        zoneId: zoneId.trim(),
        email: accountEmail.trim(),
      });
      if (apiToken.trim()) setConfiguredAuthType("manual");
      onSave();
      onClose();
    } catch (err) {
      alert(err.message || "Failed to save Cloudflare config");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-[520px]">
      <div className="text-[18px] font-semibold text-[#111827]">Cloudflare configuration</div>
      <div className="mt-1 text-[13px] text-[#64748b]">Enter API token and optional Zone ID for automatic DNS setup.</div>

      <div className="mt-4 rounded-[10px] border border-[#dfe5ee] bg-[#f8fafc] p-3">
        <div className="text-[12px] text-[#334155]">Recommended: connect via Cloudflare login and fill token automatically.</div>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={connectWithCloudflareOAuth}
            disabled={oauthConnecting}
            className="rounded-[8px] border border-[#2563eb] bg-white px-3 py-1.5 text-[13px] font-medium text-[#2563eb] disabled:opacity-60"
          >
            {oauthConnecting ? "Connecting..." : "Connect with Cloudflare"}
          </button>
          {oauthInfo && <span className="text-[12px] text-[#059669]">{oauthInfo}</span>}
          {hasConfiguredToken && !oauthInfo && (
            <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-medium text-[#047857]">
              {configuredAuthType === "oauth" ? "OAuth connected" : "API token configured"}
            </span>
          )}
          {oauthConnecting && (
            <button
              type="button"
              onClick={cancelOAuthFlow}
              className="rounded-[8px] border border-[#dfe5ee] px-2.5 py-1 text-[12px] text-[#475569]"
            >
              Cancel
            </button>
          )}
          {oauthConnecting && oauthCanReopen && (
            <button
              type="button"
              onClick={reopenOAuthAuthorizePage}
              className="rounded-[8px] border border-[#2563eb] bg-white px-2.5 py-1 text-[12px] font-medium text-[#2563eb]"
            >
              Open auth page again
            </button>
          )}
          {hasConfiguredToken && !oauthConnecting && (
            <button
              type="button"
              onClick={handleClearToken}
              className="rounded-[8px] border border-[#fecaca] bg-[#fff1f2] px-2.5 py-1 text-[12px] font-medium text-[#be123c]"
            >
              Disconnect / Clear token
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">API token</label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Cloudflare API token"
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">Cloudflare account email (optional)</label>
          <input
            type="email"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          />
          <p className="mt-1 text-[11px] text-[#64748b]">Only needed if you are using Cloudflare Global API Key. API Token does not require email.</p>
        </div>
        {zones.length > 0 && (
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#334155]">Select domain (from Cloudflare)</label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
            >
              <option value="">Select a domain</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">Zone ID (optional)</label>
          <input
            type="text"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            placeholder="Cloudflare zone id"
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[8px] border border-[#dfe5ee] px-4 py-2 text-[13px] text-[#334155]">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save config"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DomainInstructionsModal({ onClose, data, onVerify, verifying, onAutoSetup, autoSettingUp }) {
  if (!data) return null;
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-[560px]">
      <div className="text-[18px] font-semibold text-[#111827]">Domain verification instructions</div>
      <div className="mt-1 text-[13px] text-[#64748b]">Add the TXT record below in your DNS provider panel.</div>

      <div className="mt-4 space-y-3 rounded-[10px] border border-[#dfe5ee] p-4 text-[13px]">
        <div>
          <div className="text-[#94a3b8]">Type</div>
          <div className="font-medium text-[#111827]">TXT</div>
        </div>
        <div>
          <div className="text-[#94a3b8]">Name</div>
          <div className="font-medium text-[#111827] break-all">{data.verification?.txtName || "-"}</div>
        </div>
        <div>
          <div className="text-[#94a3b8]">Value</div>
          <div className="font-medium text-[#111827] break-all">{data.verification?.txtValue || "-"}</div>
        </div>
        {data.verification?.error && (
          <div className="rounded-[8px] bg-[#fff1f2] px-3 py-2 text-[12px] text-[#be123c]">
            Last check error: {data.verification.error}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-[8px] border border-[#dfe5ee] px-4 py-2 text-[13px] text-[#334155]">Close</button>
        <button type="button" onClick={onAutoSetup} disabled={autoSettingUp} className="rounded-[8px] border border-[#2563eb] px-4 py-2 text-[13px] font-medium text-[#2563eb] disabled:opacity-60">
          {autoSettingUp ? "Setting up..." : "Auto setup (Cloudflare)"}
        </button>
        <button type="button" onClick={onVerify} disabled={verifying} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
          {verifying ? "Verifying..." : "Verify now"}
        </button>
      </div>
    </ModalShell>
  );
}

function AddSenderAddressModal({ onClose, onSave }) {
  const [email, setEmail] = useState("");
  const [senderType, setSenderType] = useState("custom");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/email/sender-address", { email: email.trim(), senderType });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-[440px]">
      <div className="text-[18px] font-semibold text-[#111827]">Add sender address</div>
      <div className="mt-1 text-[13px] text-[#64748b]">Add a sender address for outgoing emails.</div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">Sender email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="support@example.com"
            required
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">Sender type</label>
          <select
            value={senderType}
            onChange={(e) => setSenderType(e.target.value)}
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          >
            <option value="custom">Custom domain</option>
            <option value="tidio">TODO domain</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[8px] border border-[#dfe5ee] px-4 py-2 text-[13px] text-[#334155]">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? "Adding..." : "Add sender"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConnectMailboxModal({ onClose, onSave }) {
  const tr = useT();
  const [provider, setProvider] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!provider || !email.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/email/mailbox", { email: email.trim(), provider });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-[440px]">
      <div className="text-[18px] font-semibold text-[#111827]">{tr("settingsConnectMailbox", "Connect mailbox")}</div>
      <div className="mt-1 text-[13px] text-[#64748b]">{tr("emailConnectMailboxDesc", "Add your email address to receive tickets via email.")}</div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("emailAddressLabel", "Email address")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("emailProvider", "Provider")}</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            required
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          >
            <option value="">{tr("emailSelectProvider", "Select provider")}</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
            <option value="other">{tr("emailProviderOther", "Other")}</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[8px] border border-[#dfe5ee] px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button type="submit" disabled={saving} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? tr("connecting", "Connecting...") : tr("connect", "Connect")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddDomainModal({ onClose, onSave }) {
  const tr = useT();
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!domain.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/email/domain", { domain: domain.trim() });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-[440px]">
      <div className="text-[18px] font-semibold text-[#111827]">{tr("settingsAddDomain", "Add domain")}</div>
      <div className="mt-1 text-[13px] text-[#64748b]">{tr("emailAddDomainDesc", "Add your domain to improve email deliverability.")}</div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("emailDomainLabel", "Domain")}</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            required
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[8px] border border-[#dfe5ee] px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button type="submit" disabled={saving} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? tr("adding", "Adding...") : tr("settingsAddDomain", "Add domain")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function BlockEmailModal({ onClose, onSave }) {
  const tr = useT();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/email/blocked", { email: email.trim() });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-[440px]">
      <div className="text-[18px] font-semibold text-[#111827]">{tr("emailBlockTitle", "Block email address")}</div>
      <div className="mt-2 text-[13px] text-[#64748b]">{tr("emailBlockDesc", "Block e-mail address in order to not receive any tickets from it.")}</div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("settingsEmail", "Email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="spam@example.com"
            required
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[8px] border border-[#dfe5ee] px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button type="submit" disabled={saving} className="rounded-[8px] bg-[#ef233c] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-60">
            {saving ? tr("blocking", "Blocking...") : tr("block", "Block")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function SetupBanner({ buttonLabel, onClose, onClick }) {
  const tr = useT();
  return (
    <div className="relative mb-5 flex items-center justify-between overflow-hidden rounded-[14px] border border-[#dfe5ee] bg-white p-5">
      <div>
        <div className="font-semibold text-[15px] text-[#111827]">{tr("emailSetup3Steps", "Start managing your support emails in 3 steps")}</div>
        <ol className="mt-2 space-y-0.5 text-[13px] text-[#334155] list-decimal list-inside">
          <li>{tr("emailStep1", "Connect your mailbox")}</li>
          <li>{tr("emailStep2", "Add a domain")}</li>
          <li>{tr("emailStep3", "Set sender address")}</li>
        </ol>
        <button onClick={onClick} className="mt-3 rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">{buttonLabel}</button>
      </div>
      <div className="mr-8 flex items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dbeafe] text-[32px]">✉️</div>
      </div>
      <button onClick={onClose} className="absolute right-3 top-3 text-[#94a3b8] hover:text-[#334155]">✕</button>
    </div>
  );
}

function MailboxTab({ onConnect, onRefresh }) {
  const tr = useT();
  const [showBanner, setShowBanner] = useState(true);
  const [mailboxes, setMailboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsData, setInstructionsData] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadMailboxes();
  }, [onRefresh]);

  async function loadMailboxes() {
    setLoading(true);
    try {
      const data = await api.get("/api/email");
      setMailboxes(data.mailboxes || []);
    } catch (err) {
      console.error("Failed to load mailboxes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this mailbox?")) return;
    try {
      await api.delete(`/api/email/mailbox/${id}`);
      loadMailboxes();
    } catch (err) {
      alert(err.message || "Failed to delete mailbox");
    }
  }

  async function handleOpenInstructions(id) {
    try {
      const data = await api.get(`/api/email/mailbox/${id}/instructions`);
      setInstructionsData(data);
      setShowInstructions(true);
    } catch (err) {
      alert(err.message || "Failed to load instructions");
    }
  }

  async function handleVerifyMailbox(id) {
    setVerifying(true);
    try {
      await api.post(`/api/email/mailbox/${id}/verify`);
      loadMailboxes();
      setShowInstructions(false);
    } catch (err) {
      alert(err.message || "Failed to verify mailbox");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-4">
      {showBanner && mailboxes.length === 0 && <SetupBanner buttonLabel={tr("settingsConnectMailbox", "Connect mailbox")} onClose={() => setShowBanner(false)} onClick={onConnect} />}
      <div className="text-[13px] text-[#64748b]">
        {tr("emailMailboxIntro", "Automatically forward emails from other providers directly to the Inbox. Receive all your incoming emails as tickets, and manage them through the Tickets folder.")}
      </div>
      {loading ? (
        <div className="text-center text-[13px] text-[#94a3b8]">{tr("loading", "Loading...")}</div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[#dfe5ee] bg-white">
          <div className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[12px] font-medium text-[#94a3b8]">
            <span className="flex-1">{tr("settingsEmail", "Email")}</span>
            <span className="w-48">{tr("status", "Status")}</span>
            <span className="w-8" />
          </div>
          {mailboxes.length === 0 ? (
            <div className="px-5 py-6 text-center text-[13px] text-[#64748b]">{tr("emailNoMailboxes", "No mailboxes connected yet.")}</div>
          ) : (
            mailboxes.map((m) => (
              <div key={m.id} className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[13px] last:border-0">
                <span className="flex-1 text-[#111827]">{m.email}</span>
                <div className="flex w-48 items-center gap-2">
                  <span className={`rounded-[6px] px-2 py-0.5 text-[11px] font-medium ${m.status === 'verified' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#dc2626]'}`}>
                    {m.status === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                  {m.status !== 'verified' && <button onClick={() => handleOpenInstructions(m.id)} className="text-[#2563eb] cursor-pointer text-[12px] hover:underline">Open instructions</button>}
                </div>
                <button onClick={() => handleDelete(m.id)} className="w-8 text-[#94a3b8] hover:text-[#ef233c]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <div className="text-[13px] text-[#64748b]">{tr("emailMissing", "Missing anything in Email?")} <span className="text-[#2563eb] cursor-pointer">{tr("emailGiveFeedback", "Give feedback")}</span></div>
      {showInstructions && instructionsData && (
        <ModalShell onClose={() => setShowInstructions(false)} maxWidth="max-w-[560px]">
          <div className="text-[18px] font-semibold text-[#111827]">Mailbox setup instructions</div>
          <div className="mt-1 text-[13px] text-[#64748b]">Follow the steps below to configure email forwarding.</div>
          <div className="mt-4 space-y-3 rounded-[10px] border border-[#dfe5ee] p-4 text-[13px]">
            <div>
              <div className="text-[#94a3b8]">Email</div>
              <div className="font-medium text-[#111827]">{instructionsData.email}</div>
            </div>
            <div>
              <div className="text-[#94a3b8]">Provider</div>
              <div className="font-medium text-[#111827]">{instructionsData.provider}</div>
            </div>
            <div>
              <div className="text-[#94a3b8]">Instructions</div>
              <div className="mt-2 text-[#111827]">{instructionsData.instructions}</div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowInstructions(false)} className="rounded-[8px] border border-[#dfe5ee] px-4 py-2 text-[13px] text-[#334155]">Close</button>
            <button type="button" onClick={() => handleVerifyMailbox(instructionsData.id)} disabled={verifying} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
              {verifying ? "Verifying..." : "Mark as verified"}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function SenderAddressTab({ onAdd, onRefresh }) {
  const tr = useT();
  const [senderAddresses, setSenderAddresses] = useState([]);
  const [defaultSenderAddressId, setDefaultSenderAddressId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSenderAddresses();
  }, [onRefresh]);

  async function loadSenderAddresses() {
    setLoading(true);
    try {
      const data = await api.get("/api/email");
      setSenderAddresses(data.senderAddresses || []);
      setDefaultSenderAddressId(data.defaultSenderAddressId || "");
    } catch (err) {
      console.error("Failed to load sender addresses:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDefaultChange(e) {
    const senderAddressId = e.target.value;
    setDefaultSenderAddressId(senderAddressId);
    try {
      await api.put("/api/email/sender-address/default", { senderAddressId: senderAddressId || null });
      loadSenderAddresses();
    } catch (err) {
      alert(err.message || "Failed to update default sender address");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this sender address?")) return;
    try {
      await api.delete(`/api/email/sender-address/${id}`);
      loadSenderAddresses();
    } catch (err) {
      alert(err.message || "Failed to delete sender address");
    }
  }

  async function handleVerify(id) {
    try {
      await api.post(`/api/email/sender-address/${id}/verify`, {});
      loadSenderAddresses();
    } catch (err) {
      alert(err.message || "Failed to verify sender address");
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-[13px] text-[#64748b]">
        {tr("emailSenderIntro", "Keep sending tickets from TODO domain or start using your own domain to improve your credibility and increase the deliverability.")}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-[13px] font-medium text-[#334155]">{tr("emailDefault", "Default")}</div>
        <span className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-[#94a3b8] text-[10px] text-[#94a3b8]">?</span>
        <select
          value={defaultSenderAddressId}
          onChange={handleDefaultChange}
          className="w-[280px] rounded-[10px] border border-[#2563eb] px-3 py-2 text-[13px] outline-none"
        >
          <option value="">{tr("emailNoDefaultSelected", "No default selected")}</option>
          {senderAddresses.map((s) => (
            <option key={s.id} value={s.id}>{s.email}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center text-[13px] text-[#94a3b8]">{tr("loading", "Loading...")}</div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[#dfe5ee] bg-white">
          <div className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[12px] font-medium text-[#94a3b8]">
            <span className="flex-1">{tr("emailSenderAddress", "Sender address")}</span>
            <span className="flex-1">{tr("emailSenderType", "Sender type")}</span>
            <span className="flex-1">{tr("status", "Status")}</span>
            <span className="w-8" />
          </div>
          {senderAddresses.length === 0 ? (
            <div className="px-5 py-6 text-center text-[13px] text-[#64748b]">{tr("emailNoSenderAddresses", "No sender addresses yet. Add your first sender address.")}</div>
          ) : (
            senderAddresses.map((s) => (
              <div key={s.id} className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[13px] last:border-0">
                <span className="flex-1 text-[#111827]">{s.email}</span>
                <span className="flex-1 text-[#64748b]">{s.senderType === "tidio" ? "TODO domain" : "Custom domain"}</span>
                <div className="flex-1">
                  <span className={`rounded-[6px] px-2 py-0.5 text-[11px] font-medium ${s.status === "verified" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#dc2626]"}`}>
                    {s.status === "verified" ? "Verified" : "Unverified"}
                  </span>
                  {s.status !== "verified" && (
                    <button onClick={() => handleVerify(s.id)} className="ml-2 text-[12px] text-[#2563eb]">
                      Verify
                    </button>
                  )}
                </div>
                <button onClick={() => handleDelete(s.id)} className="w-8 text-[#94a3b8] hover:text-[#ef233c]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <button onClick={onAdd} className="rounded-[8px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("settingsAddSenderAddress", "Add sender address")}</button>
      <div className="text-[13px] text-[#64748b]">{tr("emailMissing", "Missing anything in Email?")} <span className="text-[#2563eb] cursor-pointer">{tr("emailGiveFeedback", "Give feedback")}</span></div>
    </div>
  );
}

function DomainsTab({ onAdd, onRefresh, onOpenInstructions }) {
  const tr = useT();
  const [showBanner, setShowBanner] = useState(true);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomains();
  }, [onRefresh]);

  async function loadDomains() {
    setLoading(true);
    try {
      const data = await api.get("/api/email");
      setDomains(data.domains || []);
    } catch (err) {
      console.error("Failed to load domains:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this domain?")) return;
    try {
      await api.delete(`/api/email/domain/${id}`);
      loadDomains();
    } catch (err) {
      alert(err.message || "Failed to delete domain");
    }
  }

  async function handleVerify(id) {
    try {
      const res = await api.post(`/api/email/domain/${id}/verify`, {});
      if (!res.ok) alert("TXT record not found yet. Check DNS and try again.");
      loadDomains();
    } catch (err) {
      alert(err.message || "Failed to verify domain");
    }
  }

  return (
    <div className="space-y-4">
      {showBanner && domains.length === 0 && <SetupBanner buttonLabel={tr("settingsAddDomain", "Add domain")} onClose={() => setShowBanner(false)} onClick={onAdd} />}
      <div className="text-[13px] text-[#64748b]">
        {tr("emailDomainsIntro", "Sending emails from your domain can help improve delivery rates, and make your emails look more professional. Verify your domain and remove \"via chatbot.local\" from your emails.")}
      </div>
      {loading ? (
        <div className="text-center text-[13px] text-[#94a3b8]">{tr("loading", "Loading...")}</div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[#dfe5ee] bg-white">
          <div className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[12px] font-medium text-[#94a3b8]">
            <span className="flex-1">{tr("emailDomainLabel", "Domain")}</span>
            <span className="flex-1">{tr("status", "Status")}</span>
            <span className="w-8" />
          </div>
          {domains.length === 0 ? (
            <div className="px-5 py-6 text-center text-[13px] text-[#64748b]">{tr("emailNoDomains", "You haven't added any domain yet.")}</div>
          ) : (
            domains.map((d) => (
              <div key={d.id} className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[13px] last:border-0">
                <span className="flex-1 text-[#111827]">{d.domain}</span>
                <div className="flex-1">
                  <span className={`rounded-[6px] px-2 py-0.5 text-[11px] font-medium ${d.status === 'verified' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#dc2626]'}`}>
                    {d.status === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                  {d.status !== "verified" && (
                    <>
                      <button onClick={() => onOpenInstructions(d.id)} className="ml-2 text-[12px] text-[#2563eb]">Instructions</button>
                      <button onClick={() => handleVerify(d.id)} className="ml-2 text-[12px] text-[#2563eb]">Verify</button>
                    </>
                  )}
                </div>
                <button onClick={() => handleDelete(d.id)} className="w-8 text-[#94a3b8] hover:text-[#ef233c]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <div className="text-[13px] text-[#64748b]">{tr("emailMissing", "Missing anything in Email?")} <span className="text-[#2563eb] cursor-pointer">{tr("emailGiveFeedback", "Give feedback")}</span></div>
    </div>
  );
}

function BlockedTab({ onBlock, onRefresh }) {
  const tr = useT();
  const [blockedEmails, setBlockedEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedEmails();
  }, [onRefresh]);

  async function loadBlockedEmails() {
    setLoading(true);
    try {
      const data = await api.get("/api/email");
      setBlockedEmails(data.blockedEmails || []);
    } catch (err) {
      console.error("Failed to load blocked emails:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to unblock this email?")) return;
    try {
      await api.delete(`/api/email/blocked/${id}`);
      loadBlockedEmails();
    } catch (err) {
      alert(err.message || "Failed to unblock email");
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-[13px] text-[#64748b]">{tr("emailBlockedIntro", "List of blocked e-mails addresses from which you won't receive any tickets.")}</div>
      {loading ? (
        <div className="text-center text-[13px] text-[#94a3b8]">{tr("loading", "Loading...")}</div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[#dfe5ee] bg-white">
          <div className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[12px] font-medium text-[#94a3b8]">
            <span className="flex-1">{tr("settingsEmail", "Email")}</span>
            <span className="w-40">{tr("emailLastUpdate", "Last update")}</span>
            <span className="w-8" />
          </div>
          {blockedEmails.length === 0 ? (
            <div className="px-5 py-6 text-center text-[13px] text-[#64748b]">{tr("emailNoFiltered", "No filtered emails")}</div>
          ) : (
            blockedEmails.map((b) => (
              <div key={b.id} className="flex items-center border-b border-[#eef2f7] px-5 py-3 text-[13px] last:border-0">
                <span className="flex-1 text-[#111827]">{b.email}</span>
                <span className="w-40 text-[#64748b]">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '-'}</span>
                <button onClick={() => handleDelete(b.id)} className="w-8 text-[#94a3b8] hover:text-[#ef233c]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <button onClick={onBlock} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">{tr("emailBlockAnother", "Block another e-mail address")}</button>
      <div className="text-[13px] text-[#64748b]">{tr("emailMissing", "Missing anything in Email?")} <span className="text-[#2563eb] cursor-pointer">{tr("emailGiveFeedback", "Give feedback")}</span></div>
    </div>
  );
}

export default function EmailPage() {
  const tr = useT();
  const [tab, setTab] = useState("Mailbox");
  const [showConnect, setShowConnect] = useState(false);
  const [showDomain, setShowDomain] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showSenderAddress, setShowSenderAddress] = useState(false);
  const [showDomainInstructions, setShowDomainInstructions] = useState(false);
  const [showCloudflareConfig, setShowCloudflareConfig] = useState(false);
  const [cloudflareZoneId, setCloudflareZoneId] = useState("");
  const [cloudflareEmail, setCloudflareEmail] = useState("");
  const [cloudflareAuthType, setCloudflareAuthType] = useState("none");
  const [cloudflareHasToken, setCloudflareHasToken] = useState(false);
  const [domainInstructions, setDomainInstructions] = useState(null);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [autoSettingUpDomain, setAutoSettingUpDomain] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { key: "Mailbox", label: tr("settingsMailbox", "Mailbox") },
    { key: "Sender address", label: tr("settingsSenderAddress", "Sender address") },
    { key: "Domains", label: tr("settingsDomains", "Domains") },
    { key: "Blocked e-mail addresses", label: tr("settingsBlockedEmails", "Blocked e-mail addresses") },
  ];

  const actionButton = {
    "Mailbox": <button onClick={() => setShowConnect(true)} className="rounded-[8px] bg-[#2563eb] px-3 py-1.5 text-[13px] font-medium text-white">{tr("settingsConnectMailbox", "Connect mailbox")}</button>,
    "Sender address": <button onClick={() => setShowSenderAddress(true)} className="rounded-[8px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[13px] text-[#334155]">{tr("settingsAddSenderAddress", "Add sender address")}</button>,
    "Domains": (
      <>
        <button onClick={openCloudflareConfigModal} className="rounded-[8px] border border-[#2563eb] bg-white px-3 py-1.5 text-[13px] font-medium text-[#2563eb]">{tr("settingsConnectAccount", "Connect account")}</button>
        <button onClick={() => setShowDomain(true)} className="rounded-[8px] bg-[#2563eb] px-3 py-1.5 text-[13px] font-medium text-white">{tr("settingsAddDomain", "Add domain")}</button>
      </>
    ),
  };

  function handleRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  async function openCloudflareConfigModal() {
    try {
      const cfg = await api.get("/api/email/cloudflare/config");
      setCloudflareZoneId(cfg.zoneId || "");
      setCloudflareEmail(cfg.email || "");
      setCloudflareAuthType(cfg.authType || "none");
      setCloudflareHasToken(Boolean(cfg.hasApiToken));
    } catch {
      setCloudflareZoneId("");
      setCloudflareEmail("");
      setCloudflareAuthType("none");
      setCloudflareHasToken(false);
    }
    setShowCloudflareConfig(true);
  }

  async function handleOpenDomainInstructions(domainId) {
    try {
      const data = await api.get(`/api/email/domain/${domainId}/instructions`);
      setDomainInstructions({ ...data, id: domainId });
      setShowDomainInstructions(true);
    } catch (err) {
      alert(err.message || "Failed to load domain instructions");
    }
  }

  async function handleVerifyFromInstructions() {
    if (!domainInstructions?.id) return;
    setVerifyingDomain(true);
    try {
      const res = await api.post(`/api/email/domain/${domainInstructions.id}/verify`, {});
      const refreshed = await api.get(`/api/email/domain/${domainInstructions.id}/instructions`);
      setDomainInstructions({ ...refreshed, id: domainInstructions.id });
      setRefreshKey((prev) => prev + 1);
      if (!res.ok) alert("TXT record not found yet. DNS yayımlanması bir neçə dəqiqə çəkə bilər.");
    } catch (err) {
      alert(err.message || "Failed to verify domain");
    } finally {
      setVerifyingDomain(false);
    }
  }

  async function handleAutoSetupDomain() {
    if (!domainInstructions?.id) return;
    setAutoSettingUpDomain(true);
    try {
      await api.post(`/api/email/domain/${domainInstructions.id}/cloudflare-sync`, {});
      alert("Cloudflare TXT record created/updated. Now running verification...");
      await handleVerifyFromInstructions();
    } catch (err) {
      const msg = err.message || "Failed to auto setup Cloudflare DNS";
      if (msg.toLowerCase().includes("not configured")) {
        await openCloudflareConfigModal();
      } else {
        alert(msg);
      }
    } finally {
      setAutoSettingUpDomain(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="w-full rounded-[16px] border border-[#dfe5ee] bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="text-[22px] font-semibold text-[#111827]">{tr("settingsEmail", "Email")}</div>
          <div className="flex items-center gap-2">
            {tab === "Sender address" && <span className="text-[13px] text-[#2563eb] cursor-pointer">◫ {tr("emailHowToAddSender", "How to add sender address")}</span>}
            {tab === "Domains" && <span className="text-[13px] text-[#2563eb] cursor-pointer">◫ {tr("emailHowToAddDomain", "How to add domain")}</span>}
            {actionButton[tab]}
          </div>
        </div>
        <div className="mt-4 flex gap-6 border-b border-[#eef2f7] text-[13px]">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={tab === t.key ? "border-b-2 border-[#2563eb] pb-3 font-medium text-[#2563eb]" : "pb-3 text-[#334155]"}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-5">
          {tab === "Mailbox" && <MailboxTab onConnect={() => setShowConnect(true)} onRefresh={refreshKey} />}
          {tab === "Sender address" && <SenderAddressTab onAdd={() => setShowSenderAddress(true)} onRefresh={refreshKey} />}
          {tab === "Domains" && <DomainsTab onAdd={() => setShowDomain(true)} onRefresh={refreshKey} onOpenInstructions={handleOpenDomainInstructions} />}
          {tab === "Blocked e-mail addresses" && <BlockedTab onBlock={() => setShowBlock(true)} onRefresh={refreshKey} />}
        </div>
      </div>
      {showConnect && <ConnectMailboxModal onClose={() => setShowConnect(false)} onSave={handleRefresh} />}
      {showSenderAddress && <AddSenderAddressModal onClose={() => setShowSenderAddress(false)} onSave={handleRefresh} />}
      {showDomain && <AddDomainModal onClose={() => setShowDomain(false)} onSave={handleRefresh} />}
      {showDomainInstructions && (
        <DomainInstructionsModal
          onClose={() => setShowDomainInstructions(false)}
          data={domainInstructions}
          onVerify={handleVerifyFromInstructions}
          verifying={verifyingDomain}
          onAutoSetup={handleAutoSetupDomain}
          autoSettingUp={autoSettingUpDomain}
        />
      )}
      {showCloudflareConfig && (
        <CloudflareConfigModal
          onClose={() => setShowCloudflareConfig(false)}
          initialZoneId={cloudflareZoneId}
          initialEmail={cloudflareEmail}
          initialAuthType={cloudflareAuthType}
          loadZonesOnOpen={cloudflareHasToken}
          onSave={(cfg = {}) => {
            setCloudflareHasToken(typeof cfg.hasApiToken === "boolean" ? cfg.hasApiToken : true);
            if (cfg.zoneId) setCloudflareZoneId(cfg.zoneId);
            if (cfg.email) setCloudflareEmail(cfg.email);
            if (cfg.authType || cfg.authType === "none") setCloudflareAuthType(cfg.authType || "none");
            if (cfg.ok !== false) {
              alert("Cloudflare config saved. Click Auto setup again.");
            }
          }}
        />
      )}
      {showBlock && <BlockEmailModal onClose={() => setShowBlock(false)} onSave={handleRefresh} />}
    </div>
  );
}
