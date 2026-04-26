import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api, getToken } from "../api.js";
import messageSoundUrl from "../../Message.wav";
import { createNotificationSound, playNotificationSoundSafe } from "../notificationSound.js";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4001").replace(/\/$/, "");

// Renk palette (contact id → sabit rəng)
const PALETTE = ["#9eacbe","#f3497b","#4b6fff","#6a98f2","#6d31f3","#6c7cff","#ff7b52","#41b8ff","#ff6457","#9f6630","#5f7cff","#d56cff","#f9b233","#5e7683"];
function colorFor(id) {
  let h = 0;
  for (const c of id || "") h = (h * 31 + c.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "indi";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}d`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

function mapConversation(c) {
  const contact = c.contact || {};
  const lastMsg = c.messages?.[0];
  const name = contact.name || contact.email || `#${c.id.slice(-4)}`;
  const initials = (contact.name || contact.email || "?").slice(0, 1).toUpperCase();
  return {
    // backend identifiers
    id: c.id,
    contactId: contact.id,
    // UI fields (same shape as mock)
    name,
    source: c.channel === "chat" ? "Live chat" : (c.channel || "Live chat"),
    preview: lastMsg?.text?.slice(0, 60) || "",
    time: timeAgo(c.updatedAt),
    color: colorFor(contact.id || c.id),
    initials,
    email: contact.email || "",
    phone: contact.phone || "",
    channel: c.channel === "chat" ? "Live chat" : (c.channel || "Live chat"),
    assignee: c.assignee?.name || "Unassigned",
    status: c.status === "OPEN" ? "Open" : c.status === "SOLVED" ? "Solved" : c.status === "PENDING" ? "Closed" : c.status === "BOT" ? "Bot" : c.status === "PENDING_HUMAN" ? "Needs human" : "Pending",
    // Visitor info (RightPanel üçün)
    country: contact.country,
    countryName: contact.countryName,
    city: contact.city,
    region: contact.region,
    timezone: contact.timezone,
    ip: contact.ip,
    browser: contact.browser,
    os: contact.os,
    device: contact.device,
    language: contact.language,
    currentUrl: contact.currentUrl,
    referrer: contact.referrer,
    // meta
    updatedAt: c.updatedAt,
    _raw: c,
  };
}

function mapMessage(m) {
  return {
    id: m.id,
    sender: m.from === "VISITOR" ? "customer" : m.from === "AGENT" ? "agent" : m.from === "BOT" ? "bot" : "system",
    author: m.author?.name || (m.from === "VISITOR" ? "Customer" : m.from === "BOT" ? "Bot" : m.from === "SYSTEM" ? "System" : "Agent"),
    text: m.text,
    createdAt: m.createdAt,
    attachments: m.attachments,
  };
}

