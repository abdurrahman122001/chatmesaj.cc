import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-[#2563eb]" : "bg-[#e5eaf1]"}`}>
      <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${on ? "left-[23px]" : "left-[3px]"}`} />
    </button>
  );
}

export default function SatisfactionPage() {
  const tr = useT();
  const [tab, setTab] = useState("Live conversations");
  const [siteId, setSiteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [liveAgent, setLiveAgent] = useState(true);
  const [liveLyro, setLiveLyro] = useState(true);
  const [liveRating, setLiveRating] = useState("How would you rate your experience talking to us today?");
  const [liveComment, setLiveComment] = useState("Share your feedback (optional)");

  const [ticketAgent, setTicketAgent] = useState(true);
  const [ticketLyro, setTicketLyro] = useState(true);
  const [emailIntro, setEmailIntro] = useState("Hello,\n\nThank you for contacting our support. Please take a moment to tell us about your experience.");
  const [ticketRating, setTicketRating] = useState("How would you rate the support you received?");
  const [emailOutro, setEmailOutro] = useState("Your feedback is valuable and will only take a few seconds.");
  const [ticketComment, setTicketComment] = useState("What is the main reason for your score?");

  useEffect(() => {
    api.me().then(({ sites }) => {
      const s = sites?.[0];
      if (!s) return;
      setSiteId(s.id);
      const sat = s.settings?.satisfaction;
      if (sat) {
        if (sat.liveAgent !== undefined) setLiveAgent(sat.liveAgent);
        if (sat.liveLyro !== undefined) setLiveLyro(sat.liveLyro);
        if (sat.liveRating) setLiveRating(sat.liveRating);
        if (sat.liveComment) setLiveComment(sat.liveComment);
        if (sat.ticketAgent !== undefined) setTicketAgent(sat.ticketAgent);
        if (sat.ticketLyro !== undefined) setTicketLyro(sat.ticketLyro);
        if (sat.emailIntro) setEmailIntro(sat.emailIntro);
        if (sat.ticketRating) setTicketRating(sat.ticketRating);
        if (sat.emailOutro) setEmailOutro(sat.emailOutro);
        if (sat.ticketComment) setTicketComment(sat.ticketComment);
      }
    }).catch(() => {});
  }, []);

  async function save() {
    if (!siteId) return;
    setSaving(true); setError("");
    try {
      const satisfaction = {
        liveAgent, liveLyro, liveRating, liveComment,
        ticketAgent, ticketLyro, emailIntro, ticketRating, emailOutro, ticketComment,
      };
      await api.updateSiteSettings({ satisfaction });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.message || tr("saveFailed", "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  const isLive = tab === "Live conversations";

  return (
    <div className="flex min-h-0 flex-1 gap-5 overflow-y-auto bg-[#f6f8fb] p-5">
      <div className="flex-1">
        <div className="overflow-hidden rounded-[16px] border border-[#dfe5ee] bg-white">
          <div className="flex gap-6 border-b border-[#dfe5ee] px-5 text-[13px]">
            {["Live conversations", "Tickets"].map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={tab === t ? "border-b-2 border-[#2563eb] py-3 font-medium text-[#2563eb]" : "py-3 text-[#334155]"}>
                {t}
              </button>
            ))}
          </div>
          <div className="p-6 space-y-5">
            <div className="text-[13px] text-[#334155]">
              If you want to measure the level of your customer satisfaction, you can enable an automated survey that allows them to rate and comment on their experience.{" "}
              {isLive
                ? "It will be shown whenever an agent closes a conversation."
                : "It will be send after an agent solves the ticket."}{" "}
              You will be able to check results in the <span className="text-[#2563eb]">Analytics section.</span>
            </div>

            {isLive ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#111827]">{tr("sendSurveyConversationsAgent", "Send survey for conversations handled by agent")}</div>
                  <Toggle on={liveAgent} onChange={setLiveAgent} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#111827]">{tr("sendSurveyConversationsLyro", "Send survey for conversations handled by Lyro")}</div>
                  <Toggle on={liveLyro} onChange={setLiveLyro} />
                </div>
                <div>
                  <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("messageAboutRating", "Message about rating")}</div>
                  <input value={liveRating} onChange={(e) => setLiveRating(e.target.value)}
                    className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                </div>
                <div>
                  <div className="mb-1 text-[13px] font-medium text-[#334155]">{tr("additionalComment", "Additional comment")}</div>
                  <textarea value={liveComment} onChange={(e) => setLiveComment(e.target.value)}
                    className="h-20 w-full resize-none rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#111827]">{tr("sendSurveyAgent", "Send survey for tickets handled by agent")}</div>
                  <Toggle on={ticketAgent} onChange={setTicketAgent} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#111827]">{tr("sendSurveyLyro", "Send survey for tickets handled by Lyro")}</div>
                  <Toggle on={ticketLyro} onChange={setTicketLyro} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-[13px] font-medium text-[#334155]">{tr("triggerTime", "Trigger time")}</div>
                  <div className="flex flex-1 items-center justify-between rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px]">
                    <span>{tr("eightHoursAfterSolved", "8 hours after ticket is solved")}</span><span className="text-[#94a3b8]">▼</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-36 shrink-0 pt-2 text-[13px] font-medium text-[#334155]">{tr("emailIntro", "E-mail intro")}</div>
                  <textarea value={emailIntro} onChange={(e) => setEmailIntro(e.target.value)}
                    className="h-24 flex-1 resize-none rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-[13px] font-medium text-[#334155]">Message about rating</div>
                  <input value={ticketRating} onChange={(e) => setTicketRating(e.target.value)}
                    className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-[13px] font-medium text-[#334155]">{tr("emailOutro", "E-mail outro")}</div>
                  <input value={emailOutro} onChange={(e) => setEmailOutro(e.target.value)}
                    className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex w-36 shrink-0 items-center gap-1 text-[13px] font-medium text-[#334155]">
                    Additional comment
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#94a3b8] text-[10px] text-[#94a3b8]">?</span>
                  </div>
                  <input value={ticketComment} onChange={(e) => setTicketComment(e.target.value)}
                    className="flex-1 rounded-[10px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                </div>
              </>
            )}

            {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
            <div className="flex items-center gap-3">
              <button onClick={save} disabled={saving || !siteId}
                className="rounded-[8px] bg-[#2563eb] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-60">
                {saving ? tr("saving", "Saving...") : tr("save", "Save")}
              </button>
              {saved && <span className="text-[12px] text-[#15803d]">✓ {tr("saved", "Saved")}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="w-[260px] shrink-0">
        {isLive ? (
          <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-4">
            <div className="rounded-[12px] bg-[#2563eb] p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-24 rounded bg-white/40" />
                  <div className="h-2 w-16 rounded bg-white/30" />
                </div>
                <span className="text-white">⋮</span>
                <span className="text-white">▼</span>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-[12px]">
              <div className="rounded-[8px] bg-[#f4f6f9] px-3 py-2 text-[#64748b]">——————————— ?</div>
              <div className="flex items-center justify-center gap-2 py-2 text-[20px]">😠 😟 😐 😊 😍</div>
              <div className="rounded-[8px] bg-[#f4f6f9] px-3 py-2 text-[#64748b]">——————————— ?</div>
              <div className="flex items-center gap-1 text-[#22c55e] text-[11px]">✓ ———————————</div>
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-4 text-[12px]">
            <div className="font-medium text-[#111827]">Ticket #848401</div>
            <div className="mt-3 space-y-2">
              {["Jan 21, 2023","Jan 22, 2023"].map((d) => (
                <div key={d} className="flex items-start gap-2">
                  <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[#dde5ee]" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-full rounded bg-[#e5eaf1]" />
                    <div className="h-2 w-3/4 rounded bg-[#e5eaf1]" />
                    <div className="h-2 w-1/2 rounded bg-[#e5eaf1]" />
                  </div>
                  <span className="shrink-0 text-[11px] text-[#94a3b8]">{d}</span>
                </div>
              ))}
              <div className="space-y-1 pt-1">
                <div className="h-2 w-full rounded bg-[#e5eaf1]" />
                <div className="h-2 w-4/5 rounded bg-[#e5eaf1]" />
                <div className="h-2 w-2/3 rounded bg-[#e5eaf1]" />
              </div>
              <div className="flex items-center gap-1 text-[#64748b]">
                <div className="h-2 w-24 rounded bg-[#e5eaf1]" />
                <span>?</span>
              </div>
              <div className="flex items-center gap-1 py-1 text-[20px]">😠 😟 😐 😊 😍</div>
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-[#e5eaf1]" />
                <div className="h-2 w-3/4 rounded bg-[#e5eaf1]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
