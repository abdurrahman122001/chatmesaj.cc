import React, { useState, useEffect } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

export default function PlaygroundPage() {
  const tr = useT();
  const [tab, setTab] = useState("live");
  const [message, setMessage] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: tr("pgGreeting", "Hi! How can I help you? 😊") },
  ]);
  const [emailReply, setEmailReply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState("Lyro");

  // Load prompts when tab changes
  useEffect(() => {
    const mode = tab === "email" ? "email" : "live";
    api.playgroundPrompts(mode).then(setPrompts).catch(() => setPrompts([]));
  }, [tab]);

  function resetChat() {
    setChatMessages([{ role: "bot", text: tr("pgGreeting", "Hi! How can I help you? 😊") }]);
    setEmailReply(null);
    setMessage("");
  }

  async function sendLive(text) {
    const q = (text || message).trim();
    if (!q || loading) return;
    setChatMessages((prev) => [...prev, { role: "user", text: q }]);
    setMessage("");
    setLoading(true);
    try {
      const res = await api.playgroundTest(q, "live");
      setAgentName(res.agentName || "Lyro");
      setChatMessages((prev) => [...prev, { role: "bot", text: res.answer, found: res.found }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "bot", text: tr("pgError", "An error occurred. Try again.") }]);
    }
    setLoading(false);
  }

  async function sendEmail(text) {
    const q = (text || message).trim();
    if (!q || loading) return;
    setMessage("");
    setLoading(true);
    setEmailReply(null);
    try {
      const res = await api.playgroundTest(q, "email");
      setAgentName(res.agentName || "Lyro");
      setEmailReply({ question: q, answer: res.answer, found: res.found, matches: res.matches });
    } catch {
      setEmailReply({ question: q, answer: tr("pgError", "An error occurred. Try again."), found: false });
    }
    setLoading(false);
  }

  function handlePromptClick(p) {
    if (tab === "live") sendLive(p);
    else setMessage(p);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-3 md:p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-4 md:p-5">
        <div className="text-[22px] font-semibold text-[#111827]">{tr("playgroundTitle", "Playground")}</div>
        <div className="mt-4 flex gap-6 border-b border-[#e5eaf1] text-[15px]">
          <button onClick={() => { setTab("live"); setEmailReply(null); }} className={tab === "live" ? "border-b-[3px] border-[#2563eb] pb-3 font-medium text-[#2563eb]" : "pb-3 text-[#111827]"}>{tr("pgLiveChat", "Live chat")}</button>
          <button onClick={() => setTab("email")} className={`pb-3 flex items-center gap-1.5 ${tab === "email" ? "border-b-[3px] border-[#2563eb] font-medium text-[#2563eb]" : "text-[#111827]"}`}>{tr("email", "Email")} <span className="rounded-[4px] bg-[#dbeafe] px-1.5 py-0.5 text-[9px] font-semibold text-[#2563eb]">BETA</span></button>
        </div>

        {tab === "live" && (
          <div className="mt-4 grid grid-cols-1 gap-6 rounded-[18px] border border-[#dfe5ee] p-4 md:p-6 lg:grid-cols-[320px_1fr]">
            {/* Chat preview */}
            <div className="flex flex-col rounded-[20px] border border-[#e5eaf1] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between text-[14px] text-[#111827]"><span>{agentName} 👋</span><span>⋮</span></div>
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: 420 }}>
                {chatMessages.map((m, i) => (
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end"><div className="max-w-[240px] rounded-[12px] bg-[#4f2bd6] px-4 py-3 text-[14px] text-white">{m.text}</div></div>
                  ) : (
                    <div key={i} className="inline-block max-w-[260px] rounded-[12px] bg-[#f6f7fb] px-4 py-3 text-[14px] text-[#111827] whitespace-pre-wrap">{m.text}</div>
                  )
                ))}
                {loading && <div className="inline-block rounded-[12px] bg-[#f6f7fb] px-4 py-3 text-[14px] text-[#94a3b8] animate-pulse">{tr("pgWriting", "Writing...")}</div>}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); sendLive(); }} className="mt-3 flex items-center gap-2 border-t border-[#e5eaf1] pt-3">
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={tr("pgTypeMsg", "Type your message...")} className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#94a3b8]" />
                <button type="submit" disabled={!message.trim() || loading} className={`rounded-[8px] px-3 py-1.5 text-[13px] font-medium ${message.trim() && !loading ? "bg-[#2563eb] text-white" : "bg-[#e5eaf1] text-[#94a3b8] cursor-not-allowed"}`}>↑</button>
              </form>
            </div>
            {/* Right side */}
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[20px] font-semibold text-[#111827]">{`Test ${agentName} `}{tr("pgTestKnowledge", "with your knowledge")}</div>
                <button onClick={resetChat} className="text-[14px] text-[#2563eb] cursor-pointer hover:underline">↻ {tr("pgResetTest", "Reset test")}</button>
              </div>
              <div className="mt-3 text-[14px] text-[#64748b]">{tr("pgDescription", "Type a question or try one of the examples")}</div>
              <div className="mt-5 space-y-3">
                {prompts.map((prompt, i) => (
                  <div key={i} onClick={() => handlePromptClick(prompt)} className="max-w-[520px] rounded-[16px] bg-[#eef2f7] px-4 py-3 text-[15px] text-[#111827] cursor-pointer hover:bg-[#e2e8f0] transition-colors">{prompt}</div>
                ))}
              </div>
              {prompts.length > 0 && (
                <button onClick={() => api.playgroundPrompts("live").then(setPrompts).catch(() => {})} className="mt-5 text-[14px] text-[#2563eb] cursor-pointer hover:underline">{tr("pgShowOther", "Show other")}</button>
              )}
              <div className="mt-10 rounded-[14px] bg-[#f5f7fb] px-4 py-3 text-[13px] text-[#334155]">ⓘ {tr("pgEnhanceHint", "To enhance response quality, keep adding more knowledge.")} <span className="text-[#2563eb] cursor-pointer">{tr("pgAddMoreKnowledge", "Add more knowledge")}</span></div>
            </div>
          </div>
        )}

        {tab === "email" && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
              {/* Email compose / reply */}
              <div className="flex flex-col rounded-[14px] border border-[#dfe5ee] bg-white">
                {!emailReply ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-10 py-16 text-center">
                    <div className="text-[18px] font-semibold text-[#111827]">{`Test ${agentName} `}{tr("pgTestKnowledge", "with your knowledge")}</div>
                    <div className="mt-2 max-w-[360px] text-[13px] text-[#64748b]">{tr("pgDescription", "Type a question or try one of the examples")}</div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: 420 }}>
                    {/* User question */}
                    <div className="rounded-[12px] border border-[#e5eaf1] bg-[#fafbfe] p-4">
                      <div className="mb-2 flex items-center gap-2 text-[12px] text-[#64748b]">
                        <span className="font-medium text-[#111827]">{tr("pgYou", "You")}</span>
                        <span>→ {agentName}</span>
                      </div>
                      <div className="text-[13px] text-[#111827]">{emailReply.question}</div>
                    </div>
                    {/* Bot reply */}
                    <div className="rounded-[12px] border border-[#dbeafe] bg-[#eff6ff] p-4">
                      <div className="mb-2 flex items-center gap-2 text-[12px] text-[#64748b]">
                        <span className="font-medium text-[#2563eb]">{agentName}</span>
                        {!emailReply.found && <span className="rounded bg-[#fef3c7] px-1.5 py-0.5 text-[10px] text-[#92400e]">{tr("pgNotInKb", "Not in knowledge base")}</span>}
                      </div>
                      <div className="whitespace-pre-wrap text-[13px] text-[#111827]">{emailReply.answer}</div>
                    </div>
                  </div>
                )}
                <div className="border-t border-[#e5eaf1] px-4 py-3 text-[13px]"><span className="text-[#64748b]">{tr("pgTo", "To:")}</span> <span className="text-[#111827]">{agentName}</span></div>
                <form onSubmit={(e) => { e.preventDefault(); sendEmail(); }} className="border-t border-[#e5eaf1] px-4 py-3">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={tr("pgEnterTicketMsg", "Enter a ticket message...")} className="h-24 w-full resize-none bg-transparent text-[13px] outline-none placeholder:text-[#94a3b8]" />
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => { setEmailReply(null); setMessage(""); }} className="text-[12px] text-[#64748b] hover:text-[#111827]">↻ {tr("pgResetBtn", "Reset")}</button>
                    <button type="submit" disabled={!message.trim() || loading} className={`rounded-[8px] px-4 py-1.5 text-[13px] font-medium ${message.trim() && !loading ? "bg-[#2563eb] text-white" : "bg-[#e5eaf1] text-[#94a3b8] cursor-not-allowed"}`}>{loading ? tr("sending", "Sending...") : tr("send", "Send")}</button>
                  </div>
                </form>
              </div>

              {/* Prompt suggestions */}
              <div>
                <div className="text-[18px] font-semibold text-[#111827]">{`Test ${agentName} `}{tr("pgTestKnowledge", "with your knowledge")}</div>
                <div className="mt-2 text-[13px] text-[#64748b]">{tr("pgDescription", "Type a question or try one of the examples")}</div>
                <div className="mt-4 space-y-2">
                  {prompts.map((p, i) => (
                    <div key={i} onClick={() => handlePromptClick(p)} className="rounded-[12px] bg-[#eef2f7] px-4 py-3 text-[13px] text-[#111827] cursor-pointer hover:bg-[#e2e8f0] transition-colors">{p}</div>
                  ))}
                </div>
                {prompts.length > 0 && (
                  <button onClick={() => api.playgroundPrompts("email").then(setPrompts).catch(() => {})} className="mt-3 text-[13px] text-[#2563eb] cursor-pointer hover:underline">{tr("pgShowOther", "Show other")}</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