export function useInbox(isAuthenticated) {
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [typingByConversation, setTypingByConversation] = useState({});
  const [visitorPages, setVisitorPages] = useState({}); // contactId -> { page, at }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedConvos, setLoadedConvos] = useState({}); // which conversation details are loaded
  const loadedConvosRef = useRef({});
  const socketRef = useRef(null);
  const soundRef = useRef(null);
  const typingTimeoutsRef = useRef({});
  const outgoingTypingRef = useRef({});

  useEffect(() => {
    soundRef.current = createNotificationSound(messageSoundUrl);
  }, []);

  const convosRef = useRef([]);

  useEffect(() => { convosRef.current = conversations; }, [conversations]);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      const list = await api.listConversations();
      const mapped = list.map(mapConversation);
      setConversations(mapped);
      // İlk mesajı hər söhbət üçün tap (preview üçün)
      const msgMap = {};
      list.forEach((c) => {
        if (c.messages?.length) msgMap[c.id] = c.messages.map(mapMessage);
      });
      setMessagesByConversation((prev) => ({ ...msgMap, ...prev }));
    } catch (err) {
      setError(err.message || "Inbox yüklənmədi");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadConversationDetails = useCallback(async (conversationId) => {
    if (loadedConvosRef.current[conversationId]) return;
    try {
      const c = await api.getConversation(conversationId);
      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: c.messages.map(mapMessage) }));
      setLoadedConvos((prev) => ({ ...prev, [conversationId]: true }));
      loadedConvosRef.current[conversationId] = true;
    } catch (err) {
      console.warn("loadConversationDetails failed", err);
    }
  }, [loadedConvos]);

  // Socket
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getToken();
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // bütün mövcud site-lara join ol (me endpoint-dən sites gəlir)
      api.me().then(({ sites }) => {
        (sites || []).forEach((s) => socket.emit("join-site", s.id));
      }).catch(() => {});
    });

    socket.on("conversation:message", ({ conversationId, message, contact }) => {
      console.log("[socket] conversation:message", { id: message.id, from: message.from, text: message.text?.slice(0, 20) });
      const mapped = mapMessage(message);
      const prefs = (() => {
        try { return JSON.parse(localStorage.getItem("chatbot_notifications") || "{}"); }
        catch { return {}; }
      })();
      // Brauzer bildirişi (yalnız visitor-dan gələn mesajlar)
      if (message.from === "VISITOR" && typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          if (prefs.newMessage?.web !== false) {
            new Notification(`Yeni mesaj: ${contact?.name || contact?.email || "Ziyarətçi"}`, {
              body: message.text?.slice(0, 100) || "",
              tag: conversationId,
            });
          }
        } catch {}
      }
      if (message.from === "VISITOR" && prefs.newMessage?.web !== false) {
        playNotificationSoundSafe(soundRef.current);
      }
      setMessagesByConversation((prev) => {
        const cur = prev[conversationId] || [];
        if (cur.some((m) => m.id === mapped.id)) return prev;
        return { ...prev, [conversationId]: [...cur, mapped] };
      });
      // Update conversation preview/time
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === conversationId);
        if (existing) {
          return [
            { ...existing, preview: message.text?.slice(0, 60) || existing.preview, time: "indi", updatedAt: new Date().toISOString() },
            ...prev.filter((c) => c.id !== conversationId),
          ];
        }
        // Yeni söhbət — reload et
        loadConversations();
        return prev;
      });
    });

    socket.on("conversation:needs-human", () => {
      // Status yenilənməsi üçün reload
      loadConversations();
    });

    socket.on("visitor:session", ({ contact, currentUrl }) => {
      loadConversations();
      const prefs = (() => {
        try { return JSON.parse(localStorage.getItem("chatbot_notifications") || "{}"); }
        catch { return {}; }
      })();
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          if (prefs.newVisitor?.web !== false) {
            new Notification(`Yeni ziyarətçi: ${contact?.name || contact?.email || "Anonim"}`, {
              body: currentUrl || "Sayta daxil oldu",
              tag: `visitor:${contact?.id || "session"}`,
            });
          }
        } catch {}
      }
      if (prefs.newVisitor?.web !== false) {
        playNotificationSoundSafe(soundRef.current);
      }
    });

    socket.on("conversation:updated", (updated) => {
      setConversations((prev) => prev.map((c) => c.id === updated.id ? { ...c, status: updated.status === "OPEN" ? "Open" : updated.status === "SOLVED" ? "Solved" : updated.status === "PENDING" ? "Closed" : updated.status === "BOT" ? "Bot" : updated.status === "PENDING_HUMAN" ? "Needs human" : "Pending", assignee: updated.assignee?.name || c.assignee } : c));
    });

    socket.on("typing", ({ conversationId, typing, authorName }) => {
      if (!conversationId) return;
      const timer = typingTimeoutsRef.current[conversationId];
      if (timer) {
        clearTimeout(timer);
        delete typingTimeoutsRef.current[conversationId];
      }
      if (!typing) {
        setTypingByConversation((prev) => {
          if (!prev[conversationId]) return prev;
          const next = { ...prev };
          delete next[conversationId];
          return next;
        });
        return;
      }
      const label = `${String(authorName || "Visitor").trim() || "Visitor"} writing...`;
      setTypingByConversation((prev) => ({ ...prev, [conversationId]: label }));
      typingTimeoutsRef.current[conversationId] = setTimeout(() => {
        setTypingByConversation((prev) => {
          if (!prev[conversationId]) return prev;
          const next = { ...prev };
          delete next[conversationId];
          return next;
        });
        delete typingTimeoutsRef.current[conversationId];
      }, 2000);
    });

    socket.on("visitor:page-update", ({ contactId, page, at }) => {
      setVisitorPages((prev) => ({ ...prev, [contactId]: { page, at } }));
      // Also update the conversation's currentUrl
      setConversations((prev) => prev.map((c) => {
        if (c.contactId === contactId) {
          return { ...c, currentUrl: page };
        }
        return c;
      }));
    });

    return () => {
      Object.values(typingTimeoutsRef.current).forEach((timer) => clearTimeout(timer));
      typingTimeoutsRef.current = {};
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, loadConversations]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const sendAgentMessage = useCallback(async (conversationId, text, files, deliveryMode = "chat") => {
    const trimmed = (text || "").trim();
    const hasFiles = files && files.length > 0;
    if (!trimmed && !hasFiles) return;
    const tmpId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tmpId,
      sender: "agent",
      author: "You",
      text: trimmed,
      attachments: hasFiles ? files.map((f) => ({ name: f.name, size: f.size, type: f.type })) : null,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessagesByConversation((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), optimistic] }));
    try {
      let attachments = null;
      if (hasFiles) {
        attachments = await api.upload(files);
      }
      const real = await api.sendMessage(conversationId, { text: trimmed, attachments, deliveryMode });
      console.log("[api] sendMessage returned", { id: real.id, text: real.text?.slice(0, 20) });
      const mapped = mapMessage(real);
      setMessagesByConversation((prev) => {
        const cur = prev[conversationId] || [];
        // Socket artıq real mesajı əlavə etmişsə, sadəcə optimistic-i sil
        if (cur.some((m) => m.id === mapped.id)) {
          return { ...prev, [conversationId]: cur.filter((m) => m.id !== tmpId) };
        }
        return { ...prev, [conversationId]: cur.map((m) => m.id === tmpId ? mapped : m) };
      });
      setConversations((prev) => prev.map((c) => c.id === conversationId ? { ...c, preview: (real.text || "📎 Attachment").slice(0, 60), time: "indi" } : c));
    } catch (err) {
      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: (prev[conversationId] || []).map((m) => m.id === tmpId ? { ...m, _failed: true } : m) }));
    }
  }, []);

  const updateConversationStatus = useCallback(async (conversationId, status) => {
    try {
      await api.updateConversation(conversationId, { status });
      loadConversations();
    } catch {}
  }, [loadConversations]);

  const updateConversationAssignee = useCallback(async (conversationId, assigneeId) => {
    try {
      await api.updateConversation(conversationId, { assigneeId });
      loadConversations();
    } catch {}
  }, [loadConversations]);

  const sendTyping = useCallback((conversationId, siteId, typing, authorName) => {
    if (!conversationId) return;
    const nextTyping = Boolean(typing);
    if (outgoingTypingRef.current[conversationId] === nextTyping) return;
    outgoingTypingRef.current[conversationId] = nextTyping;
    socketRef.current?.emit("typing", {
      conversationId,
      siteId,
      typing: nextTyping,
      authorName,
    });
  }, []);

  return {
    conversations,
    messagesByConversation,
    typingByConversation,
    visitorPages,
    loading,
    error,
    loadConversationDetails,
    sendAgentMessage,
    sendTyping,
    updateConversationStatus,
    updateConversationAssignee,
    reload: loadConversations,
  };
}
