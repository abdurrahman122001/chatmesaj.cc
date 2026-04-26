import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import starsIcon from "../../stars.svg";
import chatShowIcon from "../../chat_show.svg";
import messageSoundUrl from "../../Message.wav";
import { loadQuickActions, subscribeQuickActions, buildWhatsAppUrl, buildEmailUrl, buildTelegramUrl, buildFacebookUrl, buildInstagramUrl } from "../quickActions.js";
import { createNotificationSound, playNotificationSoundSafe } from "../notificationSound.js";

const BRAND = "#059669";
const BRAND_DARK = "#047857";
const BRAND_SOFT = "#ecfdf5";

const DEFAULT_API_URL = import.meta.env.VITE_WIDGET_API_URL || import.meta.env.VITE_API_URL || "http://localhost:4001";
const DEFAULT_API_KEY = import.meta.env.VITE_WIDGET_API_KEY || "";
const TOKEN_STORAGE_KEY = (apiKey) => `chatbot_visitor_${apiKey || "default"}`;

const Icon = {
  chatDots: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-5 3V8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/>
    </svg>
  ),
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  more: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/></svg>,
  whatsapp: (<svg width="14" height="14" viewBox="0 0 16 16" fill="#059669"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>),
  email: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke={BRAND} strokeWidth="1.7"/><path d="m3 7 9 6 9-6" stroke={BRAND} strokeWidth="1.7"/></svg>,
  telegram: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#229ED9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="m22 2-11 11"/></svg>,
  facebook: <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  instagram: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#e1306c" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="#e1306c" strokeWidth="1.7"/><circle cx="17.5" cy="6.5" r="1" fill="#e1306c"/></svg>,
  paperclip: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m21 12-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  smile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#94a3b8" strokeWidth="1.6"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m4 12 16-8-6 18-3-7-7-3Z" fill="white" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  ticket: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9Z"/>
      <path d="M9 7v10" strokeDasharray="1.5 2.5"/>
    </svg>
  ),
};

