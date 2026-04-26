import React, { useState, useEffect, useRef, useCallback } from "react";
import { configureTabs } from "../lyroData.js";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange?.(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[#2563eb]" : "bg-[#e5eaf1]"}`}>
      <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${on ? "left-[23px]" : "left-[3px]"}`} />
    </button>
  );
}

const channelIcons = {
  chat: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-5 3V8Z" stroke="#64748b" strokeWidth="1.6"/></svg>),
  messenger: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#64748b" strokeWidth="1.6"/><path d="m6 14 4-4 3 2 5-5-4 9-3-2-5 4" stroke="#64748b" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  instagram: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#64748b" strokeWidth="1.6"/><circle cx="12" cy="12" r="3.5" stroke="#64748b" strokeWidth="1.6"/><circle cx="17" cy="7" r="1" fill="#64748b"/></svg>),
  whatsapp: (<svg width="15" height="15" viewBox="0 0 16 16" fill="#64748b"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>),
  email: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="#64748b" strokeWidth="1.6"/><path d="m3 7 9 6 9-6" stroke="#64748b" strokeWidth="1.6"/></svg>),
};

function Pill({ children }) { return <span className="inline-flex items-center gap-1 rounded-[6px] border border-[#dfe5ee] bg-[#eff6ff] px-2 py-0.5 text-[12px] text-[#2563eb]">{children} <span className="cursor-pointer text-[#94a3b8]">✕</span></span>; }

const AUDIENCE_FILTERS = ["Name", "City", "Email", "Country", "Browser language", "WhatsApp Number"];
const AUDIENCE_OPERATORS = ["Is", "Is not", "Contains", "Starts with", "Ends with"];

function Dropdown({ value, placeholder, options, onChange, className = "", labelFn }) {
  const [open, setOpen] = useState(false);
  const getLabel = (val) => labelFn ? (typeof labelFn === "function" ? labelFn(val) : labelFn[val] || val) : val;
  return (
    <div className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-[8px] border px-3 py-2 text-[13px] ${open ? "border-[#2563eb]" : "border-[#cfd8e3]"} ${value ? "text-[#111827]" : "text-[#94a3b8]"}`}>
        <span>{value ? getLabel(value) : placeholder}</span>
        <span className="text-[#94a3b8]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-[10px] border border-[#dfe5ee] bg-white py-1 shadow-lg">
          {options.map((o) => (
            <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
              className={`flex w-full items-center px-3 py-2 text-left text-[13px] hover:bg-[#f4f6f9] ${o === value ? "bg-[#eff6ff] text-[#111827]" : "text-[#334155]"}`}>
              {getLabel(o)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddAudienceModal({ onClose, onSave }) {
  const tr = useT();
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState([{ filter: "", op: "Is", value: "" }]);

  const filterLabels = {
    "Name": tr("filterName", "Name"),
    "City": tr("filterCity", "City"),
    "Email": tr("email", "Email"),
    "Country": tr("filterCountry", "Country"),
    "Browser language": tr("filterBrowserLanguage", "Browser language"),
    "WhatsApp Number": tr("filterWhatsAppNumber", "WhatsApp Number"),
  };
  const operatorLabels = {
    "Is": tr("opIs", "Is"),
    "Is not": tr("opIsNot", "Is not"),
    "Contains": tr("opContains", "Contains"),
    "Starts with": tr("opStartsWith", "Starts with"),
    "Ends with": tr("opEndsWith", "Ends with"),
  };

  function updateCond(i, key, v) {
    setConditions((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)));
  }
  function removeCond(i) { setConditions((prev) => prev.filter((_, idx) => idx !== i)); }
  function addCond() { setConditions((prev) => [...prev, { filter: "", op: "Is", value: "" }]); }

  function handleSave() {
    const valid = conditions.filter((c) => c.filter && c.value);
    onSave({ name: name || "Untitled audience", filters: valid.length });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[720px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgAddAudienceTitle", "Add audience")}</div>
        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#cfd8e3] px-3 py-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="#94a3b8" strokeWidth="1.6"/><circle cx="16" cy="9" r="2.2" stroke="#94a3b8" strokeWidth="1.6"/><path d="M3 18c.8-2.4 2.8-3.8 6-3.8s5.2 1.4 6 3.8M14 16c.6-1.6 2-2.5 4-2.5s3 .6 4 2" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("cfgAudienceName", "Audience name")} className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#94a3b8]" />
        </div>

        <div className="mt-5 text-[14px] font-semibold text-[#111827]">{tr("cfgConditions", "Conditions")}</div>
        <div className="mt-2 space-y-2">
          {conditions.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => removeCond(i)} className="text-[#94a3b8] hover:text-[#334155]">✕</button>
              <Dropdown className="w-44" value={c.filter} placeholder={tr("cfgSelectFilter", "Select filter")} options={AUDIENCE_FILTERS} onChange={(v) => updateCond(i, "filter", v)} labelFn={filterLabels} />
              <Dropdown className="w-32" value={c.op} placeholder={tr("cfgSelect", "Select...")} options={AUDIENCE_OPERATORS} onChange={(v) => updateCond(i, "op", v)} labelFn={operatorLabels} />
              <input value={c.value} onChange={(e) => updateCond(i, "value", e.target.value)} className="flex-1 rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
              <button onClick={addCond} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#cfd8e3] text-[#334155] hover:bg-[#f4f6f9]">+</button>
            </div>
          ))}
        </div>
        <button onClick={addCond} className="mt-3 text-[13px] text-[#2563eb]">{tr("cfgAddCondition", "+ Add condition")}</button>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-[8px] border border-[#cfd8e3] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("cancel", "Cancel")}</button>
          <button onClick={handleSave} className="rounded-[8px] bg-[#2563eb] px-5 py-2 text-[13px] font-medium text-white">{tr("save", "Save")}</button>
        </div>
      </div>
    </div>
  );
}

const LANGUAGES = ["English", "Azerbaijani", "Turkish", "Russian", "German", "French", "Spanish", "Italian", "Portuguese", "Arabic", "Chinese", "Japanese", "Korean", "Hindi"];
const HANDOFF_ACTIONS = ["Transfer conversation to agent", "Send a message", "Create a ticket"];
const LYRO_RESPONDS = ["Always", "When agents are offline", "When agents are busy", "Only for selected topics"];
const CONTACT_PROPS = ["Name", "Email", "Phone", "Country", "City", "Current URL", "Browser language", "WhatsApp Number", "Company"];

export default function ConfigurePage({ activeTab, onChangeTab }) {
  const tr = useT();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activate, setActivate] = useState(false);
  const [liveChat, setLiveChat] = useState(true);
  const [messenger, setMessenger] = useState(false);
  const [instagram, setInstagram] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [emailChannel, setEmailChannel] = useState(false);
  const [supportedMode, setSupportedMode] = useState("specific");
  const [defaultLang, setDefaultLang] = useState("English");
  const [supportedLangs, setSupportedLangs] = useState(["English"]);
  const [agentName, setAgentName] = useState("Lyro");
  const [companyDesc, setCompanyDesc] = useState("");
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [handoffOnline, setHandoffOnline] = useState("Transfer conversation to agent");
  const [handoffOffline, setHandoffOffline] = useState("Transfer conversation to agent");
  const [handoffMsg, setHandoffMsg] = useState("");
  const [audiences, setAudiences] = useState([]);
  const [showAddAudience, setShowAddAudience] = useState(false);
  const [newLang, setNewLang] = useState("");
  const [lyroResponds, setLyroResponds] = useState("Always");
  const [contactProps, setContactProps] = useState(["Name", "Email", "Current URL"]);
  const [showContactManage, setShowContactManage] = useState(false);
  const [surveyLiveChat, setSurveyLiveChat] = useState(true);
  const [surveyTickets, setSurveyTickets] = useState(true);
  const [mailboxes, setMailboxes] = useState([]);
  const [newMailbox, setNewMailbox] = useState("");

  // Load settings from backend
  useEffect(() => {
    api.getSiteSettings().then(({ settings: s }) => {
      setActivate(s.botActive ?? false);
      setAgentName(s.agentName || "Lyro");
      setCompanyDesc(s.companyDescription || "");
      setDefaultLang(s.defaultLanguage || "English");
      setSupportedLangs(Array.isArray(s.supportedLanguages) ? s.supportedLanguages : ["English"]);
      setSupportedMode(s.supportedMode || "specific");
      setLiveChat(s.channels?.liveChat ?? true);
      setMessenger(s.channels?.messenger ?? false);
      setInstagram(s.channels?.instagram ?? false);
      setWhatsapp(s.channels?.whatsapp ?? false);
      setEmailChannel(s.channels?.email ?? false);
      setAutoSuggest(s.autoSuggestions ?? true);
      setHandoffOnline(s.handoff?.onlineAction === "message" ? "Send a message" : "Transfer conversation to agent");
      setHandoffOffline(s.handoff?.offlineAction === "message" ? "Send a message" : "Transfer conversation to agent");
      setHandoffMsg(s.handoff?.offlineMessage || "");
      setAudiences(Array.isArray(s.audiences) ? s.audiences : []);
      setLyroResponds(s.lyroResponds || "Always");
      setContactProps(Array.isArray(s.contactProperties) ? s.contactProperties : ["Name", "Email", "Current URL"]);
      setSurveyLiveChat(s.survey?.liveChat ?? true);
      setSurveyTickets(s.survey?.tickets ?? true);
      setMailboxes(Array.isArray(s.mailboxes) ? s.mailboxes : []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  // Auto-save debounced
  const timerRef = useRef(null);
  const saveSettings = useCallback(() => {
    if (!loaded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.updateSiteSettings({
          botActive: activate,
          agentName,
          companyDescription: companyDesc,
          defaultLanguage: defaultLang,
          supportedLanguages: supportedLangs,
          supportedMode,
          channels: { liveChat, messenger, instagram, whatsapp, email: emailChannel },
          autoSuggestions: autoSuggest,
          handoff: {
            onlineAction: handoffOnline.includes("message") ? "message" : "transfer",
            offlineAction: handoffOffline.includes("message") ? "message" : "transfer",
            offlineMessage: handoffMsg,
          },
          audiences,
          lyroResponds,
          contactProperties: contactProps,
          survey: { liveChat: surveyLiveChat, tickets: surveyTickets },
          mailboxes,
        });
      } catch (e) { console.error("Settings save failed", e); }
      setSaving(false);
    }, 600);
  }, [loaded, activate, agentName, companyDesc, defaultLang, supportedLangs, supportedMode, liveChat, messenger, instagram, whatsapp, emailChannel, autoSuggest, handoffOnline, handoffOffline, handoffMsg, audiences, lyroResponds, contactProps, surveyLiveChat, surveyTickets, mailboxes]);

  useEffect(() => { saveSettings(); }, [saveSettings]);

  function addLang(lang) {
    if (lang && !supportedLangs.includes(lang)) setSupportedLangs((p) => [...p, lang]);
    setNewLang("");
  }
  function removeLang(lang) {
    setSupportedLangs((p) => p.filter((l) => l !== lang));
  }

  const tabLabels = {
    General: tr("cfgGeneralTab", "General"),
    Handoff: tr("cfgHandoffTab", "Handoff"),
    Audiences: tr("cfgAudiencesTab", "Audiences"),
    Copilot: tr("cfgCopilotTab", "Copilot"),
  };

  const handoffActionLabels = {
    "Transfer conversation to agent": tr("cfgTransferToAgent", "Transfer conversation to agent"),
    "Send a message": tr("cfgSendMessage", "Send a message"),
    "Create a ticket": tr("cfgCreateTicket", "Create a ticket"),
  };

  const lyroRespondsLabels = {
    "Always": tr("cfgLyroAlways", "Always"),
    "When agents are offline": tr("cfgLyroWhenOffline", "When agents are offline"),
    "When agents are busy": tr("cfgLyroWhenBusy", "When agents are busy"),
    "Only for selected topics": tr("cfgLyroSelectedTopics", "Only for selected topics"),
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-3 md:p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-4 md:p-5">
        <div className="flex items-center justify-between border-b border-[#e5eaf1]">
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap text-[15px] md:gap-6">
            {configureTabs.map((tab) => (
              <button key={tab} type="button" onClick={() => onChangeTab(tab)} className={`${activeTab === tab ? "border-b-[3px] border-[#2563eb] pb-3 font-medium text-[#2563eb]" : "pb-3 text-[#111827]"}`}>
                {tabLabels[tab] || tab}
              </button>
            ))}
          </div>
          {saving && <span className="mr-2 animate-pulse text-[11px] text-[#64748b]">{tr("saving", "Saving...")}</span>}
        </div>

        {!loaded && <div className="py-12 text-center text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>}

        {loaded && activeTab === "General" && (
          <div className="py-6 space-y-8">
            <div>
              <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgMain", "Main")}</div>
              <div className="mt-4 max-w-[460px] space-y-4">
                <div className="flex items-center justify-between"><span className="text-[14px] text-[#111827]">{tr("cfgActivate", "Activate")}</span><Toggle on={activate} onChange={setActivate} /></div>
                <div><div className="mb-2 text-[13px] text-[#334155]">{tr("cfgLyroResponds", "Lyro responds")}</div><Dropdown value={lyroResponds} placeholder={tr("cfgSelect", "Select...")} options={LYRO_RESPONDS} onChange={setLyroResponds} labelFn={lyroRespondsLabels} /></div>
              </div>
            </div>

            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgChannels", "Channels")}</div>
              <div className="mt-4 max-w-[520px] space-y-3 text-[13px]">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2">{channelIcons.chat}{tr("cfgLiveChat", "Live chat")}</span><Toggle on={liveChat} onChange={setLiveChat} /></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2">{channelIcons.messenger}{tr("channelMessenger", "Messenger")}</span><span className="flex items-center gap-3"><Toggle on={messenger} onChange={setMessenger} /><span className={messenger ? "text-[#15803d]" : "text-[#2563eb] cursor-pointer"}>{messenger ? tr("cfgIntegrated", "✓ Integrated") : tr("cfgIntegrate", "Integrate")}</span></span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2">{channelIcons.instagram}{tr("channelInstagram", "Instagram")}</span><span className="flex items-center gap-3"><Toggle on={instagram} onChange={setInstagram} /><span className={instagram ? "text-[#15803d]" : "text-[#2563eb] cursor-pointer"}>{instagram ? tr("cfgIntegrated", "✓ Integrated") : tr("cfgIntegrate", "Integrate")}</span></span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2">{channelIcons.whatsapp}{tr("channelWhatsapp", "WhatsApp")}</span><span className="flex items-center gap-3"><Toggle on={whatsapp} onChange={setWhatsapp} /><span className={whatsapp ? "text-[#15803d]" : "text-[#2563eb] cursor-pointer"}>{whatsapp ? tr("cfgIntegrated", "✓ Integrated") : tr("cfgIntegrate", "Integrate")}</span></span></div>
              </div>
              <div className="mt-5 max-w-[520px]">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#111827]">{tr("cfgTickets", "Tickets")} <span className="rounded-[4px] bg-[#dbeafe] px-1.5 py-0.5 text-[9px] font-semibold text-[#2563eb]">{tr("cfgBeta", "BETA")}</span></div>
                <div className="space-y-3 text-[13px]">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2">{channelIcons.email}{tr("cfgEmail", "Email")}</span><span className="flex items-center gap-3"><Toggle on={emailChannel} onChange={setEmailChannel} /><span className={emailChannel ? "text-[#15803d]" : "text-[#2563eb] cursor-pointer"}>{emailChannel ? tr("cfgConnected", "✓ Connected") : tr("settingsConnectMailbox", "Connect mailbox")}</span></span></div>
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="pt-2">{tr("cfgMailboxes", "Mailboxes")}</span>
                      <div className="w-[280px] space-y-2">
                        {mailboxes.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-[8px] border border-[#dfe5ee] bg-[#f8fafc] px-2.5 py-1.5 text-[12px] text-[#334155]">
                            <span className="flex-1 truncate">{m}</span>
                            <button onClick={() => setMailboxes((p) => p.filter((_, idx) => idx !== i))} className="text-[#94a3b8] hover:text-[#ef4444]">✕</button>
                          </div>
                        ))}
                        <form onSubmit={(e) => { e.preventDefault(); if (newMailbox.trim()) { setMailboxes((p) => [...p, newMailbox.trim()]); setNewMailbox(""); } }} className="flex gap-1.5">
                          <input value={newMailbox} onChange={(e) => setNewMailbox(e.target.value)} placeholder="email@example.com" className="flex-1 rounded-[8px] border border-[#cfd8e3] px-2.5 py-1.5 text-[12px] outline-none placeholder:text-[#94a3b8]" />
                          <button type="submit" className="rounded-[8px] bg-[#2563eb] px-3 py-1.5 text-[11px] font-medium text-white">+</button>
                        </form>
                      </div>
                    </div>
                    <div className="mt-1 text-right text-[11px] text-[#94a3b8]" style={{marginLeft: "auto", width: "280px"}}>{tr("cfgLyroRespondsEmailsDesc", "Lyro will respond to emails and contact forms linked to the selected mailboxes")}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgLanguages", "Languages")}</div>
              <div className="mt-1 text-[13px] text-[#64748b]">{tr("cfgLanguagesDesc", "Lyro detects and replies in the visitor's language. Some languages are still in testing, check the full list here. If a language can't be detected, Lyro will fall back to the default one.")}</div>
              <div className="mt-4 max-w-[600px] space-y-4 text-[13px]">
                <div className="flex items-center gap-4">
                  <span className="w-[150px] text-[#111827]">{tr("cfgDefaultLanguage", "Default language")}</span>
                  <Dropdown className="flex-1" value={defaultLang} placeholder={tr("cfgSelect", "Select...")} options={LANGUAGES} onChange={setDefaultLang} />
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-[150px] pt-1 text-[#111827]">{tr("cfgSupportedLanguages", "Supported languages")}</span>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5"><input type="radio" name="lang-mode" checked={supportedMode === "all"} onChange={() => setSupportedMode("all")} className="accent-[#2563eb]" /> {tr("cfgAll", "All")}</label>
                      <label className="flex items-center gap-1.5"><input type="radio" name="lang-mode" checked={supportedMode === "specific"} onChange={() => setSupportedMode("specific")} className="accent-[#2563eb]" /> {tr("cfgSpecificLanguages", "Specific languages")}</label>
                    </div>
                    {supportedMode === "specific" && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#cfd8e3] px-3 py-2">
                          {supportedLangs.map((l) => (
                            <span key={l} className="inline-flex items-center gap-1 rounded-[6px] border border-[#dfe5ee] bg-[#eff6ff] px-2 py-0.5 text-[12px] text-[#2563eb]">{l} <span onClick={() => removeLang(l)} className="cursor-pointer text-[#94a3b8]">✕</span></span>
                          ))}
                        </div>
                        <Dropdown className="w-48" value={newLang} placeholder={tr("cfgAddLanguage", "+ Add language")} options={LANGUAGES.filter((l) => !supportedLangs.includes(l))} onChange={addLang} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgIdentity", "Identity")}</div>
              <div className="mt-1 text-[13px] text-[#64748b]">{tr("cfgIdentityDesc", "Change the name of your AI Agent and add your company description.")}</div>
              <div className="mt-4 max-w-[600px] space-y-4 text-[13px]">
                <div className="flex items-start gap-4">
                  <div className="w-[150px]">
                    <div className="text-[#111827]">{tr("cfgAgentName", "AI Agent name")}</div>
                    <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("cfgAgentNameDesc", "AI Agent uses this name when answering questions about their identity")}</div>
                  </div>
                  <input value={agentName} onChange={(e) => setAgentName(e.target.value)} className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2 outline-none" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-[150px]">
                    <div className="text-[#111827]">{tr("cfgCompanyDesc", "Company description")}</div>
                    <div className="mt-1 text-[11px] text-[#94a3b8]">{tr("cfgCompanyDescDesc", "Describe your business so the AI Agent can tailor responses to your customers")}</div>
                  </div>
                  <textarea value={companyDesc} onChange={(e) => setCompanyDesc(e.target.value)} className="h-20 flex-1 resize-none rounded-[10px] border border-[#cfd8e3] px-3 py-2 outline-none" />
                </div>
              </div>
            </div>

            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgContactProperties", "Contact Properties")}</div>
              <div className="mt-1 text-[13px] text-[#64748b]">{tr("cfgContactPropertiesDesc", "The AI Agent uses selected contact properties to personalize responses, gather context, and resolve issues faster. By default, it always has access to the contact's name, email address, and current URL.")}</div>
              <div className="mt-4 max-w-[600px] space-y-2 text-[13px]">
                <div className="flex items-start gap-4">
                  <span className="w-[150px] pt-1 text-[#111827]">{tr("cfgAvailableToLyro", "Available to Lyro")}</span>
                  <div className="flex flex-1 flex-wrap gap-1.5 rounded-[10px] border border-[#cfd8e3] px-3 py-2 min-h-[38px]">
                    {contactProps.length === 0 && <span className="text-[#94a3b8]">{tr("cfgSelect", "Select...")}</span>}
                    {contactProps.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1 rounded-[6px] border border-[#dfe5ee] bg-[#eff6ff] px-2 py-0.5 text-[12px] text-[#2563eb]">{p} <span onClick={() => setContactProps((pr) => pr.filter((x) => x !== p))} className="cursor-pointer text-[#94a3b8]">✕</span></span>
                    ))}
                  </div>
                </div>
                <div className="ml-[166px]"><button type="button" onClick={() => setShowContactManage(!showContactManage)} className="text-[12px] text-[#2563eb]">{showContactManage ? tr("cfgClose", "Close") : tr("cfgManage", "Manage")}</button></div>
                {showContactManage && (
                  <div className="ml-[166px] rounded-[10px] border border-[#dfe5ee] bg-[#fafbfd] p-3 space-y-1.5">
                    {CONTACT_PROPS.map((p) => (<label key={p} className="flex items-center gap-2 text-[13px] text-[#334155] cursor-pointer"><input type="checkbox" checked={contactProps.includes(p)} onChange={() => setContactProps((pr) => pr.includes(p) ? pr.filter((x) => x !== p) : [...pr, p])} className="accent-[#2563eb]" />{p}</label>))}
                  </div>
                )}
                <div className="mt-2 flex items-start gap-2 rounded-[8px] bg-[#eef2f7] px-3 py-2 text-[12px] text-[#334155]">
                  <span className="mt-0.5 text-[#94a3b8]">ⓘ</span>
                  <span>{tr("cfgNote", "Please note: Selected properties may be referenced in replies to customers. Share only what's necessary.")}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgCustomerSatisfaction", "Customer satisfaction")}</div>
              <div className="mt-1 text-[13px] text-[#64748b]">{tr("cfgSatisfactionDesc", "Measure the level of your customer satisfaction by sending an automated survey. To enable or disable the survey go to customer satisfaction settings.")}</div>
              <div className="mt-3 text-[13px] text-[#334155]">{tr("cfgSatisfactionEnabled", "Satisfaction survey is now enabled for:")}</div>
              <div className="mt-2 space-y-2 text-[13px] text-[#334155]">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={surveyLiveChat} onChange={(e) => setSurveyLiveChat(e.target.checked)} className="accent-[#2563eb]" />{channelIcons.chat}{tr("cfgLiveChat", "Live chat")}</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={surveyTickets} onChange={(e) => setSurveyTickets(e.target.checked)} className="accent-[#2563eb]" />{tr("cfgTickets", "Tickets")}</label>
              </div>
            </div>
          </div>
        )}

        {loaded && activeTab === "Handoff" && (
          <div className="py-6 space-y-6">
            <div>
              <div className="text-[20px] font-semibold text-[#111827]">{tr("cfgHandoffAudiences", "Handoff audiences")}</div>
              <Dropdown className="mt-4 max-w-[380px]" value="" placeholder={tr("cfgSelectAudiences", "Select audiences")} options={audiences.map((a) => a.name)} onChange={() => {}} />
            </div>
            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[20px] font-semibold text-[#111827]">{tr("cfgHandoffTab", "Handoff")}</div>
              <div className="mt-4 grid max-w-[520px] gap-4">
                <div>
                  <div className="mb-2 text-[13px] text-[#334155]" >{tr("cfgWhenAgentsOnline", "When agents are online")}</div>
                  <Dropdown value={handoffOnline} placeholder={tr("cfgSelect", "Select...")} options={HANDOFF_ACTIONS} onChange={setHandoffOnline} labelFn={handoffActionLabels} />
                </div>
                <div>
                  <div className="mb-2 text-[13px] text-[#334155]" >{tr("cfgWhenAgentsOffline", "When agents are offline")}</div>
                  <Dropdown value={handoffOffline} placeholder={tr("cfgSelect", "Select...")} options={HANDOFF_ACTIONS} onChange={setHandoffOffline} labelFn={handoffActionLabels} />
                </div>
                {handoffOffline.includes("message") && (
                  <div>
                    <div className="mb-2 text-[13px] text-[#334155]" >{tr("cfgOfflineMessage", "Offline message")}</div>
                    <textarea value={handoffMsg} onChange={(e) => setHandoffMsg(e.target.value)} className="h-20 w-full resize-none rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" placeholder={tr("cfgOfflineMessagePlaceholder", "Message to show when operator is offline...")} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loaded && activeTab === "Audiences" && (
          <div className="py-6">
            <div className="mt-6 flex items-center justify-between">
              <div className="text-[20px] font-semibold text-[#111827]">{tr("cfgAudiences", "Audiences")}: {audiences.length}</div>
              <button onClick={() => setShowAddAudience(true)} className="rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">{tr("cfgAddAudience", "+ Add audience")}</button>
            </div>
            <div className="mt-4 overflow-hidden rounded-[14px] border border-[#dfe5ee]">
              <div className="grid grid-cols-[1fr_160px_60px] bg-[#fbfcfe] px-4 py-3 text-[13px] text-[#64748b]"><span>{tr("cfgAudienceName", "Audience name")}</span><span>{tr("cfgFilters", "Filters")}</span><span></span></div>
              {audiences.length === 0 ? (
                <div className="border-t border-[#eef2f7] px-4 py-5 text-[14px] text-[#64748b]">{tr("cfgNoAudiencesYet", "You don't have any audiences yet. Add first audience")}</div>
              ) : (
                audiences.map((a, i) => (
                  <div key={i} className="grid grid-cols-[1fr_160px_60px] border-t border-[#eef2f7] px-4 py-3 text-[13px] text-[#111827]">
                    <span>{a.name}</span>
                    <span className="text-[#64748b]">{a.filters} filter{a.filters === 1 ? "" : "s"}</span>
                    <button onClick={() => setAudiences((p) => p.filter((_, idx) => idx !== i))} className="text-[12px] text-[#ef4444] hover:underline">{tr("delete", "Delete")}</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {loaded && activeTab === "Copilot" && (
          <div className="py-6">
            <div className="rounded-[16px] bg-[#f4f7fb] p-4">
              <div className="text-[18px] font-semibold text-[#111827]">{tr("cfgCopilotTab", "Copilot")}</div>
              <div className="mt-2 max-w-[700px] text-[14px] text-[#334155]">{tr("cfgCopilotDesc", "Copilot is your AI assistant powered by the knowledge you've added to Data Sources and past agents conversations.")}</div>
            </div>
            <div className="mt-6 border-b border-[#e5eaf1] pb-6">
              <div className="text-[20px] font-semibold text-[#111827]">{tr("cfgAutoSuggestions", "Auto–suggestions")}</div>
              <div className="mt-4 flex max-w-[300px] items-center justify-between"><span className="text-[14px] text-[#111827]">{tr("cfgAutoSuggestions", "Auto–suggestions")}</span><Toggle on={autoSuggest} onChange={setAutoSuggest} /></div>
            </div>
          </div>
        )}
      </div>
      {showAddAudience && (
        <AddAudienceModal
          onClose={() => setShowAddAudience(false)}
          onSave={(a) => setAudiences((prev) => [...prev, a])}
        />
      )}
    </div>
  );
}
