export function getPageMeta(page, i18n) {
  const t = (key, fallback) => i18n[key] || fallback;
  switch (page) {
    case "home": return { title: t("pageTitleHome", "Dashboard"), searchPlaceholder: t("searchPlaceholder", "Search..."), showTestButton: false };
    case "inbox": return { title: t("pageTitleInbox", "Inbox"), searchPlaceholder: t("searchInInbox", "Search in Inbox..."), showTestButton: false };
    case "dashboard": return { title: t("pageTitleHome", "Dashboard"), searchPlaceholder: t("searchPlaceholder", "Search..."), showTestButton: true };
    case "data-sources": return { title: t("pageTitleDataSources", "Data sources"), searchPlaceholder: t("searchInDataSources", "Search data sources..."), showTestButton: false };
    case "products": return { title: t("pageTitleProducts", "Products"), searchPlaceholder: t("searchInProducts", "Search products..."), showTestButton: false };
    case "suggestions": return { title: t("pageTitleSuggestions", "Suggestions"), searchPlaceholder: t("searchInSuggestions", "Search suggestions..."), showTestButton: true };
    case "guidance": return { title: t("pageTitleGuidance", "Guidance"), searchPlaceholder: t("searchInGuidance", "Search guidance..."), showTestButton: true };
    case "actions": return { title: t("pageTitleActions", "Actions"), searchPlaceholder: t("searchInActions", "Search actions..."), showTestButton: true };
    case "playground": return { title: t("pageTitlePlayground", "Playground"), searchPlaceholder: t("searchInPlayground", "Search questions..."), showTestButton: false };
    case "configure": return { title: t("pageTitleConfigure", "Configure"), searchPlaceholder: t("searchInConfigure", "Search settings..."), showTestButton: true };
    case "settings": return { title: t("pageTitleSettings", "Settings"), searchPlaceholder: t("searchInSettings", "Search settings..."), showTestButton: false };
    case "customers": return { title: t("pageTitleCustomers", "Customers"), searchPlaceholder: t("searchInCustomers", "Search customers..."), showTestButton: false };
    case "analytics": return { title: t("pageTitleAnalytics", "Analytics"), searchPlaceholder: t("searchPlaceholder", "Search..."), showTestButton: false };
    default: return { title: "Lyro AI Agent", searchPlaceholder: t("searchPlaceholder", "Search..."), showTestButton: false };
  }
}

export function formatCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const initialMessagesByConversation = {
  "conv-1": [
    { id: "m-1", sender: "system", author: "Automatic message", time: "9:08 AM", text: "Facebook: ❤️ I will send the files soon." },
    { id: "m-2", sender: "customer", author: "#202f4", time: "9:09 AM", text: "Ok great with install instructions?" },
    { id: "m-3", sender: "customer", author: "#202f4", time: "9:10 AM", text: "I have to work today but I can install the files tonight." },
    { id: "m-4", sender: "agent", author: "Copilot", time: "9:11 AM", text: "Sure — I can prepare a clean installation guide and help you step by step when you're ready." },
  ],
  "conv-2": [
    { id: "m-5", sender: "customer", author: "tlm21269@outlook.com", time: "11:04 AM", text: "hello" },
    { id: "m-6", sender: "agent", author: "Nina Cole", time: "11:05 AM", text: "Hi! How can I help you today?" },
  ],
  "conv-3": [
    { id: "m-7", sender: "customer", author: "#13cbf", time: "2:12 PM", text: "Chinese factory is seeking details about bulk pricing." },
  ],
};

export function getInitialMessages(conversationId) {
  return initialMessagesByConversation[conversationId] || [
    { id: `empty-${conversationId}`, sender: "system", author: "Automatic message", time: "Now", text: "No messages yet in this conversation." },
  ];
}