const I18N = {
  AZ: {
    defaultTitle: "Dəstək",
    defaultSubtitle: "Sizə necə kömək edə bilərik?",
    newTicket: "Yeni Ticket",
    ticketContactRequired: "Ticket üçün əlaqə məlumatlarınız tələb olunur",
    namePlaceholder: "Ad Soyad *",
    emailPlaceholder: "Email *",
    phonePlaceholder: "Telefon *",
    subject: "Mövzu *",
    subjectPlaceholder: "Problemin qısa təsviri",
    description: "Ətraflı təsvir",
    descriptionPlaceholder: "Problemi ətraflı izah edin...",
    sendTicket: "Ticket göndər",
    sending: "Göndərilir...",
    send: "Göndər",
    chatEnded: "Söhbət bağlandı",
    rateUs: "Xidmətimizi qiymətləndirin",
    feedbackPlaceholder: "Rəyinizi yazın (isteğe bağlı)",
    rate: "Qiymətləndir",
    skip: "Keç →",
    subscribeTitle: "Yeniliklərə abunə olun",
    subscribeSubtitle: "Kampaniya və yeniliklərdən xəbərdar olun",
    emailAddress: "E-poçt ünvanınız",
    subscribe: "Abunə ol",
    thanks: "Təşəkkürlər!",
    thanksFeedback: "Rəyiniz üçün minnətdarıq",
    newChat: "Yeni söhbət başlat",
    createTicket: "Ticket yarat",
    endChat: "✕ Söhbəti bitir",
    apiKeyMissing: "Widget API key konfiqurasiya edilməyib.",
    connecting: "Qoşulur...",
    helloGreeting: "Salam! Sizə necə kömək edə bilərəm?",
    quickActions: "Quick Actions",
    didntHelp: "Bu kömək etmədi → operator",
    contactFirst: "Mesaj göndərmək üçün əvvəlcə yuxarıdakı formu doldurun.",
    contactFirstPlaceholder: "Əvvəlcə əlaqə məlumatlarınızı daxil edin ↑",
    closedByAdmin: "Dəstək bu çatı bağladı. Davam etmək üçün yeni chat başladın.",
    startNewChat: "Yeni chat başlat",
    messagePlaceholder: "Mesajınızı yazın...",
    failedSend: "Göndərilə bilmədi",
    error: "Xəta",
    phoneHint: "Telefon (+48...)",
    ticket: "Ticket",
  },
  EN: {
    defaultTitle: "Support",
    defaultSubtitle: "How can we help?",
    newTicket: "New Ticket",
    ticketContactRequired: "Contact info is required for a ticket",
    namePlaceholder: "Full name *",
    emailPlaceholder: "Email *",
    phonePlaceholder: "Phone *",
    subject: "Subject *",
    subjectPlaceholder: "Brief description of the issue",
    description: "Details",
    descriptionPlaceholder: "Describe the issue in detail...",
    sendTicket: "Send ticket",
    sending: "Sending...",
    send: "Send",
    chatEnded: "Chat ended",
    rateUs: "Rate our service",
    feedbackPlaceholder: "Leave your feedback (optional)",
    rate: "Rate",
    skip: "Skip →",
    subscribeTitle: "Subscribe to updates",
    subscribeSubtitle: "Stay informed about campaigns and news",
    emailAddress: "Your email address",
    subscribe: "Subscribe",
    thanks: "Thank you!",
    thanksFeedback: "We appreciate your feedback",
    newChat: "Start new chat",
    createTicket: "Create ticket",
    endChat: "✕ End chat",
    apiKeyMissing: "Widget API key is not configured.",
    connecting: "Connecting...",
    helloGreeting: "Hi! How can I help you?",
    quickActions: "Quick Actions",
    didntHelp: "That didn't help → human",
    contactFirst: "Please fill out the form above first to send a message.",
    contactFirstPlaceholder: "Please enter your contact info first ↑",
    closedByAdmin: "Support closed this chat. Start a new chat to continue.",
    startNewChat: "Start new chat",
    messagePlaceholder: "Type your message...",
    failedSend: "Failed to send",
    error: "Error",
    phoneHint: "Phone (+48...)",
    ticket: "Ticket",
  },
  TR: {
    defaultTitle: "Destek",
    defaultSubtitle: "Size nasıl yardımcı olabiliriz?",
    newTicket: "Yeni Bilet",
    ticketContactRequired: "Bilet için iletişim bilgileriniz gereklidir",
    namePlaceholder: "Ad Soyad *",
    emailPlaceholder: "E-posta *",
    phonePlaceholder: "Telefon *",
    subject: "Konu *",
    subjectPlaceholder: "Sorunun kısa açıklaması",
    description: "Ayrıntılı açıklama",
    descriptionPlaceholder: "Sorunu detaylı açıklayın...",
    sendTicket: "Bilet gönder",
    sending: "Gönderiliyor...",
    send: "Gönder",
    chatEnded: "Sohbet sona erdi",
    rateUs: "Hizmetimizi değerlendirin",
    feedbackPlaceholder: "Görüşünüzü yazın (isteğe bağlı)",
    rate: "Değerlendir",
    skip: "Atla →",
    subscribeTitle: "Yeniliklere abone olun",
    subscribeSubtitle: "Kampanya ve yeniliklerden haberdar olun",
    emailAddress: "E-posta adresiniz",
    subscribe: "Abone ol",
    thanks: "Teşekkürler!",
    thanksFeedback: "Geri bildiriminiz için teşekkür ederiz",
    newChat: "Yeni sohbet başlat",
    createTicket: "Bilet oluştur",
    endChat: "✕ Sohbeti bitir",
    apiKeyMissing: "Widget API anahtarı yapılandırılmamış.",
    connecting: "Bağlanıyor...",
    helloGreeting: "Merhaba! Size nasıl yardımcı olabilirim?",
    quickActions: "Hızlı Eylemler",
    didntHelp: "Yardımcı olmadı → temsilci",
    contactFirst: "Mesaj göndermek için önce yukarıdaki formu doldurun.",
    contactFirstPlaceholder: "Önce iletişim bilgilerinizi girin ↑",
    closedByAdmin: "Destek bu sohbeti kapattı. Devam etmek için yeni bir sohbet başlatın.",
    startNewChat: "Yeni sohbet başlat",
    messagePlaceholder: "Mesajınızı yazın...",
    failedSend: "Gönderilemedi",
    error: "Hata",
    phoneHint: "Telefon (+48...)",
    ticket: "Bilet",
  },
  RU: {
    defaultTitle: "Поддержка",
    defaultSubtitle: "Чем мы можем помочь?",
    newTicket: "Новый тикет",
    ticketContactRequired: "Для тикета нужны ваши контактные данные",
    namePlaceholder: "Имя и фамилия *",
    emailPlaceholder: "Email *",
    phonePlaceholder: "Телефон *",
    subject: "Тема *",
    subjectPlaceholder: "Краткое описание проблемы",
    description: "Подробнее",
    descriptionPlaceholder: "Опишите проблему подробно...",
    sendTicket: "Отправить тикет",
    sending: "Отправка...",
    send: "Отправить",
    chatEnded: "Чат завершён",
    rateUs: "Оцените наш сервис",
    feedbackPlaceholder: "Оставьте отзыв (необязательно)",
    rate: "Оценить",
    skip: "Пропустить →",
    subscribeTitle: "Подпишитесь на обновления",
    subscribeSubtitle: "Будьте в курсе акций и новостей",
    emailAddress: "Ваш email",
    subscribe: "Подписаться",
    thanks: "Спасибо!",
    thanksFeedback: "Благодарим за отзыв",
    newChat: "Начать новый чат",
    createTicket: "Создать тикет",
    endChat: "✕ Завершить чат",
    apiKeyMissing: "API-ключ виджета не настроен.",
    connecting: "Подключение...",
    helloGreeting: "Здравствуйте! Чем я могу помочь?",
    quickActions: "Быстрые действия",
    didntHelp: "Не помогло → оператор",
    contactFirst: "Чтобы отправить сообщение, сначала заполните форму выше.",
    contactFirstPlaceholder: "Сначала введите ваши контактные данные ↑",
    closedByAdmin: "Поддержка закрыла этот чат. Чтобы продолжить, начните новый чат.",
    startNewChat: "Начать новый чат",
    messagePlaceholder: "Введите сообщение...",
    failedSend: "Не удалось отправить",
    error: "Ошибка",
    phoneHint: "Телефон (+48...)",
    ticket: "Тикет",
  },
};
function tFn(lang) {
  const dict = I18N[lang] || I18N.AZ;
  return (key) => dict[key] ?? I18N.AZ[key] ?? key;
}

