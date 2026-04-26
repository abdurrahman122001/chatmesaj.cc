import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

const EMOJIS = ["😀","😁","😂","🤣","😊","😍","😎","🥳","👍","👏","🙏","🙌","🔥","✨","🎉","💯","❤️","💙","💚","💜","🤔","😉","😅","🙂","😇","🤗","😴","😭","😡","🤝","✅","❌"];

const DEFAULT_MACROS = [
  { title: "Greeting", text: "Hi! Thanks for reaching out. How can I help you today?" },
  { title: "One moment", text: "One moment please, I'm looking into this for you." },
  { title: "Thanks", text: "Thank you for your patience! Is there anything else I can help you with?" },
  { title: "Follow up", text: "Just following up — did the previous answer resolve your issue?" },
  { title: "Closing", text: "Glad I could help! Have a great day." },
];

function loadMacros() {
  try {
    const raw = localStorage.getItem("chatbot_macros");
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_MACROS;
  } catch { return DEFAULT_MACROS; }
}

function formatSize(b) {
  if (!b && b !== 0) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function TopMessageBar({ conversation, onSolve, onClose, onMobileOpenInfo, t }) {
  const solved = conversation.status === "Solved";
  const closed = conversation.status === "Closed";
  return (
    <div className="flex h-[50px] shrink-0 items-center justify-between gap-2 border-b border-[#dfe5ee] bg-white px-3 md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-[13px] md:gap-3">
        <span className="hidden text-[#7a8699] md:inline">{t?.assignee || "Assignee"}</span>
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-[#d5dde8] bg-white px-2 py-[5px] text-[13px] text-[#111827] shadow-[0_1px_0_rgba(255,255,255,0.8)] md:px-3 md:py-[6px]">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dfe5ee] text-[12px] text-[#94a3b8]">◔</span>
          <span className="truncate">{conversation.assignee}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <button onClick={onClose} disabled={!onClose} title={closed ? (t?.reopen || "Reopen conversation") : (t?.endChat || "End chat")}
          className={`flex items-center gap-2 rounded-[10px] border px-2 py-[6px] text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:px-4 md:py-[7px] ${closed ? "border-[#fecaca] bg-[#fee2e2] text-[#991b1b]" : "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c] hover:bg-[#ffe4e6]"} disabled:opacity-60`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="hidden md:inline">{closed ? (t?.endedBtn || "Ended") : (t?.endChat || "End chat")}</span>
        </button>
        <button onClick={onSolve} disabled={!onSolve} title={solved ? (t?.reopen || "Reopen conversation") : (t?.markSolved || "Mark as solved")}
          className={`flex items-center gap-2 rounded-[10px] border px-2 py-[6px] text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:px-4 md:py-[7px] ${solved ? "border-[#bbf7d0] bg-[#dcfce7] text-[#15803d]" : "border-[#cfd8e3] bg-white text-[#273449] hover:bg-[#f8fafc]"} disabled:opacity-60`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="hidden md:inline">{solved ? (t?.solvedBtn || "Solved") : (t?.solve || "Solve")}</span>
        </button>
        {onMobileOpenInfo && (
          <button type="button" onClick={onMobileOpenInfo} className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748b] hover:bg-[#eef2f7] lg:hidden" aria-label={t?.info || "Info"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/><path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

function AttachmentList({ attachments }) {
  if (!attachments?.length) return null;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4001";
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {attachments.map((f, i) => {
        const href = f.url ? (f.url.startsWith("http") ? f.url : `${apiUrl}${f.url}`) : null;
        const isImage = (f.type || "").startsWith("image/");
        if (isImage && href) {
          return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="block"><img src={href} alt={f.name} className="max-h-[180px] max-w-[240px] rounded-[10px] border border-[#dfe5ee]" /></a>;
        }
        const inner = (
          <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#dfe5ee] bg-[#f8fafc] px-2.5 py-1.5 text-[12px] text-[#334155]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
            <span className="max-w-[160px] truncate">{f.name}</span>
            <span className="text-[10px] text-[#94a3b8]">{formatSize(f.size)}</span>
          </span>
        );
        return href ? <a key={i} href={href} target="_blank" rel="noopener noreferrer">{inner}</a> : <span key={i}>{inner}</span>;
      })}
    </div>
  );
}

function MessageBubble({ message }) {
  return (
    <div className="rounded-[14px] bg-[#eff3f9] px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="mb-1 flex items-center gap-2 text-[12px]">
        <span className="text-[20px] text-[#3b82f6]">🤖</span>
        <span className="font-medium text-[#111827]">{message.author}</span>
        <span className="text-[#6e83a6]">{message.time}</span>
      </div>
      {message.text && <div className="max-w-[420px] text-[15px] leading-[1.35] text-[#111827] whitespace-pre-line">{message.text}</div>}
      <AttachmentList attachments={message.attachments} />
    </div>
  );
}

function KnowledgePrompt({ conversation, messages }) {
  const [dismissed, setDismissed] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Son visitor sualı + son agent cavabı. Status PENDING_HUMAN/OPEN olanda göstəririk.
  const suggestion = useMemo(() => {
    if (!conversation) return null;
    const status = conversation.status;
    if (status !== "Pending" && status !== "Open" && status !== "Solved") return null;
    // Son agent mesajı
    let lastAgentIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === "agent") { lastAgentIdx = i; break; }
    }
    if (lastAgentIdx < 0) return null;
    // Son agent mesajından əvvəlki son visitor sualını tap
    let lastVisitor = null;
    for (let i = lastAgentIdx - 1; i >= 0; i--) {
      if (messages[i].sender === "visitor") { lastVisitor = messages[i]; break; }
    }
    if (!lastVisitor || !lastVisitor.text?.trim()) return null;
    const agentMsg = messages[lastAgentIdx];
    if (!agentMsg.text?.trim()) return null;
    const key = `${conversation.id}:${agentMsg.id}`;
    return { key, question: lastVisitor.text.trim(), answer: agentMsg.text.trim() };
  }, [conversation, messages]);

  const tr = useT();

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await api.createKnowledge({
        title: editing.title.trim() || editing.question.slice(0, 80),
        content: editing.content.trim(),
        tags: [],
        status: "ACTIVE",
      });
      setDismissed((d) => ({ ...d, [suggestion.key]: true }));
      setEditing(null);
    } catch (e) {
      alert(tr("error", "Error") + ": " + (e.message || tr("error", "Error")));
    } finally {
      setSaving(false);
    }
  }

  if (!suggestion || dismissed[suggestion.key]) return null;

  return (
    <>
      <div className="flex items-start gap-3 border-b border-[#e5eaf1] bg-[#fef9c3] px-5 py-2.5 text-[12px]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0"><path d="M12 2 3 7l9 5 9-5-9-5Z M3 12l9 5 9-5 M3 17l9 5 9-5" stroke="#a16207" strokeWidth="1.6" strokeLinejoin="round"/></svg>
        <div className="flex-1 text-[#713f12]">
          {tr("kbPromptText", "Add this answer to the Knowledge base? The bot will auto-answer the same question later.")}
        </div>
        <button onClick={() => setEditing({ title: suggestion.question, content: suggestion.answer, question: suggestion.question })}
          className="rounded-[8px] bg-[#ca8a04] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#a16207]">{tr("kbPromptAdd", "Add to Knowledge")}</button>
        <button onClick={() => setDismissed((d) => ({ ...d, [suggestion.key]: true }))}
          className="rounded-[8px] px-2 py-1 text-[12px] text-[#713f12] hover:bg-[#fde68a]">{tr("dismiss", "Dismiss")}</button>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="relative w-full max-w-[600px] rounded-[16px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-[18px] font-semibold text-[#111827]">{tr("kbPromptAdd", "Add to Knowledge")}</div>
            <div className="mt-1 text-[12px] text-[#64748b]">{tr("visitor", "Visitor")}: "{suggestion.question}"</div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("kbTitle", "Title")}</label>
                <input value={editing.title} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("kbContent", "Content")}</label>
                <textarea value={editing.content} onChange={(e) => setEditing((p) => ({ ...p, content: e.target.value }))} rows={6}
                  className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-[10px] border border-[#e5eaf1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#f8fafc]">{tr("cancel", "Cancel")}</button>
              <button onClick={save} disabled={saving} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60">{saving ? tr("saving", "Saving...") : tr("save", "Save")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ChatCenter = forwardRef(function ChatCenter({ conversation, messages, draftMessage, onDraftChange, onSendMessage, onTypingChange, typingLabel, onOpenPalette, onSolve, onClose, onAssign, onMobileBack, onMobileOpenInfo, t }, ref) {
  const [attachments, setAttachments] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState("chat");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [macrosOpen, setMacrosOpen] = useState(false);
  const [macros] = useState(() => loadMacros());
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);
  const macrosRef = useRef(null);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  function updateTypingState(nextText) {
    if (!onTypingChange) return;
    onTypingChange(Boolean((nextText || "").trim()));
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, conversation?.id]);

  useImperativeHandle(ref, () => ({
    focusComposer: () => textareaRef.current?.focus(),
    openEmoji: () => { setEmojiOpen(true); setMacrosOpen(false); },
    openMacros: () => { setMacrosOpen(true); setEmojiOpen(false); },
    triggerFilePicker: () => fileInputRef.current?.click(),
    setDraft: (text) => { onDraftChange(text); requestAnimationFrame(() => textareaRef.current?.focus()); },
  }), [onDraftChange]);

  useEffect(() => {
    function onDoc(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false);
      if (macrosRef.current && !macrosRef.current.contains(e.target)) setMacrosOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Conversation dəyişəndə attachment-ları təmizlə
  useEffect(() => {
    setAttachments([]);
    setDeliveryMode("chat");
    updateTypingState("");
  }, [conversation?.id]);

  function handleFilePick(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeAttachment(i) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  function insertEmoji(e) {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart ?? draftMessage.length;
      const end = ta.selectionEnd ?? draftMessage.length;
      const next = draftMessage.slice(0, start) + e + draftMessage.slice(end);
      onDraftChange(next);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = start + e.length;
        ta.setSelectionRange(pos, pos);
      });
    } else {
      onDraftChange(draftMessage + e);
    }
  }

  function applyMacro(m) {
    onDraftChange(m.text);
    setMacrosOpen(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleSubmit() {
    if (!draftMessage.trim() && attachments.length === 0) return;
    updateTypingState("");
    onSendMessage(attachments, deliveryMode);
    setAttachments([]);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const canSend = !!draftMessage.trim() || attachments.length > 0;
  const solveHandler = onSolve;
  const closeHandler = onClose;

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white md:border-r md:border-[#dfe5ee]">
      <TopMessageBar conversation={conversation} onSolve={solveHandler} onClose={closeHandler} onMobileOpenInfo={onMobileOpenInfo} t={t} />
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="px-3 pb-2 pt-4 md:px-5">
          <div className="space-y-4">
              {messages.map((message) => {
                if (message.sender === "agent") {
                  return (
                    <div key={message.id} className="flex items-start gap-4">
                      <div className="mt-4 w-8 shrink-0" />
                      <MessageBubble message={message} />
                    </div>
                  );
                }
                return (
                  <div key={message.id} className="flex items-start gap-4">
                    <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${message.sender === "customer" ? "text-[14px] font-semibold text-white" : "text-[#9aa5b5]"}`} style={message.sender === "customer" ? { backgroundColor: conversation.color } : { backgroundColor: "#e0e6ef" }}>
                      {message.sender === "customer" ? conversation.count || conversation.initials || conversation.name[0] : "◔"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] leading-[1.3] text-[#111827]"><span className="font-medium">{message.author}</span> <span className="text-[#6e83a6] text-[13px]">{message.time}</span></div>
                      {message.text && <div className="text-[15px] leading-[1.35] text-[#111827] whitespace-pre-line">{message.text}</div>}
                      <AttachmentList attachments={message.attachments} />
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
            {typingLabel && (
              <div className="pt-1 text-[12px] italic text-[#64748b]">{typingLabel}</div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t-[3px] border-[#2c6cff]" />
      <KnowledgePrompt conversation={conversation} messages={messages} />
      <div className="shrink-0 bg-[#fbfcfe] px-3 py-3 md:px-5 md:py-4">
            <textarea ref={textareaRef} value={draftMessage} onChange={(e) => { onDraftChange(e.target.value); updateTypingState(e.target.value); }} onBlur={() => updateTypingState("")} onKeyDown={handleKeyDown}
              placeholder={t?.writeMessage || "Write a message… (Enter to send, Shift+Enter for new line)"}
              className="min-h-[72px] w-full resize-none border-0 bg-transparent text-[15px] leading-[1.45] text-[#111827] outline-none placeholder:text-[#9aa5b5]" />

            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#d1fae5] bg-[#ecfdf5] px-2.5 py-1.5 text-[12px] text-[#065f46]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                    <span className="max-w-[160px] truncate">{f.name}</span>
                    <span className="text-[10px] text-[#059669]/70">{formatSize(f.size)}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="text-[#059669] hover:text-[#ef4444]" aria-label="Remove">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative mt-3 flex items-center justify-between">
              <div className="flex items-center gap-[2px] text-[#64748b]">
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value)}
                  aria-label={t?.deliveryAria || "Delivery channel"}
                  className="mr-2 h-7 rounded-[7px] border border-[#dbe4f0] bg-white px-2 text-[12px] text-[#334155] outline-none"
                >
                  <option value="chat">{t?.deliveryChat || "Chat"}</option>
                  <option value="email">{t?.deliveryEmail || "Email"}</option>
                  <option value="both">{t?.deliveryBoth || "Both"}</option>
                </select>
                <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilePick} />
                <button type="button" title={t?.attach || "Attach file"} onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] hover:bg-[#eef2f7]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.65l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <div ref={emojiRef} className="relative">
                  <button type="button" title={t?.emoji || "Emoji"} onClick={() => { setEmojiOpen((v) => !v); setMacrosOpen(false); }}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-[7px] hover:bg-[#eef2f7] ${emojiOpen ? "bg-[#eef2f7]" : ""}`}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8"/><circle cx="9.25" cy="10.5" r="1" fill="currentColor"/><circle cx="14.75" cy="10.5" r="1" fill="currentColor"/><path d="M8.5 14.5c.8 1.5 2.2 2 3.5 2s2.7-.5 3.5-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                  {emojiOpen && (
                    <div className="absolute bottom-[36px] left-0 z-20 w-[260px] rounded-[12px] border border-[#e5eaf1] bg-white p-2 shadow-lg">
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJIS.map((e) => (
                          <button key={e} type="button" onClick={() => insertEmoji(e)} className="h-7 w-7 rounded-[6px] text-[18px] hover:bg-[#f4f6f9]">{e}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {onOpenPalette && (
                  <button type="button" title={(t?.commands || "Commands") + " (Ctrl+K)"} onClick={onOpenPalette}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] hover:bg-[#eef2f7]">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                  </button>
                )}

                <div ref={macrosRef} className="relative">
                  <button type="button" title={t?.macros || "Macros / quick replies"} onClick={() => { setMacrosOpen((v) => !v); setEmojiOpen(false); }}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-[7px] hover:bg-[#eef2f7] ${macrosOpen ? "bg-[#eef2f7]" : ""}`}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="4.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8"/><path d="M13.5 16.5h6M16.5 13.5v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                  {macrosOpen && (
                    <div className="absolute bottom-[36px] left-0 z-20 w-[320px] rounded-[12px] border border-[#e5eaf1] bg-white py-1 shadow-lg">
                      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">{t?.quickReplies || "Quick replies"}</div>
                      {macros.map((m) => (
                        <button key={m.title} type="button" onClick={() => applyMacro(m)}
                          className="block w-full px-3 py-2 text-left hover:bg-[#f4f6f9]">
                          <div className="text-[13px] font-medium text-[#111827]">{m.title}</div>
                          <div className="truncate text-[12px] text-[#64748b]">{m.text}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button onMouseDown={(e) => e.preventDefault()} onClick={handleSubmit} disabled={!canSend} className={`rounded-[10px] px-6 py-[10px] text-[13px] font-medium ${canSend ? "bg-[#2563eb] text-white" : "bg-[#eef2f7] text-[#a1acbb]"}`}>
                {t?.reply || "Reply"}
              </button>
        </div>
      </div>
    </section>
  );
});

export default ChatCenter;
