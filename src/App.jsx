import React, { useEffect, useMemo, useRef, useState } from "react";
import { conversations as mockConversations } from "./inboxData.js";
import { api, getToken, setToken, clearToken } from "./api.js";
import { syncQuickActionsFromServer } from "./quickActions.js";
import { useInbox } from "./hooks/useInbox.js";
import { getPageMeta, formatCurrentTime, getInitialMessages } from "./utils.js";
import { ADMIN_LANGS, getAdminI18n } from "./adminI18n.js";
import { LanguageProvider } from "./LanguageContext.jsx";
import TopBar from "./components/TopBar.jsx";
import LeftRail from "./components/LeftRail.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ConversationList from "./components/ConversationList.jsx";
import ChatCenter from "./components/ChatCenter.jsx";
import CommandPalette, { AssignModal, CmdIcons } from "./components/CommandPalette.jsx";
import RightPanel from "./components/RightPanel.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";
import AdminContent from "./AdminContent.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import CustomersPage from "./pages/CustomersPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import TicketsPage from "./pages/TicketsPage.jsx";
import SubscribersPage from "./pages/SubscribersPage.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

const DEFAULT_SIDEBAR_COLLAPSED = { live: false, tickets: false, views: false, agents: false };

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [authPage, setAuthPage] = useState("login"); // login, forgot-password, reset-password, register, verify-email
  const [currentUser, setCurrentUser] = useState(null);
  const [loginLanguage, setLoginLanguage] = useState("EN");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [twoFATempToken, setTwoFATempToken] = useState(null);
  const [twoFACodeInput, setTwoFACodeInput] = useState("");
  const [adminLanguage, setAdminLanguage] = useState("AZ");

  useEffect(() => {
    if (!isAuthenticated) return;
    api.me().then(({ user }) => setCurrentUser(user)).catch(() => {
      clearToken();
      setIsAuthenticated(false);
    });
    syncQuickActionsFromServer();
  }, [isAuthenticated]);

  useEffect(() => {
    // Check URL for reset-password or verify-email token
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    const verifyToken = urlParams.get("token");
    const isVerifyEmail = window.location.pathname === "/verify-email";
    if (resetToken && !isAuthenticated && !isVerifyEmail) {
      setAuthPage("reset-password");
    }
    if (verifyToken && isVerifyEmail && !isAuthenticated) {
      setAuthPage("verify-email");
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSidebarCollapsedSections(DEFAULT_SIDEBAR_COLLAPSED);
      return;
    }
    let cancelled = false;
    api.getSiteSettings().then(({ settings }) => {
      if (cancelled) return;
      const savedLanguage = settings?.adminPanelLanguage;
      if (savedLanguage && ADMIN_LANGS.includes(savedLanguage)) {
        setAdminLanguage(savedLanguage);
      }
      const saved = settings?.inboxSidebarCollapsed;
      if (!saved || typeof saved !== "object") {
        setSidebarCollapsedSections(DEFAULT_SIDEBAR_COLLAPSED);
        return;
      }
      setSidebarCollapsedSections({
        live: !!saved.live,
        tickets: !!saved.tickets,
        views: !!saved.views,
        agents: !!saved.agents,
      });
    }).catch(() => {
      if (!cancelled) setSidebarCollapsedSections(DEFAULT_SIDEBAR_COLLAPSED);
    });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Real inbox (backend + socket). Auth olmasa boş qayıdır.
  const inbox = useInbox(isAuthenticated);

  const [activePage, setActivePage] = useState("inbox");
  const [sidebarRoute, setSidebarRoute] = useState("/conversations?status=my-open");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("");
  const [configureTab, setConfigureTab] = useState("General");
  const [dashboardInitialSection, setDashboardInitialSection] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [unreadConversationIds, setUnreadConversationIds] = useState(new Set());
  const [sidebarCollapsedSections, setSidebarCollapsedSections] = useState(DEFAULT_SIDEBAR_COLLAPSED);
  const [localMessages, setLocalMessages] = useState({}); // mock fallback messages
  const [draftMessage, setDraftMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const chatCenterRef = useRef(null);
  const prevItemsMetaRef = useRef({});

  // Mobil layout state-ləri
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [mobileInboxView, setMobileInboxView] = useState("list"); // 'list' | 'chat'

  // Real conversation-lar varsa onları istifadə et, yoxsa mock-a düş.
  const useReal = inbox.conversations.length > 0;
  const items = useReal ? inbox.conversations : mockConversations;

  function handleToggleSidebarSection(section) {
    setSidebarCollapsedSections((prev) => {
      const current = prev || DEFAULT_SIDEBAR_COLLAPSED;
      const next = { ...current, [section]: !current[section] };
      api.updateSiteSettings({ inboxSidebarCollapsed: next }).catch(() => {});
      return next;
    });
  }

  // İlk söhbəti avtomatik seç (yalnız heç nə seçilməyibsə)
  useEffect(() => {
    if (!activeConversationId && items.length > 0) {
      setActiveConversationId(items[0].id);
    }
  }, [items, activeConversationId, useReal]);

  useEffect(() => {
    if (!activeConversationId) return;
    setUnreadConversationIds((prev) => {
      if (!prev.has(activeConversationId)) return prev;
      const next = new Set(prev);
      next.delete(activeConversationId);
      return next;
    });
  }, [activeConversationId]);

  // Real data yüklənəndə, əgər activeConversationId mock ID-dirsə, real-ın birincisinə keç
  useEffect(() => {
    if (useReal && activeConversationId && activeConversationId.startsWith("conv-")) {
      setActiveConversationId(inbox.conversations[0]?.id || null);
    }
  }, [useReal, inbox.conversations, activeConversationId]);

  // Aktiv söhbət seçiləndə detalları yüklə (real mode)
  useEffect(() => {
    if (useReal && activeConversationId) {
      inbox.loadConversationDetails(activeConversationId);
    }
  }, [useReal, activeConversationId]);

  const t = getAdminI18n(adminLanguage);
  const pageMeta = getPageMeta(activePage, t);
  const localizedSearchByPage = {
    inbox: t.searchInbox,
    home: t.searchDefault,
    dashboard: t.searchDefault,
    "data-sources": t.searchDefault,
    products: t.searchDefault,
    suggestions: t.searchDefault,
    guidance: t.searchDefault,
    actions: t.searchDefault,
    playground: t.searchDefault,
    configure: t.searchDefault,
    settings: t.searchDefault,
    customers: t.searchDefault,
    analytics: t.searchDefault,
  };
  const localizedTitleByPage = {
    inbox: t.pageInbox || "Inbox",
    home: t.pageDashboard || "Dashboard",
    dashboard: t.pageDashboard || "Dashboard",
    "data-sources": t.pageDataSources || "Data sources",
    products: t.pageProducts || "Products",
    suggestions: t.pageSuggestions || "Suggestions",
    guidance: t.pageGuidance || "Guidance",
    actions: t.pageActions || "Actions",
    playground: t.pagePlayground || "Playground",
    configure: t.pageConfigure || "Configure",
    settings: t.pageSettings || "Settings",
    customers: t.pageCustomers || "Customers",
    analytics: t.pageAnalytics || "Analytics",
  };
  const resolvedPageMeta = {
    ...pageMeta,
    title: localizedTitleByPage[activePage] || pageMeta.title,
    searchPlaceholder: localizedSearchByPage[activePage] || pageMeta.searchPlaceholder,
  };
  const activeConversation = activeConversationId
    ? (items.find((item) => item.id === activeConversationId) || null)
    : items[0];

  useEffect(() => {
    if (!useReal) {
      prevItemsMetaRef.current = {};
      setUnreadConversationIds(new Set());
      return;
    }

    const nextMeta = {};
    items.forEach((it) => {
      nextMeta[it.id] = it.updatedAt || it.time || "";
    });

    const prevMeta = prevItemsMetaRef.current;
    const hasPrev = Object.keys(prevMeta).length > 0;
    if (!hasPrev) {
      prevItemsMetaRef.current = nextMeta;
      return;
    }

    setUnreadConversationIds((prev) => {
      const next = new Set(prev);

      items.forEach((it) => {
        const oldStamp = prevMeta[it.id];
        const newStamp = nextMeta[it.id];

        if (oldStamp === undefined) {
          if (it.id !== activeConversationId) next.add(it.id);
          return;
        }

        if (newStamp && oldStamp && newStamp !== oldStamp && it.id !== activeConversationId) {
          next.add(it.id);
        }
      });

      Array.from(next).forEach((id) => {
        if (!nextMeta[id]) next.delete(id);
      });

      return next;
    });

    prevItemsMetaRef.current = nextMeta;
  }, [items, activeConversationId]);

  // Keyboard shortcuts (yalnız inbox səhifəsində)
  useEffect(() => {
    if (!isAuthenticated || activePage !== "inbox") return;
    function onKey(e) {
      const t = e.target;
      const inTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      // Ctrl+K her zaman
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.ctrlKey && e.shiftKey && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === "s") { e.preventDefault(); if (useReal && activeConversation) inbox.updateConversationStatus(activeConversation.id, "SOLVED"); return; }
        if (k === "x") { e.preventDefault(); if (useReal && activeConversation) inbox.updateConversationStatus(activeConversation.id, "PENDING"); return; }
        if (k === "a") { e.preventDefault(); setAssignOpen(true); return; }
        if (k === "r") { e.preventDefault(); chatCenterRef.current?.focusComposer(); return; }
        if (k === "l") { e.preventDefault(); chatCenterRef.current?.triggerFilePicker(); return; }
      }
      // "/" → macros (if not typing)
      if (!inTyping && e.key === "/") {
        e.preventDefault();
        chatCenterRef.current?.openMacros();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isAuthenticated, activePage, useReal, activeConversation, inbox]);

  const paletteActions = useMemo(() => {
    if (!activeConversation) return [];
    const convoId = activeConversation.id;
    const isReal = useReal;
    const gInput = t.paInputActions || "Input actions";
    const gConvo = t.paConversationMgmt || "Conversation management";
    return [
      { id: "reply", group: gInput, title: t.paReply || "Reply", description: t.paReplyDesc || "Focus the message input", icon: CmdIcons.reply, shortcut: ["Ctrl","Shift","R"], run: () => chatCenterRef.current?.focusComposer() },
      { id: "emoji", group: gInput, title: t.paEmoji || "Insert emoji", description: t.paEmojiDesc || "Open emoji picker", icon: CmdIcons.smile, run: () => chatCenterRef.current?.openEmoji() },
      { id: "upload", group: gInput, title: t.paUpload || "Upload a file", description: t.paUploadDesc || "Attach a file to reply", icon: CmdIcons.paperclip, shortcut: ["Ctrl","Shift","L"], run: () => chatCenterRef.current?.triggerFilePicker() },
      { id: "macro", group: gInput, title: t.paMacro || "Use Macro", description: t.paMacroDesc || "Insert a saved quick reply", icon: CmdIcons.macro, shortcut: ["/"], run: () => chatCenterRef.current?.openMacros() },
      { id: "assign-me", group: gConvo, title: t.paAssignMe || "Assign to me", description: t.paAssignMeDesc || "Take this conversation", icon: CmdIcons.user, shortcut: ["Enter"], run: () => { if (isReal && currentUser) inbox.updateConversationAssignee(convoId, currentUser.id); } },
      { id: "assign", group: gConvo, title: t.paAssign || "Assign to…", description: t.paAssignDesc || "Pick a team member", icon: CmdIcons.assign, shortcut: ["Ctrl","Shift","A"], run: () => setAssignOpen(true) },
      { id: "solve", group: gConvo, title: t.paSolve || "Mark as solved", description: t.paSolveDesc || "Set conversation as solved", icon: CmdIcons.check, shortcut: ["Ctrl","Shift","S"], run: () => { if (isReal) inbox.updateConversationStatus(convoId, "SOLVED"); } },
      { id: "close", group: gConvo, title: t.paClose || "End chat", description: t.paCloseDesc || "End and require a new chat", icon: CmdIcons.close, shortcut: ["Ctrl","Shift","X"], run: () => { if (isReal) inbox.updateConversationStatus(convoId, "PENDING"); } },
      { id: "reopen", group: gConvo, title: t.paReopen || "Reopen conversation", description: t.paReopenDesc || "Set status back to open", icon: CmdIcons.refresh, run: () => { if (isReal) inbox.updateConversationStatus(convoId, "OPEN"); } },
      { id: "unassign", group: gConvo, title: t.paUnassign || "Unassign", description: t.paUnassignDesc || "Remove current assignee", icon: CmdIcons.circle, run: () => { if (isReal) inbox.updateConversationAssignee(convoId, null); } },
    ];
  }, [activeConversation, useReal, currentUser, inbox, t]);

  function handleAssignSelect(userId) {
    setAssignOpen(false);
    if (useReal && activeConversation) inbox.updateConversationAssignee(activeConversation.id, userId);
  }

  // Messages: real-dən və ya mock-dan
  const realMessages = useReal ? (inbox.messagesByConversation[activeConversationId] || []) : null;
  const mockMessagesForConv = localMessages[activeConversationId] || (activeConversationId ? getInitialMessages(activeConversationId) : []);
  const activeMessages = useReal ? realMessages : mockMessagesForConv;
  const activeTypingLabel = useReal && activeConversation ? (inbox.typingByConversation[activeConversation.id] || "") : "";

  function filterInboxItemsByRoute(list, route) {
    const status = new URLSearchParams((route || "").split("?")[1] || "").get("status");

    if (route.startsWith("/conversations")) {
      if (status === "unassigned") {
        return list.filter((it) => (it.assignee || "").toLowerCase() === "unassigned");
      }
      if (status === "my-open") {
        const myName = (currentUser?.name || "").toLowerCase();
        return list.filter((it) => {
          const isOpen = (it.status || "").toLowerCase() === "open";
          if (!isOpen) return false;
          if (myName) return (it.assignee || "").toLowerCase() === myName;
          return (it.assignee || "").toLowerCase() !== "unassigned";
        });
      }
      if (status === "solved") {
        return list.filter((it) => (it.status || "").toLowerCase() === "solved");
      }
      if (status === "close-chat") {
        return list.filter((it) => (it.status || "").toLowerCase() === "closed");
      }
    }

    if (route === "/mentions") {
      return list.filter((it) => [it.preview, it.name].filter(Boolean).join(" ").includes("@"));
    }

    if (route === "/products") {
      return list.filter((it) => {
        const haystack = [it.preview, it.name, it.currentUrl].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes("product") || haystack.includes("sku") || haystack.includes("catalog") || haystack.includes("price");
      });
    }

    if (route === "/order-status") {
      return list.filter((it) => {
        const haystack = [it.preview, it.name, it.currentUrl].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes("order status") || haystack.includes("track") || haystack.includes("where is my order") || haystack.includes("tracking");
      });
    }

    if (route === "/order-issues") {
      return list.filter((it) => {
        const haystack = [it.preview, it.name, it.currentUrl].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes("order") && (haystack.includes("issue") || haystack.includes("problem") || haystack.includes("wrong") || haystack.includes("cancel") || haystack.includes("refund"));
      });
    }

    if (route === "/shipping-policy") {
      return list.filter((it) => {
        const haystack = [it.preview, it.name, it.currentUrl].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes("shipping") || haystack.includes("delivery") || haystack.includes("courier") || haystack.includes("postage");
      });
    }

    if (route === "/messenger") return list.filter((it) => (it.channel || "").toLowerCase().includes("messenger"));
    if (route === "/instagram") return list.filter((it) => (it.channel || "").toLowerCase().includes("instagram"));
    if (route === "/whatsapp") return list.filter((it) => (it.channel || "").toLowerCase().includes("whatsapp"));
    if (route === "/spam") {
      return list.filter((it) => {
        const haystack = [it.preview, it.name, it.email].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes("spam") || haystack.includes("scam") || haystack.includes("casino") || haystack.includes("crypto") || haystack.includes("viagra");
      });
    }

    return list;
  }

  const sidebarFilteredItems = useMemo(() => {
    if (activePage !== "inbox") return items;
    return filterInboxItemsByRoute(items, sidebarRoute);
  }, [activePage, sidebarRoute, items, currentUser?.name, unreadConversationIds]);

  const sidebarBadgeByRoute = useMemo(() => {
    const routes = [
      "/conversations?status=unassigned",
      "/conversations?status=my-open",
      "/conversations?status=solved",
      "/conversations?status=close-chat",
      "/mentions",
      "/products",
      "/order-status",
      "/order-issues",
      "/shipping-policy",
      "/messenger",
      "/instagram",
      "/whatsapp",
      "/spam",
    ];
    const unreadItems = items.filter((it) => unreadConversationIds.has(it.id));
    return routes.reduce((acc, route) => {
      acc[route] = filterInboxItemsByRoute(unreadItems, route).length;
      return acc;
    }, {});
  }, [items, unreadConversationIds, currentUser?.name]);

  const totalUnreadInbox = useMemo(() => {
    return items.filter((it) => unreadConversationIds.has(it.id)).length;
  }, [items, unreadConversationIds]);

  const conversationListMeta = useMemo(() => {
    const map = {
      "/conversations?status=unassigned": { emoji: "👋", title: t.unassigned || "Unassigned" },
      "/conversations?status=my-open": { emoji: "📬", title: t.myOpen || "My open" },
      "/conversations?status=solved": { emoji: "✅", title: t.solved || "Solved" },
      "/conversations?status=close-chat": { emoji: "✖", title: t.endChat || "End chat" },
      "/mentions": { emoji: "@", title: t.mentions || "Mentions" },
      "/products": { emoji: "🛍", title: t.products || "Products" },
      "/order-status": { emoji: "◫", title: t.orderStatus || "Order status" },
      "/order-issues": { emoji: "📦", title: t.orderIssues || "Order issues" },
      "/shipping-policy": { emoji: "🚚", title: t.shippingPolicy || "Shipping policy" },
      "/messenger": { emoji: "💬", title: t.channelMessenger || "Messenger" },
      "/instagram": { emoji: "📸", title: t.channelInstagram || "Instagram" },
      "/whatsapp": { emoji: "🟢", title: t.channelWhatsapp || "WhatsApp" },
      "/spam": { emoji: "◔", title: t.spam || "Spam" },
    };
    return map[sidebarRoute] || { emoji: "📬", title: t.myOpen || "My open" };
  }, [sidebarRoute, t]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? sidebarFilteredItems.filter((it) => {
        const haystack = [it.name, it.email, it.preview, it.channel, it.assignee].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : sidebarFilteredItems;

  useEffect(() => {
    if (activePage !== "inbox") return;
    if (!filteredItems.some((it) => it.id === activeConversationId)) {
      setActiveConversationId(filteredItems[0]?.id || null);
    }
  }, [activePage, filteredItems, activeConversationId]);

  function handleSelectConversation(conversationId) {
    setActiveConversationId(conversationId);
    setUnreadConversationIds((prev) => {
      const next = new Set(prev);
      next.delete(conversationId);
      return next;
    });
    setDraftMessage("");
    // Mobil: söhbət seçiləndə chat görünüşünə keç
    setMobileInboxView("chat");
    setMobileNavOpen(false);
    setMobileInfoOpen(false);
  }

  function handleSelectPage(page) {
    setActivePage(page);
    setSearchQuery("");
    if (page !== "tickets") setTicketStatusFilter("");
    // Mobil: səhifə dəyişəndə drawer-ı bağla
    setMobileNavOpen(false);
    setMobileInfoOpen(false);
    if (page === "inbox") setMobileInboxView("list");
  }

  function handleLogout() {
    clearToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setSearchQuery("");
    setActivePage("inbox");
  }

  function handleAdminLanguageChange(nextLang) {
    if (!ADMIN_LANGS.includes(nextLang)) return;
    setAdminLanguage(nextLang);
    api.updateSiteSettings({ adminPanelLanguage: nextLang }).catch(() => {});
  }

  function handleChangeConfigureTab(tab) {
    setConfigureTab(tab);
  }

  function handleSidebarNavigate(route) {
    setSidebarRoute(route);

    // Route-based navigation for sidebar items
    if (route.startsWith("/conversations")) {
      setActivePage("inbox");
    } else if (route.startsWith("/tickets")) {
      const status = new URLSearchParams(route.split("?")[1] || "").get("status");
      const map = { unassigned: "OPEN", "my-open": "OPEN", solved: "RESOLVED" };
      setTicketStatusFilter(map[status] || "");
      setActivePage("tickets");
    } else if (route.startsWith("/products")) {
      setActivePage("inbox");
    } else if (route.startsWith("/mentions")) {
      setActivePage("inbox");
    } else if (route.startsWith("/ai-agent")) {
      setDashboardInitialSection("data-sources");
      setActivePage("home");
      // Reset after navigation
      setTimeout(() => setDashboardInitialSection(null), 100);
    } else if (route.startsWith("/order-") || route === "/shipping-policy" || route === "/messenger" || route === "/instagram" || route === "/whatsapp" || route === "/spam") {
      setActivePage("inbox");
    } else {
      // Default fallback
      console.log("Navigate to:", route);
    }
  }

  async function handleStartChatWithContact(contactId) {
    setActivePage("inbox");
    // Əvvəlcə mövcud siyahıda axtar
    let conv = items.find((c) => c.contactId === contactId);
    if (!conv) {
      // Yoxdursa — backend-dən birbaşa çək (widget yeni açılıbsa conversation BOT statusda olur)
      try {
        const list = await api.listConversations();
        const found = list.find((c) => c.contactId === contactId);
        if (found) {
          setActiveConversationId(found.id);
          inbox.reload();
          return;
        }
      } catch {}
    }
    if (conv) setActiveConversationId(conv.id);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim() || loginLoading) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await api.login({ email: loginEmail.trim(), password: loginPassword });
      if (res.requires2FA) {
        setTwoFATempToken(res.tempToken);
        setTwoFACodeInput("");
        setLoginPassword("");
        return;
      }
      setToken(res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setLoginPassword("");
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handle2FASubmit(event) {
    event.preventDefault();
    if (!twoFATempToken || !twoFACodeInput.trim() || loginLoading) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      const { token, user } = await api.login2FA({ tempToken: twoFATempToken, code: twoFACodeInput.trim() });
      setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setTwoFATempToken(null);
      setTwoFACodeInput("");
    } catch (err) {
      setLoginError(err.message || "Yanlış kod");
    } finally {
      setLoginLoading(false);
    }
  }

  function handle2FACancel() {
    setTwoFATempToken(null);
    setTwoFACodeInput("");
    setLoginError("");
  }

  function handleSendMessage(files, deliveryMode = "chat") {
    const trimmedMessage = draftMessage.trim();
    const hasFiles = files && files.length > 0;
    if ((!trimmedMessage && !hasFiles) || !activeConversation) return;

    if (useReal) {
      inbox.sendTyping(activeConversation.id, activeConversation?._raw?.siteId || activeConversation?._raw?.site?.id || null, false, currentUser?.name || "Agent");
    }

    if (useReal) {
      inbox.sendAgentMessage(activeConversation.id, trimmedMessage, files, deliveryMode);
      setDraftMessage("");
      return;
    }
    if (!trimmedMessage) return; // mock-da file yoxdur

    // Mock fallback (backend yoxdur)
    const nextMessage = {
      id: `message-${Date.now()}`,
      sender: "agent",
      author: activeConversation.assignee,
      time: formatCurrentTime(),
      text: trimmedMessage,
    };
    setLocalMessages((current) => ({
      ...current,
      [activeConversation.id]: [...(current[activeConversation.id] || getInitialMessages(activeConversation.id)), nextMessage],
    }));
    setDraftMessage("");
  }

  if (!isAuthenticated) {
    if (twoFATempToken) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f4f7ff] p-6">
          <form onSubmit={handle2FASubmit} className="w-full max-w-[420px] rounded-[20px] border border-[#e6ebf4] bg-white p-8 shadow-[0_30px_80px_rgba(37,99,235,0.12)]">
            <div className="text-[24px] font-semibold text-[#0f172a]">Two-Factor Authentication</div>
            <div className="mt-2 text-[13px] text-[#64748b]">
              Authenticator tətbiqindən 6 rəqəmli kodu daxil edin. Əgər telefonunuza çatışmırsa, backup kodlarınızdan istifadə edə bilərsiniz.
            </div>
            <input
              type="text"
              value={twoFACodeInput}
              onChange={(e) => setTwoFACodeInput(e.target.value.toUpperCase())}
              placeholder="000000 və ya backup kod"
              autoFocus
              className="mt-5 w-full rounded-[12px] border border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-center text-[18px] font-mono tracking-[0.4em] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10"
            />
            {loginError && <div className="mt-3 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{loginError}</div>}
            <button
              type="submit"
              disabled={!twoFACodeInput.trim() || loginLoading}
              className={`mt-5 h-[50px] w-full rounded-[12px] text-[16px] font-semibold transition ${twoFACodeInput.trim() && !loginLoading ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]" : "bg-[#eef2f7] text-[#94a3b8]"}`}
            >
              {loginLoading ? "Yoxlanılır..." : "Təsdiq et"}
            </button>
            <button type="button" onClick={handle2FACancel}
              className="mt-3 w-full text-center text-[13px] text-[#64748b] hover:text-[#2563eb]">
              ← Login-ə qayıt
            </button>
          </form>
        </div>
      );
    }
    if (authPage === "forgot-password") {
      return <ForgotPasswordPage language={loginLanguage} onChangeLanguage={setLoginLanguage} />;
    }
    if (authPage === "reset-password") {
      return <ResetPasswordPage language={loginLanguage} onChangeLanguage={setLoginLanguage} />;
    }
    if (authPage === "register") {
      return <RegisterPage language={loginLanguage} onChangeLanguage={setLoginLanguage} />;
    }
    if (authPage === "verify-email") {
      return <VerifyEmailPage onBackToLogin={() => setAuthPage("login")} />;
    }
    return (
      <LoginPage
        language={loginLanguage}
        onChangeLanguage={setLoginLanguage}
        email={loginEmail}
        password={loginPassword}
        showPassword={showLoginPassword}
        onChangeEmail={setLoginEmail}
        onChangePassword={setLoginPassword}
        onTogglePassword={() => setShowLoginPassword((c) => !c)}
        onSubmit={handleLoginSubmit}
        onForgotPassword={() => setAuthPage("forgot-password")}
        onRegister={() => setAuthPage("register")}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  const showAdminSidebar = !["inbox", "home", "settings", "customers", "tickets", "subscribers", "analytics", "dashboard"].includes(activePage);
  const mobileBackInChat = activePage === "inbox" && mobileInboxView === "chat" && !!activeConversation;

  return (
    <LanguageProvider language={adminLanguage} setLanguage={handleAdminLanguageChange}>
    <div className="h-[100dvh] w-full overflow-hidden bg-[#f3f6fb] text-[#111827] md:p-3">
      <div className="flex h-full w-full flex-col overflow-hidden bg-white md:rounded-[16px] md:border md:border-[#dfe5ee] md:border-t-[3px] md:border-t-[#2563eb] md:shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <TopBar title={resolvedPageMeta.title} searchPlaceholder={resolvedPageMeta.searchPlaceholder} showTestButton={resolvedPageMeta.showTestButton}
          searchQuery={searchQuery} onSearchChange={setSearchQuery} onLogout={handleLogout}
          notificationsBadge={totalUnreadInbox} t={t} language={adminLanguage} languages={ADMIN_LANGS} onChangeLanguage={handleAdminLanguageChange}
          onToggleMobileNav={() => setMobileNavOpen((v) => !v)}
          mobileBack={mobileBackInChat}
          onMobileBack={() => setMobileInboxView("list")}
        />
        <div className="relative flex min-h-0 flex-1">
          {/* Mobile drawer backdrop */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          )}
          {/* Navigation: LeftRail + Sidebar/AdminSidebar */}
          <div className={`${mobileNavOpen ? "fixed inset-y-0 left-0 z-40 flex shadow-2xl" : "hidden"} md:static md:flex md:z-auto md:shadow-none`}>
            <LeftRail activePage={activePage} onSelectPage={handleSelectPage} inboxBadge={totalUnreadInbox} />
            {activePage === "inbox" ? (
              <Sidebar
                onNavigate={(route) => { handleSidebarNavigate(route); setMobileNavOpen(false); setMobileInboxView("list"); }}
                activeRoute={sidebarRoute}
                badgeByRoute={sidebarBadgeByRoute}
                collapsedSections={sidebarCollapsedSections}
                onToggleSection={handleToggleSidebarSection}
                t={t}
              />
            ) : showAdminSidebar ? (
              <AdminSidebar activePage={activePage} onSelectPage={handleSelectPage} />
            ) : null}
          </div>

          {activePage === "inbox" ? (
            <>
              {filteredItems.length > 0 && (
                <div className={`${mobileInboxView === "list" ? "flex" : "hidden"} min-w-0 flex-1 md:flex md:flex-none`}>
                  <ConversationList items={filteredItems} activeConversationId={activeConversation?.id} onSelectConversation={handleSelectConversation}
                    title={conversationListMeta.title} emoji={conversationListMeta.emoji} unreadConversationIds={unreadConversationIds}
                    onMobileBack={() => setMobileNavOpen(true)} />
                </div>
              )}
              {activeConversation ? (
                <>
                  <div className={`${mobileInboxView === "chat" ? "flex" : "hidden"} min-w-0 flex-1 md:flex`}>
                    <ChatCenter ref={chatCenterRef} conversation={activeConversation} messages={activeMessages} draftMessage={draftMessage} onDraftChange={setDraftMessage} onSendMessage={handleSendMessage}
                      typingLabel={activeTypingLabel}
                      onTypingChange={(typing) => {
                        if (!useReal || !activeConversation) return;
                        inbox.sendTyping(
                          activeConversation.id,
                          activeConversation?._raw?.siteId || activeConversation?._raw?.site?.id || null,
                          typing,
                          currentUser?.name || "Agent"
                        );
                      }}
                      onOpenPalette={() => setPaletteOpen(true)}
                      onAssign={() => setAssignOpen(true)}
                      onClose={useReal ? () => inbox.updateConversationStatus(activeConversation.id, activeConversation.status === "Closed" ? "OPEN" : "PENDING") : undefined}
                      onSolve={useReal ? () => inbox.updateConversationStatus(activeConversation.id, activeConversation.status === "Solved" ? "OPEN" : "SOLVED") : undefined}
                      onMobileBack={() => setMobileInboxView("list")}
                      onMobileOpenInfo={() => setMobileInfoOpen(true)}
                      t={t}
                    />
                  </div>
                  {/* RightPanel: lg+ inline, mobile/tablet drawer */}
                  {mobileInfoOpen && (
                    <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileInfoOpen(false)} aria-hidden="true" />
                  )}
                  <div className={`${mobileInfoOpen ? "fixed inset-y-0 right-0 z-40 flex w-[88%] max-w-[320px] shadow-2xl" : "hidden"} lg:static lg:flex lg:z-auto lg:w-auto lg:max-w-none lg:shadow-none`}>
                    <RightPanel conversation={activeConversation} onMobileClose={() => setMobileInfoOpen(false)} />
                  </div>
                </>
              ) : (
                <div className={`${filteredItems.length === 0 || mobileInboxView === "chat" ? "flex" : "hidden"} flex-1 items-center justify-center px-6 text-center text-[13px] text-[#64748b] md:flex`}>
                  {inbox.loading ? (t.loading || "Loading...") : filteredItems.length === 0 ? (t.noConversations || "No conversations yet.") : (t.selectConversation || "Select a conversation")}
                </div>
              )}
            </>
          ) : activePage === "home" ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
            <DashboardPage onNavigate={handleSelectPage} onOpenConversation={(id) => {
              const found = inbox.conversations.some((c) => c.id === id);
              const idsList = inbox.conversations.map((c) => c.id);
              console.log("[open]", { clickedId: id, found, inboxIds: idsList });
              setActiveConversationId(id);
              setActivePage("inbox");
            }} initialSection={dashboardInitialSection} />
            </div>
          ) : activePage === "settings" ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
              <SettingsPage searchQuery={searchQuery} onSearchChange={setSearchQuery} userRole={currentUser?.role || "AGENT"} />
            </div>
          ) : activePage === "customers" ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
              <CustomersPage searchQuery={searchQuery} onSearchChange={setSearchQuery} onStartChat={handleStartChatWithContact} />
            </div>
          ) : activePage === "tickets" ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
              <TicketsPage initialStatus={ticketStatusFilter} />
            </div>
          ) : activePage === "subscribers" ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
              <SubscribersPage />
            </div>
          ) : activePage === "analytics" ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
              <AnalyticsPage />
            </div>
          ) : activePage === "dashboard" ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
              <AdminContent activePage={activePage} configureTab={configureTab} onChangeConfigureTab={handleChangeConfigureTab}
                searchQuery={searchQuery} onSearchChange={setSearchQuery} onNavigate={handleSelectPage} />
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 overflow-x-auto">
              <AdminContent activePage={activePage} configureTab={configureTab} onChangeConfigureTab={handleChangeConfigureTab}
                searchQuery={searchQuery} onSearchChange={setSearchQuery} onNavigate={handleSelectPage} />
            </div>
          )}
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />
      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} onSelect={handleAssignSelect}
        currentAssigneeId={activeConversation?._raw?.assigneeId}
        currentUserId={currentUser?.id} />
      {import.meta.env.VITE_WIDGET_API_KEY && <ChatWidget />}
    </div>
    </LanguageProvider>
  );
}