function initialsOf(name) {
  if (!name) return "LK";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "LK";
}

function Avatar({ avatarUrl, name }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name || "Agent"} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/60" />;
  }
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[14px] font-semibold text-[#047857] ring-2 ring-white/60">{initialsOf(name)}</div>;
}

function ContactForm({ apiUrl, apiKey, visitorToken, brandColor, onDone, lang = "AZ" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const t = tFn(lang);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) { setError(lang === "EN" ? "Please fill out all fields" : "Zəhmət olmasa bütün sahələri doldurun"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${apiUrl}/api/widget/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, visitorToken, name, email, phone }),
      });
      if (!res.ok) throw new Error(t("failedSend"));
      onDone?.({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    } catch (err) {
      setError(err.message || t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-[280px] space-y-2 rounded-[12px] border border-[#e2e8f0] bg-white p-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder").replace(" *", "")} className="w-full rounded-[8px] border border-[#e2e8f0] px-2.5 py-1.5 text-[12px] focus:border-[#94a3b8] focus:outline-none" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-[8px] border border-[#e2e8f0] px-2.5 py-1.5 text-[12px] focus:border-[#94a3b8] focus:outline-none" />
      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))} placeholder={t("phoneHint")} className="w-full rounded-[8px] border border-[#e2e8f0] px-2.5 py-1.5 text-[12px] focus:border-[#94a3b8] focus:outline-none" />
      {error && <div className="text-[11px] text-[#dc2626]">{error}</div>}
      <button type="submit" disabled={submitting} className="w-full rounded-[8px] py-1.5 text-[12px] font-medium text-white disabled:opacity-50" style={{ background: brandColor }}>
        {submitting ? t("sending") : t("send")}
      </button>
    </form>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ChatWidget({ apiUrl = DEFAULT_API_URL, apiKey = DEFAULT_API_KEY, title: titleProp, subtitle: subtitleProp }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [quickActions, setQuickActions] = useState(() => loadQuickActions());
  const [attachments, setAttachments] = useState([]);
  const [contactSubmitted, setContactSubmitted] = useState(() => localStorage.getItem(`chatbot_contact_done_${apiKey}`) === "1");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [session, setSession] = useState(null); // { visitorToken, conversationId, siteId }
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSending, setTicketSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [chatClosedByAdmin, setChatClosedByAdmin] = useState(false);
  const [endedConvoId, setEndedConvoId] = useState(null);
  const [ratingStep, setRatingStep] = useState(0); // 0=none, 1=rate, 2=subscribe, 3=done
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [typingLabel, setTypingLabel] = useState("");
  const [appearance, setAppearance] = useState({
    brandColor: BRAND, brandColorDark: BRAND_DARK,
    title: titleProp || "Dəstək",
    subtitle: subtitleProp || "Sizə necə kömək edə bilərik?",
    header: "",
    message: "",
    language: "AZ",
  });
  const [agent, setAgent] = useState({ name: "", avatarUrl: null });
  const [currentPage, setCurrentPage] = useState(window.location.href);
  const t = tFn(appearance.language);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const soundRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const localTypingRef = useRef(null);

  // Track page changes
  useEffect(() => {
    const handlePageChange = () => {
      const newUrl = window.location.href;
      if (newUrl !== currentPage) {
        setCurrentPage(newUrl);
        // Send page update to backend if session exists
        if (session?.visitorToken && session?.siteId) {
          sendPageUpdate(newUrl);
        }
      }
    };

    // Listen for URL changes
    window.addEventListener('popstate', handlePageChange);
    
    // Also check periodically for SPA navigation
    const interval = setInterval(() => {
      handlePageChange();
    }, 2000);

    return () => {
      window.removeEventListener('popstate', handlePageChange);
      clearInterval(interval);
    };
  }, [currentPage, session]);

  const sendPageUpdate = async (url) => {
    try {
      await fetch(`${apiUrl}/api/widget/page-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          visitorToken: session.visitorToken,
          siteId: session.siteId,
          page: url
        })
      });
    } catch (err) {
      console.error('Failed to send page update:', err);
    }
  };

  useEffect(() => {
    soundRef.current = createNotificationSound(messageSoundUrl);
  }, []);

  useEffect(() => subscribeQuickActions(setQuickActions), []);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Widget config (appearance) yüklə
  useEffect(() => {
    if (!apiKey) return;
    fetch(`${apiUrl}/api/widget/config?apiKey=${encodeURIComponent(apiKey)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((cfg) => {
        if (!cfg) return;
        setAppearance((prev) => ({
          brandColor: cfg.appearance?.brandColor || prev.brandColor,
          brandColorDark: cfg.appearance?.brandColorDark || prev.brandColorDark,
          title: titleProp || cfg.appearance?.title || prev.title,
          subtitle: subtitleProp || cfg.appearance?.subtitle || prev.subtitle,
          header: cfg.appearance?.header || prev.header,
          message: cfg.appearance?.message || prev.message,
          language: cfg.appearance?.language || prev.language,
        }));
        if (cfg.agent) setAgent({ name: cfg.agent.name || "", avatarUrl: cfg.agent.avatarUrl || null });
        if (cfg.quickActions) setQuickActions(cfg.quickActions);
      })
      .catch(() => {});
  }, [apiKey, apiUrl]);

  useEffect(() => {
    if (!emojiOpen) return;
    function onDown(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [emojiOpen]);

  // Session başlat — widget ilk açıldıqda
  useEffect(() => {
    if (!open || session || connecting || !apiKey) return;
    startSession();
  }, [open, apiKey, session, connecting]);

  // Mesajlar dəyişəndə aşağı scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startSession() {
    if (!apiKey) {
      setConnectError("Widget API key təyin edilməyib");
      return;
    }
    setConnecting(true);
    setConnectError("");
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY(apiKey));
      const body = {
        apiKey,
        visitorToken: stored || undefined,
        currentUrl: window.location.href,
        referrer: document.referrer || null,
        language: navigator.language,
        metadata: {
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        },
      };
      const res = await fetch(`${apiUrl}/api/widget/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Session failed: ${res.status}`);
      const data = await res.json();
      localStorage.setItem(TOKEN_STORAGE_KEY(apiKey), data.visitorToken);
      const ci = data.contact || {};
      setContactInfo({ name: ci.name || "", email: ci.email || "", phone: ci.phone || "" });
      if (ci.name && ci.email && ci.phone) {
        setContactSubmitted(true);
        localStorage.setItem(`chatbot_contact_done_${apiKey}`, "1");
      }
      setSession({
        visitorToken: data.visitorToken,
        conversationId: data.conversation.id,
        siteId: data.siteId || data.conversation.siteId,
      });
      setChatClosedByAdmin(false);
      // Əvvəlki mesajları göstər
      setMessages(data.messages.map(mapMessage));
      // Socket qoşul
      connectSocket(data);
    } catch (err) {
      setConnectError(err.message || "Serverə qoşula bilmədi");
    } finally {
      setConnecting(false);
    }
  }

  function emitTyping(typing) {
    if (!socketRef.current || !session?.conversationId) return;
    const nextTyping = Boolean(typing);
    if (localTypingRef.current === nextTyping) return;
    localTypingRef.current = nextTyping;
    socketRef.current.emit("typing", {
      conversationId: session.conversationId,
      siteId: session.siteId,
      typing: nextTyping,
      authorName: (contactInfo.name || "Visitor").trim() || "Visitor",
    });
  }

  function connectSocket(data) {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(apiUrl, {
      auth: {
        apiKey,
        siteId: data.siteId || data.conversation?.siteId,
        conversationId: data.conversation.id,
      },
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      console.log("[widget] socket connected, conversationId=", data.conversation.id);
      socket.emit("join-conversation", data.conversation.id);
    });
    socket.on("connect_error", (err) => console.warn("[widget] socket connect_error:", err.message));
    socket.on("disconnect", (reason) => console.log("[widget] socket disconnect:", reason));
    socket.on("message", (m) => {
      console.log("[widget] received message:", m);
      // Yalnız agent / bot / system mesajlarını əlavə et (öz VISITOR mesajımız artıq optimistic əlavə olunub)
      if (m.from === "VISITOR") return;
      playNotificationSoundSafe(soundRef.current);
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [...prev, mapMessage(m)];
      });
    });
    socket.on("typing", ({ typing, authorName }) => {
      if (!typing) {
        setTypingLabel("");
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        return;
      }
      setTypingLabel(`${String(authorName || "Agent").trim() || "Agent"} writing...`);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingLabel("");
        typingTimeoutRef.current = null;
      }, 2000);
    });
    socket.on("conversation:updated", (updated) => {
      if (updated?.status === "PENDING") {
        setChatClosedByAdmin(true);
        setMenuOpen(false);
      } else if (updated?.status === "OPEN") {
        setChatClosedByAdmin(false);
      }
    });
    socketRef.current = socket;
  }

  useEffect(() => {
    return () => {
      emitTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  function mapMessage(m) {
    const from = {
      VISITOR: "user",
      AGENT: "agent",
      BOT: "bot",
      SYSTEM: "system",
    }[m.from] || "bot";
    return {
      id: m.id,
      from,
      text: m.text,
      attachments: m.attachments || null,
      createdAt: m.createdAt,
    };
  }

  const links = {
    whatsapp: buildWhatsAppUrl(quickActions.whatsapp),
    email: buildEmailUrl(quickActions.email),
    telegram: buildTelegramUrl(quickActions.telegram),
    facebook: buildFacebookUrl(quickActions.facebook),
    instagram: buildInstagramUrl(quickActions.instagram),
  };

  function openLink(url) {
    if (!url) return;
    if (url.startsWith("mailto:")) window.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleFilePick(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size, type: f.type, _file: f }))]);
    e.target.value = "";
  }

  function removeAttachment(i) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  const needContact = !contactInfo.name || !contactInfo.email || !contactInfo.phone;
  async function submitTicket(e) {
    e.preventDefault();
    if (!ticketSubject.trim() || !session) return;
    if (!contactInfo.name?.trim() || !contactInfo.email?.trim() || !contactInfo.phone?.trim()) return;
    setTicketSending(true);
    try {
      if (needContact) {
        await fetch(`${apiUrl}/api/widget/identify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, visitorToken: session.visitorToken, name: contactInfo.name, email: contactInfo.email, phone: contactInfo.phone }) });
        setContactSubmitted(true);
        localStorage.setItem(`chatbot_contact_done_${apiKey}`, "1");
      }
      await fetch(`${apiUrl}/api/widget/ticket`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, visitorToken: session.visitorToken, subject: ticketSubject.trim(), description: ticketDesc.trim() }) });
      setTicketSubject(""); setTicketDesc(""); setTicketOpen(false);
    } catch {}
    setTicketSending(false);
  }

  const H = { "Content-Type": "application/json" };
  async function endChat() { if (!session) return; emitTyping(false); try { const r = await fetch(`${apiUrl}/api/widget/end-chat`, { method:"POST", headers:H, body:JSON.stringify({apiKey,visitorToken:session.visitorToken}) }); const d = await r.json(); setChatEnded(true); setEndedConvoId(d.conversationId||session.conversationId); setRatingStep(1); setMenuOpen(false); } catch{} }
  async function submitRating() { if(!session||!selectedRating) return; try { await fetch(`${apiUrl}/api/widget/rate`, { method:"POST", headers:H, body:JSON.stringify({apiKey,visitorToken:session.visitorToken,conversationId:endedConvoId,rating:selectedRating,comment:ratingComment}) }); setRatingStep(2); } catch{} }
  async function submitSubscribe(e) { e.preventDefault(); if(!subEmail.trim()) return; try { await fetch(`${apiUrl}/api/widget/subscribe`, { method:"POST", headers:H, body:JSON.stringify({apiKey,email:subEmail,name:contactInfo.name||null}) }); setSubDone(true); setRatingStep(3); } catch{} }
  function startNewChat() { emitTyping(false); setTypingLabel(""); setChatEnded(false); setChatClosedByAdmin(false); setRatingStep(0); setSelectedRating(0); setRatingComment(""); setSubEmail(""); setSubDone(false); setSession(null); setMessages([]); }

  const EMOJIS = ["😀","😁","😂","🤣","😊","😍","😎","🥳","👍","👏","🙏","🙌","🔥","✨","🎉","💯","❤️","💙","💚","💜","🤔","😉","😅","🙂","😇","🤗","😴","😭","😡","🤝","✅","❌"];
  function insertEmoji(e) {
    setMessage((m) => (m + e).slice(0, 2000));
    textareaRef.current?.focus();
  }

  async function handleSend() {
    const text = message.trim();
    if ((!text && attachments.length === 0) || sending) return;
    const formPending = !contactSubmitted && messages.some((m) => m.from === "system" && m.attachments?.contactForm);
    if (!session || formPending || chatClosedByAdmin) return;
    emitTyping(false);

    // Optimistic
    const optimistic = {
      id: `tmp-${Date.now()}`,
      from: "user",
      text,
      attachments: attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessage("");
    const filesToSend = attachments;
    setAttachments([]);
    setSending(true);

    try {
      // Upload at əvvəlcə
      let uploadedAttachments = null;
      if (filesToSend.length > 0) {
        const fd = new FormData();
        filesToSend.forEach((a) => fd.append("files", a._file));
        const upRes = await fetch(`${apiUrl}/api/uploads`, { method: "POST", body: fd });
        if (upRes.ok) uploadedAttachments = await upRes.json();
      }

      const res = await fetch(`${apiUrl}/api/widget/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          visitorToken: session.visitorToken,
          text,
          attachments: uploadedAttachments,
        }),
      });
      if (!res.ok) {
        let payload = null;
        try { payload = await res.json(); } catch {}
        if (payload?.code === "CHAT_CLOSED") {
          setChatClosedByAdmin(true);
          setAttachments([]);
          setMessage(text);
        }
        throw new Error(payload?.error || t("failedSend"));
      }
      const data = await res.json();
      // Optimistic-i real mesaja çevir
      setMessages((prev) => prev.map((m) => (m._optimistic ? mapMessage(data.message) : m)));
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m._optimistic ? { ...m, _failed: true } : m)));
    } finally {
      setSending(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  async function escalateToHuman() {
    if (!session) return;
    try {
      await fetch(`${apiUrl}/api/widget/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, visitorToken: session.visitorToken }),
      });
    } catch {}
  }

  const showEscalate = messages.some((m) => m.from === "bot");
  const contactFormPending = !contactSubmitted && messages.some((m) => m.from === "system" && m.attachments?.contactForm);
  const inputBlocked = contactFormPending || !session || chatClosedByAdmin;
  const noApiKey = !apiKey;

  const DEFAULT_TITLES = new Set(["Dəstək", "Destek", "Support", ""]);
  const DEFAULT_SUBTITLES = new Set(["Sizə necə kömək edə bilərik?", "Size nece komek ede bilerik?", "How can we help?", "How can we help you?", ""]);
  const displayTitle = DEFAULT_TITLES.has((appearance.title || "").trim())
    ? (agent.name || t("defaultTitle"))
    : appearance.title;
  const displaySubtitle = DEFAULT_SUBTITLES.has((appearance.subtitle || "").trim())
    ? t("defaultSubtitle")
    : appearance.subtitle;
  const greetingHeader = (appearance.header || "").trim();
  const greetingMessage = (appearance.message || "").trim();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="pointer-events-auto relative flex h-[600px] w-[340px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.25)] ring-1 ring-black/5">
          {ticketOpen && (
            <div className="absolute inset-0 z-30 flex flex-col bg-white rounded-[18px]">
              <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-3">
                <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#111827]">{Icon.ticket} {t("newTicket")}</span>
                <button onClick={() => setTicketOpen(false)} className="text-[#94a3b8] hover:text-[#334155]">✕</button>
              </div>
              <form onSubmit={submitTicket} className="flex-1 space-y-3 overflow-y-auto p-4">
                {needContact && (
                  <div className="space-y-2 rounded-[10px] border border-[#fde68a] bg-[#fefce8] p-3">
                    <div className="text-[11px] font-medium text-[#92400e]">{t("ticketContactRequired")}</div>
                    <input value={contactInfo.name} onChange={(e) => setContactInfo((p) => ({ ...p, name: e.target.value }))} placeholder={t("namePlaceholder")} required className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                    <input type="email" value={contactInfo.email} onChange={(e) => setContactInfo((p) => ({ ...p, email: e.target.value }))} placeholder={t("emailPlaceholder")} required className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                    <input type="tel" value={contactInfo.phone} onChange={(e) => setContactInfo((p) => ({ ...p, phone: e.target.value.replace(/[^0-9+]/g, '') }))} placeholder={t("phonePlaceholder")} required className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                  </div>
                )}
                <div><label className="mb-1 block text-[12px] text-[#64748b]">{t("subject")}</label><input value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" placeholder={t("subjectPlaceholder")} required /></div>
                <div><label className="mb-1 block text-[12px] text-[#64748b]">{t("description")}</label><textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} className="w-full resize-none rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" rows={3} placeholder={t("descriptionPlaceholder")} /></div>
                <button type="submit" disabled={ticketSending || !ticketSubject.trim()} className="w-full rounded-[10px] bg-[#2563eb] py-2.5 text-[13px] font-medium text-white disabled:opacity-50">{ticketSending ? t("sending") : t("sendTicket")}</button>
              </form>
            </div>
          )}
          {chatEnded && ratingStep > 0 && ratingStep < 3 && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white rounded-[18px] p-6 text-center">
              {ratingStep === 1 && (<>
                <div className="text-[40px] mb-2">💬</div>
                <div className="text-[15px] font-semibold text-[#111827] mb-1">{t("chatEnded")}</div>
                <div className="text-[12px] text-[#64748b] mb-5">{t("rateUs")}</div>
                <div className="flex gap-3 mb-4">{[1,2,3,4,5].map(v=>{const faces=["😞","🙁","😐","😊","😁"];return(<button key={v} type="button" onClick={()=>setSelectedRating(v)} className={`flex h-12 w-12 items-center justify-center rounded-full text-[24px] transition ${selectedRating===v?"ring-2 ring-[#059669] bg-[#ecfdf5]":"bg-[#f4f6f9] hover:bg-[#e8ebf0]"}`}>{faces[v-1]}</button>)})}</div>
                <textarea value={ratingComment} onChange={e=>setRatingComment(e.target.value)} placeholder={t("feedbackPlaceholder")} className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none resize-none mb-4" rows={2} />
                <button onClick={submitRating} disabled={!selectedRating} className="w-full rounded-[10px] bg-[#059669] py-2.5 text-[13px] font-medium text-white disabled:opacity-40">{t("rate")}</button>
                <button onClick={()=>setRatingStep(2)} className="mt-2 text-[12px] text-[#94a3b8] hover:text-[#334155]">{t("skip")}</button>
              </>)}
              {ratingStep === 2 && (<>
                <div className="text-[40px] mb-2">📧</div>
                <div className="text-[15px] font-semibold text-[#111827] mb-1">{t("subscribeTitle")}</div>
                <div className="text-[12px] text-[#64748b] mb-5">{t("subscribeSubtitle")}</div>
                <form onSubmit={submitSubscribe} className="w-full space-y-3">
                  <input type="email" value={subEmail} onChange={e=>setSubEmail(e.target.value)} placeholder={t("emailAddress")} required className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-2 text-[13px] outline-none" />
                  <button type="submit" className="w-full rounded-[10px] bg-[#2563eb] py-2.5 text-[13px] font-medium text-white">{t("subscribe")}</button>
                </form>
                <button onClick={()=>setRatingStep(3)} className="mt-2 text-[12px] text-[#94a3b8] hover:text-[#334155]">{t("skip")}</button>
              </>)}
            </div>
          )}
          {chatEnded && ratingStep === 3 && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white rounded-[18px] p-6 text-center">
              <div className="text-[48px] mb-3">✅</div>
              <div className="text-[15px] font-semibold text-[#111827] mb-1">{t("thanks")}</div>
              <div className="text-[12px] text-[#64748b] mb-6">{t("thanksFeedback")}</div>
              <button onClick={startNewChat} className="rounded-[10px] bg-[#059669] px-6 py-2.5 text-[13px] font-medium text-white">{t("newChat")}</button>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-5 text-white" style={{ background: appearance.brandColor }}>
            <Avatar avatarUrl={agent.avatarUrl} name={agent.name || displayTitle} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold leading-[1.2]">{displayTitle}</div>
              <div className="truncate text-[12px] text-white/85 leading-[1.3]">{displaySubtitle}</div>
            </div>
            <div className="relative">
              <button type="button" onClick={() => setMenuOpen((v) => !v)} className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:bg-white/15">{Icon.more}</button>
              {menuOpen && <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-[10px] border border-[#dfe5ee] bg-white p-1 shadow-lg">
                <button type="button" onClick={() => { setMenuOpen(false); setTicketOpen(true); }} className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] text-[#334155] hover:bg-[#f4f6f9]">{Icon.ticket} {t("createTicket")}</button>
                {!chatEnded && <button type="button" onClick={endChat} className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] text-[#dc2626] hover:bg-[#fef2f2]">{t("endChat")}</button>}
              </div>}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ background: "#f8fafc" }}>
            {noApiKey && (
              <div className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-3 text-[12px] text-[#b91c1c]">
                {t("apiKeyMissing")} <code>VITE_WIDGET_API_KEY</code> / <code>apiKey</code>
              </div>
            )}
            {connectError && !noApiKey && (
              <div className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-3 text-[12px] text-[#b91c1c]">{connectError}</div>
            )}
            {connecting && (
              <div className="text-center text-[12px] text-[#94a3b8]">{t("connecting")}</div>
            )}

            {messages.length === 0 && !connecting && !connectError && session && (
              <div className="mx-auto mt-2 max-w-[240px] rounded-[14px] px-4 py-4 text-center text-[13px] font-medium text-white shadow-sm" style={{ background: appearance.brandColor }}>
                <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20">{Icon.chatDots}</div>
                {greetingHeader ? <div className="leading-[1.35]">{greetingHeader}</div> : null}
                <div className={greetingHeader ? "mt-1 text-[12px] leading-[1.45] text-white/90" : "leading-[1.4]"}>{greetingMessage || t("helloGreeting")}</div>
              </div>
            )}

            {(links.whatsapp || links.email || links.telegram || links.facebook || links.instagram) && (
              <div className="rounded-[14px] border p-3" style={{ background: BRAND_SOFT, borderColor: "#d1fae5" }}>
                <div className="mb-2 text-[12px] font-semibold text-[#065f46]">{t("quickActions")}</div>
                <div className="flex flex-wrap gap-2">
                  {links.whatsapp && (
                    <button type="button" onClick={() => openLink(links.whatsapp)} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d1fae5] bg-white px-2.5 py-1.5 text-[12px] text-[#047857] hover:bg-[#f0fdf4]">
                      {Icon.whatsapp} WhatsApp
                    </button>
                  )}
                  {links.email && (
                    <button type="button" onClick={() => openLink(links.email)} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d1fae5] bg-white px-2.5 py-1.5 text-[12px] text-[#047857] hover:bg-[#f0fdf4]">
                      {Icon.email} Email
                    </button>
                  )}
                  {links.telegram && (
                    <button type="button" onClick={() => openLink(links.telegram)} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d1fae5] bg-white px-2.5 py-1.5 text-[12px] text-[#047857] hover:bg-[#f0fdf4]">
                      {Icon.telegram} Telegram
                    </button>
                  )}
                  {links.facebook && (
                    <button type="button" onClick={() => openLink(links.facebook)} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d1fae5] bg-white px-2.5 py-1.5 text-[12px] text-[#047857] hover:bg-[#f0fdf4]">
                      {Icon.facebook} Facebook
                    </button>
                  )}
                  {links.instagram && (
                    <button type="button" onClick={() => openLink(links.instagram)} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d1fae5] bg-white px-2.5 py-1.5 text-[12px] text-[#047857] hover:bg-[#f0fdf4]">
                      {Icon.instagram} Instagram
                    </button>
                  )}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              if (m.from === "user") {
                return (
                  <div key={m.id || i} className="flex justify-end">
                    <div className="max-w-[78%] space-y-1">
                      {m.text && <div className={`rounded-[14px] rounded-br-[4px] px-3 py-2 text-[13px] ${m._failed ? "bg-[#fecaca] text-[#991b1b]" : "bg-[#e0f2fe] text-[#0c4a6e]"}`}>{m.text}</div>}
                      {m.attachments?.map((f, fi) => (
                        <div key={fi} className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#bae6fd] bg-white px-2.5 py-1.5 text-[11px] text-[#0c4a6e]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
                          <span className="max-w-[140px] truncate">{f.name}</span>
                          <span className="text-[10px] text-[#94a3b8]">{formatSize(f.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              if (m.from === "system") {
                const wantsForm = m.attachments?.contactForm;
                return (
                  <div key={m.id || i} className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-[#fef9c3] px-3 py-1 text-[11px] text-[#854d0e]">{m.text}</div>
                    {wantsForm && !contactSubmitted && (
                      <ContactForm
                        apiUrl={apiUrl}
                        apiKey={apiKey}
                        visitorToken={session?.visitorToken}
                        brandColor={appearance.brandColor}
                        lang={appearance.language}
                        onDone={(info) => { setContactSubmitted(true); localStorage.setItem(`chatbot_contact_done_${apiKey}`, "1"); if (info) setContactInfo(info); }}
                      />
                    )}
                  </div>
                );
              }
              const isAgent = m.from === "agent";
              return (
                <div key={m.id || i} className="flex justify-start">
                  <div className="max-w-[82%] space-y-1">
                    <div className={`whitespace-pre-wrap rounded-[14px] rounded-bl-[4px] px-3 py-2 text-[13px] text-white`} style={{ background: isAgent ? appearance.brandColorDark : appearance.brandColor }}>
                      {m.text}
                    </div>
                    {m.from === "bot" && (
                      <button onClick={escalateToHuman} className="text-[11px] text-[#64748b] hover:text-[#0f172a] underline">
                        {t("didntHelp")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {typingLabel && (
              <div className="text-[12px] italic text-[#64748b]">{typingLabel}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="relative border-t border-[#eef2f7] bg-white p-3">
            {contactFormPending && (
              <div className="mb-2 flex items-center gap-2 rounded-[10px] bg-[#fef3c7] px-3 py-2 text-[12px] text-[#92400e]">
                <span>🔒</span>
                <span>{t("contactFirst")}</span>
              </div>
            )}
            {chatClosedByAdmin && (
              <div className="mb-2 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#991b1b]">
                <div>{t("closedByAdmin")}</div>
                <button type="button" onClick={startNewChat} className="mt-2 rounded-[8px] bg-[#dc2626] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#b91c1c]">
                  {t("startNewChat")}
                </button>
              </div>
            )}
            <div className="mb-1 text-right text-[11px] text-[#94a3b8]">{message.length} / 2000</div>
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {attachments.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d1fae5] bg-[#ecfdf5] px-2 py-1 text-[11px] text-[#065f46]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
                    <span className="max-w-[120px] truncate">{f.name}</span>
                    <span className="text-[10px] text-[#94a3b8]">{formatSize(f.size)}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="text-[#94a3b8] hover:text-[#ef4444]" aria-label="Remove">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-start gap-3 rounded-[16px] border border-[#d1fae5] bg-white px-4 py-3 focus-within:border-[#059669]">
              <img src={starsIcon} alt="" className="mt-1 h-6 w-6 shrink-0" />
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  const next = e.target.value.slice(0, 2000);
                  setMessage(next);
                  const shouldType = Boolean(next.trim()) && !inputBlocked;
                  emitTyping(shouldType);
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  if (shouldType) {
                    typingTimeoutRef.current = setTimeout(() => {
                      emitTyping(false);
                      typingTimeoutRef.current = null;
                    }, 1200);
                  }
                }}
                onBlur={() => emitTyping(false)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={inputBlocked || sending}
                placeholder={contactFormPending ? t("contactFirstPlaceholder") : t("messagePlaceholder")}
                rows={3}
                className="max-h-[180px] min-h-[84px] flex-1 resize-none bg-transparent text-[15px] leading-[1.45] outline-none placeholder:text-[#94a3b8] disabled:opacity-50"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#94a3b8]">
                <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilePick} />
                <button type="button" disabled={inputBlocked} onClick={() => fileInputRef.current?.click()} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f4f6f9] disabled:opacity-50" aria-label="Attach">{Icon.paperclip}</button>
                <button type="button" disabled={inputBlocked} onClick={() => setEmojiOpen((v) => !v)} className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f4f6f9] ${emojiOpen ? "bg-[#f4f6f9] text-[#334155]" : ""} disabled:opacity-50`} aria-label="Emoji">{Icon.smile}</button>
                {session && <button type="button" onClick={() => setTicketOpen(true)} className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] text-[#94a3b8] hover:bg-[#f4f6f9] hover:text-[#334155]">{Icon.ticket} {t("ticket")}</button>}
              </div>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleSend} disabled={(!message.trim() && attachments.length === 0) || sending || inputBlocked}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white transition-opacity disabled:opacity-50" style={{ background: appearance.brandColor }} aria-label="Send">
                {Icon.send}
              </button>
            </div>
            {emojiOpen && (
              <div ref={emojiRef} className="absolute bottom-[54px] left-3 z-10 w-[260px] rounded-[12px] border border-[#e5eaf1] bg-white p-2 shadow-lg">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button" onMouseDown={(ev) => ev.preventDefault()} onClick={() => insertEmoji(e)} className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#f4f6f9] text-[16px]">{e}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)} className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_30px_rgba(5,150,105,0.45)] transition-transform hover:scale-105"
        style={{ background: open ? appearance.brandColorDark : appearance.brandColor }} aria-label={open ? "Close chat" : "Open chat"}>
        {open ? Icon.close : <img src={chatShowIcon} alt="" className="h-7 w-7" />}
      </button>
    </div>
  );
}
