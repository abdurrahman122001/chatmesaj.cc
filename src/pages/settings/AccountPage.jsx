import React, { useEffect, useRef, useState } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

export default function AccountPage() {
  const tr = useT();
  const [tab, setTab] = useState("Personal details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Password change form state
  const [pwOpen, setPwOpen] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confPw, setConfPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  // 2FA modal state
  const [twoFAMode, setTwoFAMode] = useState(null); // "enable" | "disable" | null
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAPassword, setTwoFAPassword] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [twoFABusy, setTwoFABusy] = useState(false);
  const [setupData, setSetupData] = useState(null); // { qrDataUrl, secret, otpauthUrl }
  const [backupCodes, setBackupCodes] = useState(null);

  useEffect(() => {
    api.me().then(({ user }) => {
      setName(user.name || "");
      setEmail(user.email || "");
      setSignature(user.signature || "");
      setTwoFA(!!user.twoFactorEnabled);
      setAvatarUrl(user.avatarUrl || null);
      setLoaded(true);
    }).catch(() => {});
  }, []);

  function pickAvatar() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError("");
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      setAvatarError(tr("onlyPngJpegGifWebp", "Only PNG, JPEG, GIF or WEBP images are supported")); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(tr("imageTooLarge", "Image is larger than 2MB")); return;
    }
    setAvatarBusy(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(tr("fileReadError", "File could not be read")));
        reader.readAsDataURL(file);
      });
      const res = await api.uploadAvatar(dataUrl);
      setAvatarUrl(res.avatarUrl || null);
    } catch (err) {
      setAvatarError(err.message || tr("uploadFailed", "Upload failed"));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function removeAvatar() {
    setAvatarError(""); setAvatarBusy(true);
    try {
      await api.uploadAvatar(null);
      setAvatarUrl(null);
    } catch (err) {
      setAvatarError(err.message || tr("deleteFailed", "Delete failed"));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function changePassword() {
    setPwError(""); setPwDone(false);
    if (newPw !== confPw) { setPwError(tr("passwordsDoNotMatch", "New passwords do not match")); return; }
    if (newPw.length < 8) { setPwError(tr("passwordMin8Chars", "New password must be at least 8 characters")); return; }
    setPwBusy(true);
    try {
      await api.changePassword({ currentPassword: curPw, newPassword: newPw });
      setPwDone(true);
      setCurPw(""); setNewPw(""); setConfPw("");
      setTimeout(() => { setPwOpen(false); setPwDone(false); }, 1500);
    } catch (err) {
      setPwError(err.message || tr("error", "Error"));
    } finally { setPwBusy(false); }
  }

  async function openEnable2FA() {
    setTwoFAMode("enable"); setTwoFACode(""); setTwoFAError(""); setTwoFAPassword("");
    setSetupData(null); setBackupCodes(null); setTwoFABusy(true);
    try {
      const data = await api.setup2FA();
      setSetupData(data);
    } catch (err) {
      setTwoFAError(err.message || tr("setupFailed", "Setup failed"));
    } finally { setTwoFABusy(false); }
  }
  function openDisable2FA() {
    setTwoFAMode("disable"); setTwoFACode(""); setTwoFAError(""); setTwoFAPassword("");
  }
  function close2FAModal() {
    setTwoFAMode(null); setSetupData(null); setBackupCodes(null);
    setTwoFACode(""); setTwoFAPassword(""); setTwoFAError("");
  }
  async function submit2FA() {
    setTwoFAError(""); setTwoFABusy(true);
    try {
      if (twoFAMode === "enable") {
        const res = await api.verifySetup2FA({ code: twoFACode });
        setBackupCodes(res.backupCodes || []);
        setTwoFA(true);
        // Don't close modal yet — show backup codes
      } else {
        await api.disable2FA({ password: twoFAPassword, code: twoFACode });
        setTwoFA(false);
        close2FAModal();
      }
    } catch (err) {
      setTwoFAError(err.message || tr("error", "Error"));
    } finally { setTwoFABusy(false); }
  }

  async function saveProfile(fields) {
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateProfile(fields);
      if (fields.name !== undefined) setName(updated.name);
      if (fields.email !== undefined) setEmail(updated.email);
      if (fields.signature !== undefined) setSignature(updated.signature);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.message || tr("saveFailed", "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <div className="flex flex-1 items-center justify-center text-[#94a3b8]">{tr("loading", "Loading...")}</div>;

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="w-full rounded-[16px] border border-[#dfe5ee] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[22px] font-semibold text-[#111827]">{tr("account", "Account")}</div>
            <div className="mt-1 max-w-[580px] text-[13px] text-[#64748b]">
              {tr("accountDesc", "Change your name, email address and personal signature.")}
            </div>
          </div>
          {saved && <span className="text-[12px] text-[#22c55e]">✓ {tr("saved", "Saved")}</span>}
        </div>
        <div className="mt-5 flex gap-6 border-b border-[#eef2f7] text-[13px]">
          {["Personal details", "Custom signature", "Password"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={tab === t ? "border-b-2 border-[#2563eb] pb-3 font-medium text-[#2563eb]" : "pb-3 text-[#334155]"}>
              {tr(t.toLowerCase().replace(/ /g, ""), t)}
            </button>
          ))}
        </div>

        {tab === "Personal details" && (
          <div className="mt-5 max-w-[480px] space-y-4">
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("name", "Name")}</div>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium text-[#334155]">{tr("profilePicture", "Profile picture")}</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover ring-1 ring-[#e5eaf1]" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dde5ee]">
                      {name ? (
                        <span className="text-[22px] font-semibold text-[#475569]">
                          {name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                        </span>
                      ) : (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" fill="#c7d2df" />
                          <path d="M4 20c1.6-3.2 4.4-5 8-5s6.4 1.8 8 5" fill="#c7d2df" />
                        </svg>
                      )}
                    </div>
                  )}
                  {avatarBusy && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-[11px] text-white">...</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleAvatarChange} className="hidden" />
                  <button type="button" onClick={pickAvatar} disabled={avatarBusy}
                    className="rounded-[8px] border border-[#cfd8e3] bg-white px-3 py-1.5 text-[12px] font-medium text-[#334155] hover:bg-[#f8fafc] disabled:opacity-60">
                    {avatarUrl ? tr("changePicture", "Change picture") : tr("uploadPicture", "Upload picture")}
                  </button>
                  {avatarUrl && (
                    <button type="button" onClick={removeAvatar} disabled={avatarBusy}
                      className="rounded-[8px] px-3 py-1.5 text-[12px] text-[#ef4444] hover:underline disabled:opacity-60">
                      {tr("delete", "Delete")}
                    </button>
                  )}
                  <div className="text-[11px] text-[#94a3b8]">PNG/JPEG/GIF/WEBP, max 2MB</div>
                </div>
              </div>
              {avatarError && <div className="mt-2 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{avatarError}</div>}
            </div>
            <div>
              <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("email", "Email")}</div>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
            </div>
            {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
            <button onClick={() => saveProfile({ name, email })} disabled={saving}
              className="rounded-[10px] bg-[#2563eb] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-60">
              {saving ? tr("saving", "Saving...") : tr("save", "Save")}
            </button>
          </div>
        )}

        {tab === "Custom signature" && (
          <div className="mt-5 max-w-[640px]">
            <div className="text-[13px] text-[#334155]">{tr("emailSignatureDesc", "Configure your email signature.")}</div>
            <div className="mt-4 flex gap-6">
              <div className="w-20 shrink-0 pt-2 text-[13px] font-medium text-[#334155]">{tr("signature", "Signature")}</div>
              <div className="flex-1 overflow-hidden rounded-[10px] border border-[#cfd8e3]">
                <textarea value={signature} onChange={(e) => { setSignature(e.target.value); setSaved(false); }}
                  className="min-h-[180px] w-full resize-none p-3 text-[13px] outline-none" />
                <div className="flex items-center gap-4 border-t border-[#eef2f7] px-4 py-2 text-[13px] text-[#94a3b8]">
                  <button type="button" className="font-bold hover:text-[#334155]">B</button>
                  <button type="button" className="italic hover:text-[#334155]">I</button>
                  <button type="button" className="underline hover:text-[#334155]">U</button>
                </div>
              </div>
            </div>
            {error && <div className="mt-3 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
            <div className="mt-4 flex gap-6">
              <div className="w-20 shrink-0" />
              <button type="button" onClick={() => saveProfile({ signature })}
                disabled={saving}
                className={`rounded-[8px] px-5 py-2 text-[13px] transition-colors ${signature.trim() ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]" : "bg-[#eef2f7] text-[#a1acbb] cursor-not-allowed"} disabled:opacity-60`}>
                {saving ? tr("saving", "Saving...") : saved ? tr("saved", "Saved ✓") : tr("save", "Save")}
              </button>
            </div>
          </div>
        )}

        {tab === "Password" && (
          <div className="mt-5 max-w-[560px] divide-y divide-[#eef2f7]">
            <div className="pb-5">
              <div className="flex items-center gap-8">
                <div className="w-44 shrink-0 text-[13px] font-medium text-[#334155]">{tr("password", "Password")}</div>
                {!pwOpen ? (
                  <button onClick={() => setPwOpen(true)} className="text-[13px] text-[#2563eb] hover:underline">{tr("changePassword", "Change password")}</button>
                ) : (
                  <button onClick={() => { setPwOpen(false); setPwError(""); setCurPw(""); setNewPw(""); setConfPw(""); }}
                    className="text-[13px] text-[#64748b] hover:underline">{tr("cancel", "Cancel")}</button>
                )}
              </div>
              {pwOpen && (
                <div className="ml-[11.5rem] mt-3 space-y-2.5">
                  <input type="password" placeholder={tr("currentPassword", "Current password")} value={curPw} onChange={(e) => setCurPw(e.target.value)}
                    className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
                  <input type="password" placeholder={tr("newPasswordMin8", "New password (min 8 characters)")} value={newPw} onChange={(e) => setNewPw(e.target.value)}
                    className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
                  <input type="password" placeholder={tr("confirmNewPassword", "Confirm new password")} value={confPw} onChange={(e) => setConfPw(e.target.value)}
                    className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none focus:border-[#2563eb]" />
                  {pwError && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{pwError}</div>}
                  {pwDone && <div className="rounded-[8px] bg-[#f0fdf4] px-3 py-2 text-[12px] text-[#166534]">✓ {tr("passwordChanged", "Password changed successfully")}</div>}
                  <button onClick={changePassword} disabled={pwBusy || !curPw || !newPw || !confPw}
                    className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60">
                    {pwBusy ? tr("saving", "Saving...") : tr("updatePassword", "Update password")}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-8 pt-5">
              <div className="w-44 shrink-0 text-[13px] font-medium text-[#334155]">{tr("twoFactorAuth2FA", "Two-Factor Authentication (2FA)")}</div>
              <div>
                <div className="flex items-center gap-2">
                  {twoFA ? (
                    <>
                      <span className="text-[#22c55e]">✓</span>
                      <span className="font-medium text-[#111827]">{tr("twoFactorAuthEnabled", "2FA is enabled")}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#f59e0b]">△</span>
                      <span className="font-medium text-[#111827]">{tr("twoFactorAuthDisabled", "2FA is not enabled")}</span>
                    </>
                  )}
                </div>
                <div className="mt-1 text-[13px] text-[#64748b]">
                  {tr("twoFactorAuthDesc", "Add an extra layer of security to your account.")}
                </div>
                {twoFA ? (
                  <button onClick={openDisable2FA} className="mt-2 text-[13px] text-[#ef4444] hover:underline">{tr("disable2FA", "Disable 2FA")}</button>
                ) : (
                  <button onClick={openEnable2FA} className="mt-2 text-[13px] text-[#2563eb] hover:underline">{tr("enable2FA", "Enable 2FA")}</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {twoFAMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-[480px] rounded-[16px] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={close2FAModal} className="absolute right-3 top-3 text-[#334155] hover:text-[#111827]">✕</button>
            <div className="text-[18px] font-semibold text-[#111827]">
              {twoFAMode === "enable" ? tr("setupTwoFactorAuth", "Setup Two-Factor Authentication") : tr("disable2FA", "Disable 2FA")}
            </div>

            {twoFAMode === "enable" && !backupCodes && (
              <>
                <div className="mt-2 text-[13px] text-[#64748b]">
                  {tr("downloadAuthenticatorApp", "Download an authenticator app")} (Google Authenticator, Microsoft Authenticator, Authy, etc.) {tr("andScanQR", "and scan the QR code below")}.
                </div>
                {twoFABusy && !setupData ? (
                  <div className="mt-6 flex items-center justify-center py-10 text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>
                ) : setupData ? (
                  <>
                    <div className="mt-4 flex justify-center">
                      <img src={setupData.qrDataUrl} alt="2FA QR" className="h-48 w-48 rounded-[8px] border border-[#e5eaf1]" />
                    </div>
                    <details className="mt-3 text-[12px] text-[#64748b]">
                      <summary className="cursor-pointer hover:text-[#111827]">{tr("cantScanQR", "Can't scan QR?")} {tr("showManualKey", "Show manual key")}</summary>
                      <div className="mt-2 rounded-[8px] bg-[#f8fafc] px-3 py-2 font-mono text-[11px] break-all text-[#111827]">
                        {setupData.secret}
                      </div>
                    </details>
                    <div className="mt-4 text-[13px] text-[#334155]">
                      {tr("enter6DigitCode", "Enter the 6-digit code shown in the app")}:
                    </div>
                    <input type="text" value={twoFACode} maxLength={6}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="mt-2 w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2.5 text-center text-[20px] font-mono tracking-[0.5em] outline-none focus:border-[#2563eb]" />
                    {twoFAError && <div className="mt-3 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{twoFAError}</div>}
                    <button onClick={submit2FA} disabled={twoFABusy || twoFACode.length !== 6}
                      className="mt-4 w-full rounded-[10px] bg-[#2563eb] py-2.5 text-[14px] font-semibold text-white disabled:opacity-60">
                      {twoFABusy ? tr("verifying", "Verifying...") : tr("confirmAndEnable", "Confirm and enable")}
                    </button>
                  </>
                ) : twoFAError ? (
                  <div className="mt-4 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{twoFAError}</div>
                ) : null}
              </>
            )}

            {twoFAMode === "enable" && backupCodes && (
              <>
                <div className="mt-3 rounded-[10px] border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-[13px] text-[#166534]">
                  ✓ {tr("twoFactorAuthEnabledSuccessfully", "2FA enabled successfully")}. {tr("saveBackupCodes", "Save the backup codes below in a safe place")} — {tr("useIfPhoneLost", "you will use them to login if you lose your phone")}.
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-[10px] border border-[#dfe5ee] bg-[#f8fafc] p-3 font-mono text-[13px]">
                  {backupCodes.map((c) => (
                    <div key={c} className="rounded-[6px] bg-white px-2 py-1.5 text-center text-[#111827] border border-[#eef2f7]">{c}</div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button"
                    onClick={() => { navigator.clipboard.writeText(backupCodes.join("\n")); }}
                    className="flex-1 rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-2 text-[13px] text-[#334155] hover:bg-[#f8fafc]">
                    📋 {tr("copy", "Copy")}
                  </button>
                  <button type="button"
                    onClick={() => {
                      const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "chatbot-2fa-backup-codes.txt"; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-2 text-[13px] text-[#334155] hover:bg-[#f8fafc]">
                    ⬇ {tr("download", "Download")}
                  </button>
                </div>
                <button onClick={close2FAModal}
                  className="mt-3 w-full rounded-[10px] bg-[#2563eb] py-2.5 text-[14px] font-semibold text-white">
                  {tr("done", "Done")}
                </button>
              </>
            )}

            {twoFAMode === "disable" && (
              <>
                <div className="mt-2 text-[13px] text-[#64748b]">
                  {tr("enterPasswordAndCode", "To disable, enter your current password and the 6-digit code from your authenticator (or backup code)")}.
                </div>
                <input type="password" value={twoFAPassword}
                  onChange={(e) => setTwoFAPassword(e.target.value)}
                  placeholder={tr("currentPassword", "Current password")}
                  className="mt-3 w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2.5 text-[13px] outline-none focus:border-[#ef4444]" />
                <input type="text" value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.toUpperCase())}
                  placeholder={tr("6DigitCodeOrBackup", "6-digit code or backup code")}
                  className="mt-2 w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2.5 text-[13px] font-mono outline-none focus:border-[#ef4444]" />
                {twoFAError && <div className="mt-3 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{twoFAError}</div>}
                <button onClick={submit2FA} disabled={twoFABusy || !twoFAPassword || !twoFACode}
                  className="mt-4 w-full rounded-[10px] bg-[#ef4444] py-2.5 text-[14px] font-semibold text-white disabled:opacity-60">
                  {twoFABusy ? tr("pleaseWait", "Please wait...") : tr("disable", "Disable")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
