import React, { useMemo, useState } from "react";
import railIcon from "./icon.svg";
import whiteLogo from "./logo_chat_white.svg";

const leftIcons = [
  {
    key: "inbox",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 8.25A2.25 2.25 0 0 1 6.75 6h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 17.25 18H6.75A2.25 2.25 0 0 1 4.5 15.75v-7.5Z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4.5 12h4.3l1.45 2.1h3.5L15.2 12h4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    badge: 21,
    active: true,
  },
  {
    key: "bot",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5.25" y="6.75" width="13.5" height="10.5" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 4.5v2.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9.25" cy="11.75" r="1" fill="currentColor"/>
        <circle cx="14.75" cy="11.75" r="1" fill="currentColor"/>
        <path d="M9.25 14.75h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "flows",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="6.5" r="2.25" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="7" cy="17.25" r="2.25" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="17" cy="17.25" r="2.25" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 8.75v3.25m0 0-5 2.75M12 12l5 2.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: "team",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="9.25" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="15.75" cy="10.25" r="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4.75 17.75c.95-2.2 2.65-3.5 4.9-3.5 2.2 0 3.85 1.2 4.85 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M14.25 17.25c.55-1.35 1.65-2.2 3.1-2.2 1.2 0 2.2.55 2.9 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "reports",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5.25" y="4.75" width="13.5" height="14.5" rx="2.2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8.25 15.5v-3.75m3.75 3.75V8.5m3.75 7V10.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "ideas",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4.75A5.25 5.25 0 0 0 8 13.4c.55.5 1.2 1.4 1.45 2.1h5.1c.25-.7.9-1.6 1.45-2.1A5.25 5.25 0 0 0 12 4.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9.75 18.25h4.5M10.25 20h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "apps",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="10" y="5" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="15" y="5" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="5" y="10" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="15" y="10" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="5" y="15" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="10" y="15" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="15" y="15" width="4" height="4" rx="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "settings",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const liveConversations = [
  { label: "Unassigned", emoji: "👋", badge: 12 },
  { label: "My open", emoji: "📬", badge: 9, active: true },
  { label: "Solved", emoji: "✅" },
];

const tickets = [
  { label: "Unassigned", emoji: "👋" },
  { label: "My open", emoji: "📬" },
  { label: "Solved", emoji: "✅" },
];

const utilityItems = [
  { label: "Mentions", emoji: "@" },
  { label: "Lyro AI Agent", emoji: "🤖", suffix: "Activate" },
];

const views = [
  { label: "Products", emoji: "🛍", badge: 5 },
  { label: "Order status", emoji: "◫" },
  { label: "Order issues", emoji: "📦", badge: 2 },
  { label: "Shipping policy", emoji: "🚚" },
  { label: "Messenger", emoji: "💬", badge: 4, active: true, withMenu: true },
  { label: "Instagram", emoji: "📸" },
  { label: "WhatsApp", emoji: "🟢" },
];

const agents = [{ label: "Spam", emoji: "◔" }];

const conversations = [
  { id: "conv-1", name: "#202f4", source: "Messenger", preview: "I have to work today but I inst...", time: "2mo", color: "#9eacbe", count: 2, active: true, email: "info@fusiongraphics.co.nz", phone: "+64 21 555 017", channel: "Messenger", assignee: "Lena Goski", status: "Open" },
  { id: "conv-2", name: "tlm21269@outlook.com", source: "Live chat", preview: "hello", time: "2mo", color: "#f3497b", initials: "T", email: "tlm21269@outlook.com", phone: "+1 202 555 0184", channel: "Live chat", assignee: "Nina Cole", status: "Pending" },
  { id: "conv-3", name: "#13cbf", source: "Messenger", preview: "Chinese factory is seeking dec...", time: "3mo", color: "#4b6fff", count: 1, email: "orders@ripcrack.example", phone: "+86 10 5555 8192", channel: "Messenger", assignee: "Lena Goski", status: "Open" },
  { id: "conv-4", name: "limkiseok@hotmail.com", source: "Live chat", preview: "Hi", time: "3mo", color: "#6a98f2", initials: "L", email: "limkiseok@hotmail.com", phone: "+82 2 555 8801", channel: "Live chat", assignee: "Marta Fox", status: "Solved" },
  { id: "conv-5", name: "fiuso@msn.com", source: "Live chat", preview: "I need assistance. Are you gu...", time: "3mo", color: "#6d31f3", initials: "F", dot: true, email: "fiuso@msn.com", phone: "+1 415 555 0102", channel: "Live chat", assignee: "Nina Cole", status: "Open" },
  { id: "conv-6", name: "periccca@gmail.com", source: "Live chat", preview: "Hi", time: "3mo", color: "#6c7cff", initials: "P", dot: true, email: "periccca@gmail.com", phone: "+1 212 555 0161", channel: "Live chat", assignee: "Marta Fox", status: "Pending" },
  { id: "conv-7", name: "fiuso@msn.com", source: "Live chat", preview: "A technician is coming to check...", time: "3mo", color: "#ff7b52", initials: "F", email: "fiuso@msn.com", phone: "+1 415 555 0102", channel: "Live chat", assignee: "Nina Cole", status: "Open" },
  { id: "conv-8", name: "#7bd6z", source: "Messenger", preview: "https://TODO-files-prod.s3.w...", time: "4mo", color: "#41b8ff", email: "customer@messenger.example", phone: "Not provided", channel: "Messenger", assignee: "Lena Goski", status: "Open" },
  { id: "conv-9", name: "10b0c.com", source: "Live chat", preview: "Don't cheat", time: "4mo", color: "#ff6457", initials: "1", email: "contact@10b0c.com", phone: "+44 20 5555 1010", channel: "Live chat", assignee: "Nina Cole", status: "Open" },
  { id: "conv-10", name: "Dennis Vincent", source: "Messenger", preview: "https://TODO-files-prod.s3....", time: "5mo", color: "#9f6630", initials: "D", email: "dennis.vincent@example.com", phone: "+1 310 555 0147", channel: "Messenger", assignee: "Marta Fox", status: "Solved" },
  { id: "conv-11", name: "jems.izoo@hotmail.com", source: "Live chat", preview: "I placed order", time: "6mo", color: "#5f7cff", initials: "J", email: "jems.izoo@hotmail.com", phone: "+1 646 555 0129", channel: "Live chat", assignee: "Lena Goski", status: "Pending" },
  { id: "conv-12", name: "tcdosles@tdi.net", source: "Live chat", preview: "If i cant get this one at least...", time: "7mo", color: "#d56cff", initials: "T", email: "tcdosles@tdi.net", phone: "+1 708 555 0188", channel: "Live chat", assignee: "Nina Cole", status: "Open" },
  { id: "conv-13", name: "le62s@gmail.com", source: "Live chat", preview: "Good morning", time: "7mo", color: "#f9b233", initials: "L", email: "le62s@gmail.com", phone: "+1 917 555 0135", channel: "Live chat", assignee: "Marta Fox", status: "Pending" },
  { id: "conv-14", name: "lhyours48@gmail.com", source: "Live chat", preview: "knock knock anyone there?", time: "7mo", color: "#5e7683", initials: "L", email: "lhyours48@gmail.com", phone: "+1 323 555 0150", channel: "Live chat", assignee: "Lena Goski", status: "Open" },
];

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

const adminNavItems = [
  { key: "dashboard", label: "Hub", icon: "dashboard" },
  { key: "knowledge", label: "Knowledge", caret: true, icon: "knowledge" },
  { key: "data-sources", label: "Data sources", nested: true, icon: "data-sources" },
  { key: "products", label: "Products", nested: true, icon: "products" },
  { key: "suggestions", label: "Suggestions", nested: true, icon: "suggestions" },
  { key: "behavior", label: "Behavior", caret: true, icon: "behavior" },
  { key: "guidance", label: "Guidance", nested: true, icon: "guidance" },
  { key: "actions", label: "Actions", nested: true, icon: "actions" },
  { key: "playground", label: "Playground", icon: "playground" },
  { key: "configure", label: "Configure", icon: "configure" },
];

const secondaryAdminNavItems = [
  { key: "conversations", label: "Conversations", icon: "conversations" },
  { key: "analytics", label: "Analytics", icon: "analytics" },
];

function AdminSidebarIcon({ name, active = false }) {
  const iconClassName = active ? "text-[#11306a]" : "text-[#64748b]";

  switch (name) {
    case "dashboard":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 5v3M19 12h-3M12 19v-3M5 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "knowledge":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <path d="M6.5 5.5h8a2 2 0 0 1 2 2v11l-3-1.8-3 1.8-3-1.8-3 1.8v-11a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.5 9.25h5.5M8.5 12h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "data-sources":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <ellipse cx="12" cy="7" rx="5.5" ry="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6.5 7v5c0 1.38 2.46 2.5 5.5 2.5s5.5-1.12 5.5-2.5V7M6.5 12v5c0 1.38 2.46 2.5 5.5 2.5s5.5-1.12 5.5-2.5v-5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "products":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <path d="M7 7h13l-1.6 6.5H9L7 7Zm0 0-.9-2.5H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10.5" cy="17.5" r="1.3" fill="currentColor" />
          <circle cx="17" cy="17.5" r="1.3" fill="currentColor" />
        </svg>
      );
    case "suggestions":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <path d="m12 4 1.9 4.6L18.5 10l-4.6 1.4L12 16l-1.9-4.6L5.5 10l4.6-1.4L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "behavior":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <path d="M7 8h9M13 5l3 3-3 3M17 16H8M11 13l-3 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "guidance":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <path d="M7 5.5h10a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 17 18.5H7A1.5 1.5 0 0 1 5.5 17V7A1.5 1.5 0 0 1 7 5.5Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "actions":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <circle cx="7" cy="12" r="1.8" fill="currentColor" />
          <circle cx="12" cy="7" r="1.8" fill="currentColor" />
          <circle cx="17" cy="12" r="1.8" fill="currentColor" />
          <circle cx="12" cy="17" r="1.8" fill="currentColor" />
          <path d="M8.5 10.5 10.5 8.5M13.5 8.5l2 2M8.5 13.5l2 2M13.5 15.5l2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "playground":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        </svg>
      );
    case "configure":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 5.2v1.6M12 17.2v1.6M18.8 12h-1.6M6.8 12H5.2M16.8 7.2l-1.2 1.2M8.4 15.6l-1.2 1.2M16.8 16.8l-1.2-1.2M8.4 8.4 7.2 7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "conversations":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <path d="M6.5 7.5h11a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-6l-3.5 2v-2H6.5A1.5 1.5 0 0 1 5 15V9a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "analytics":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
          <path d="M6 18.5V11M12 18.5V8M18 18.5V13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

const quickActions = [
  { title: "Live conversations", value: "12 unassigned", iconPath: "M6.5 7.5h11a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-6l-3.5 2v-2H6.5A1.5 1.5 0 0 1 5 15V9a1.5 1.5 0 0 1 1.5-1.5Z" },
  { title: "Tickets", value: "0 unassigned", iconPath: "M9 12h6M9 9h3M6.5 5.5h8a2 2 0 0 1 2 2v11l-3-1.8-3 1.8-3-1.8-3 1.8v-11a2 2 0 0 1 2-2Z" },
  { title: "Lyro AI Agent", value: "Set up Lyro AI Agent", iconPath: "M12 5.2v1.6M12 17.2v1.6M18.8 12h-1.6M6.8 12H5.2M16.8 7.2l-1.2 1.2M8.4 15.6l-1.2 1.2M16.8 16.8l-1.2-1.2M8.4 8.4 7.2 7.2" },
  { title: "Flows", value: "7 active flows", iconPath: "M7 8h4M7 12h4M13 8h4M13 12h4M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z" },
  { title: "Live visitors", value: "0 live visitors on your site", iconPath: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Z" },
];

const knowledgeCards = [
  { title: "Suggestions", subtitle: "Knowledge to add from unanswered questions and past Inbox conversations", meta: "0 questions to review" },
  { title: "Website URL", subtitle: "Content imported from URLs, like knowledge bases or websites", meta: "3 pages" },
  { title: "Q&A", subtitle: "Questions and answers content", meta: "64 questions and answers" },
  { title: "Product database", subtitle: "Content from your products used for product recommendation", meta: "0 products" },
];

const guidanceRows = [
  { name: "Tone of voice: Neutral", audience: "Everyone", note: "Controls the overall tone of the AI Agent." },
];

const productBenefits = [
  { title: "Convert browsers into buyers", body: "Recommend the most relevant products based on what shoppers ask for" },
  { title: "Increase order value", body: "Suggest complementary items that naturally grow cart size." },
  { title: "Sell 24/7 inside chat", body: "Help customers discover and buy products without leaving the conversation." },
];

const configureTabs = ["General", "Handoff", "Audiences", "Copilot"];

const dataSourceRows = [
  ["FAQ url", "Website", "Main site", "Live", "Karina", "Apr 14, 2026, 4:01 PM"],
  ["Returns knowledge base", "Website", "Help center", "Live", "Karina", "Apr 14, 2026, 3:48 PM"],
  ["Shipping policy", "Website", "Docs", "Live", "Karina", "Apr 14, 2026, 3:22 PM"],
  ["Autumn bag catalog", "Website", "Storefront", "Live", "Emma", "Apr 13, 2026, 6:10 PM"],
  ["Product FAQ", "Q&A", "Support", "Live", "Emma", "Apr 13, 2026, 5:42 PM"],
  ["Messenger replies", "Website", "Messenger", "Live", "Emma", "Apr 12, 2026, 11:06 AM"],
  ["Warranty terms", "Website", "Docs", "Live", "Nina", "Apr 11, 2026, 9:18 AM"],
  ["Cancellations", "Q&A", "Support", "Live", "Nina", "Apr 10, 2026, 1:54 PM"],
  ["Autogenerated answers", "Q&A", "Inbox", "Live", "Marta", "Apr 10, 2026, 12:12 PM"],
  ["Website footer links", "Website", "Storefront", "Live", "Marta", "Apr 9, 2026, 6:33 PM"],
  ["Order issues", "Q&A", "Support", "Live", "Marta", "Apr 8, 2026, 2:17 PM"],
  ["Discount codes", "Q&A", "Storefront", "Live", "Lena", "Apr 8, 2026, 9:41 AM"],
];

const actionTemplates = [
  { title: "Get order status from Shopify", body: "Empower customers to instantly check Shopify order status—payment, fulfillment, purchased products & tracking details—right in chat." },
  { title: "Book a call in Calendly", body: "Turn interest into meetings. Automatically offer visitors a personalized Calendly link whenever they ask to book a call." },
  { title: "Explore all templates", body: "Browse more ready-made automations and AI actions for your workflows." },
];

const playgroundPrompts = [
  "What should I do if I need help with installation and adjusting Rip Crack products?",
  "How can I obtain an unlimited license?",
  "What is the policy regarding links to other websites on ripcrack.de?",
];

const loginTranslations = {
  EN: {
    badge: "AI customer support platform",
    heroTitle: "Welcome back to your support workspace",
    heroText: "Manage conversations, products, guidance and AI actions from one dashboard.",
    heroFooter: "Built for fast support teams",
    title: "Welcome back",
    subtitle: "Log in to your TODO account",
    emailPlaceholder: "Your work email",
    passwordPlaceholder: "Password",
    forgotPassword: "Forgot password?",
    submit: "Log In",
    divider: "or",
  },
  TR: {
    badge: "Yapay zeka müşteri destek platformu",
    heroTitle: "Destek çalışma alanına tekrar hoş geldin",
    heroText: "Görüşmeleri, ürünleri, yönlendirmeleri ve AI aksiyonlarını tek panelden yönet.",
    heroFooter: "Hızlı destek ekipleri için geliştirildi",
    title: "Tekrar hoş geldin",
    subtitle: "TODO hesabına giriş yap",
    emailPlaceholder: "İş e-posta adresin",
    passwordPlaceholder: "Şifre",
    forgotPassword: "Şifreni mi unuttun?",
    submit: "Giriş Yap",
    divider: "veya",
  },
  AZ: {
    badge: "AI müştəri dəstək platforması",
    heroTitle: "Dəstək iş məkanına yenidən xoş gəldin",
    heroText: "Mesajları, məhsulları, guidance hissəsini və AI action-ları tək paneldən idarə et.",
    heroFooter: "Sürətli dəstək komandaları üçün hazırlanıb",
    title: "Yenidən xoş gəldin",
    subtitle: "TODO hesabına daxil ol",
    emailPlaceholder: "İş e-poçtun",
    passwordPlaceholder: "Şifrə",
    forgotPassword: "Şifrəni unutmusan?",
    submit: "Daxil ol",
    divider: "və ya",
  },
  RU: {
    badge: "Платформа поддержки клиентов на базе ИИ",
    heroTitle: "С возвращением в рабочее пространство поддержки",
    heroText: "Управляйте диалогами, товарами, guidance и AI actions из одной панели.",
    heroFooter: "Создано для быстрых команд поддержки",
    title: "С возвращением",
    subtitle: "Войдите в аккаунт TODO",
    emailPlaceholder: "Рабочий email",
    passwordPlaceholder: "Пароль",
    forgotPassword: "Забыли пароль?",
    submit: "Войти",
    divider: "или",
  },
};

function getPageMeta(page) {
  switch (page) {
    case "home":
      return { title: "Dashboard", searchPlaceholder: "Search...", showTestButton: false };
    case "inbox":
      return { title: "Inbox", searchPlaceholder: "Search in Inbox...", showTestButton: false };
    case "dashboard":
      return { title: "Hub", searchPlaceholder: "Search...", showTestButton: true };
    case "data-sources":
      return { title: "Data sources", searchPlaceholder: "Search data sources...", showTestButton: false };
    case "products":
      return { title: "Products", searchPlaceholder: "Search products...", showTestButton: false };
    case "suggestions":
      return { title: "Suggestions", searchPlaceholder: "Search suggestions...", showTestButton: true };
    case "guidance":
      return { title: "Guidance", searchPlaceholder: "Search guidance...", showTestButton: true };
    case "actions":
      return { title: "Actions", searchPlaceholder: "Search actions...", showTestButton: true };
    case "playground":
      return { title: "Playground", searchPlaceholder: "Search questions...", showTestButton: false };
    case "configure":
      return { title: "Configure", searchPlaceholder: "Search settings...", showTestButton: true };
    default:
      return { title: "Lyro AI Agent", searchPlaceholder: "Search...", showTestButton: false };
  }
}

function formatCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getInitialMessages(conversationId) {
  return initialMessagesByConversation[conversationId] || [
    {
      id: `empty-${conversationId}`,
      sender: "system",
      author: "Automatic message",
      time: "Now",
      text: "No messages yet in this conversation.",
    },
  ];
}

function TopBar({ title, searchPlaceholder, showTestButton = false }) {
  return (
    <div className="flex h-[58px] shrink-0 items-center justify-between rounded-t-[16px] border-b border-[#dfe5ee] bg-[#f6f8fb] px-0">
      <div className="flex min-w-0 items-center pl-0">
        <div className="w-[58px] shrink-0" />
        <div className="w-[214px] shrink-0 pl-22 text-[19px] font-semibold tracking-[-0.02em] text-[#111827]" style={{ paddingLeft: 28 }}>
          {title}
        </div>
        <div className="flex w-[300px] shrink-0 items-center px-0">
          <div className="ml-[-4px] flex h-9 w-[292px] items-center rounded-full bg-[#edf1f6] px-4 text-[13px] text-[#8390a4] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <span className="mr-2 text-[14px]">⌕</span>
            {searchPlaceholder}
          </div>
        </div>
      </div>
      <div className="mr-6 flex items-center gap-5 text-[13px] text-[#2a3344]">
        <span className="text-[16px] text-[#64748b]">?</span>
        <div className="relative">
          <span className="text-[16px] text-[#64748b]">🔔</span>
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff445a] px-1 text-[9px] font-semibold text-white">26</span>
        </div>
        <div className="flex items-center gap-2 text-[#2e384a]">
          <span className="text-[16px] text-[#94a3b8]">◔</span>
          <span>Usage and plan</span>
          <span className="text-[10px] text-[#94a3b8]">▼</span>
        </div>
        {showTestButton ? <button className="rounded-[10px] border border-[#d6dee9] bg-white px-4 py-[8px] text-[13px] font-medium text-[#111827]">◉ Test Lyro</button> : null}
        <button className="rounded-[9px] bg-[#4ee06f] px-5 py-[10px] text-[13px] font-semibold text-[#0b3013] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          Upgrade
        </button>
      </div>
    </div>
  );
}

function LeftRail({ activePage, onSelectPage }) {
  const isHomeActive = activePage === "home";
  return (
    <aside className="flex w-[58px] shrink-0 flex-col items-center border-r border-[#dfe5ee] bg-[#f5f7fa] py-3">
      <button type="button" onClick={() => onSelectPage("home")} className="relative mb-5 outline-none">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${isHomeActive ? "bg-[#dfe9ff]" : ""}`}>
          <img src={railIcon} alt="TODO icon" className="h-5 w-5 object-contain" />
        </div>
      </button>

      <div className="flex flex-col items-center gap-3">
        {leftIcons.map((item) => {
          const pageKey = item.key === "inbox" ? "inbox" : "dashboard";
          const isActive = pageKey === "inbox" ? activePage === "inbox" : (activePage !== "inbox" && activePage !== "home");

          return (
            <button key={item.key} type="button" className="relative" onClick={() => onSelectPage(pageKey)}>
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-[12px] ${
                  isActive ? "bg-[#dfe9ff]" : "bg-transparent"
                }`}
              >
                <span className={`inline-flex items-center justify-center ${isActive ? "text-[#24406f]" : "text-[#31415f]"}`}>
                  {item.svg}
                </span>
              </div>
              {item.badge ? (
                <span className="absolute right-[4px] top-[4px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#ef233c] px-[4px] text-[9px] font-semibold leading-none text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dde5ee] text-[#a0acbb]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="9" r="4" fill="#c7d2df"/>
            <path d="M5 20c1.8-3.4 4.4-5 7-5s5.2 1.6 7 5" fill="#c7d2df"/>
          </svg>
        </div>
        <span className="absolute bottom-[1px] right-0 h-[8px] w-[8px] rounded-full border border-white bg-[#22c55e]" />
      </div>
    </aside>
  );
}

function SectionHeader({ title, caret = true, plus = false }) {
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#111827]">
      <div className="flex items-center gap-1">
        <span>{title}</span>
        {caret ? <span className="text-[10px] text-[#64748b]">⌄</span> : null}
      </div>
      {plus ? <span className="text-[18px] font-normal text-[#94a3b8]">＋</span> : null}
    </div>
  );
}

function SidebarRow({ item, muted = false }) {
  return (
    <button
      className={`mx-2 mb-1 flex h-9 w-[208px] items-center justify-between rounded-[11px] px-3 text-left text-[13px] ${item.active ? "bg-[#dfe9ff] text-[#11306a]" : muted ? "text-[#1f2a3d] hover:bg-[#eef2f7]" : "text-[#1f2a3d] hover:bg-[#eef2f7]"}`}
    >
      <span className="flex items-center gap-3">
        <span className="w-4 text-center text-[14px]">{item.emoji}</span>
        <span className={`${item.active ? "font-medium" : "font-normal"}`}>{item.label}</span>
      </span>
      <span className="flex items-center gap-2">
        {item.suffix ? <span className="text-[12px] text-[#2563eb]">{item.suffix}</span> : null}
        {item.badge ? <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ef233c] px-1 text-[10px] font-semibold text-white">{item.badge}</span> : null}
        {item.withMenu ? <span className="text-[#94a3b8]">⋮</span> : null}
      </span>
    </button>
  );
}

function Sidebar() {
  return (
    <aside className="flex w-[214px] shrink-0 flex-col border-r border-[#dfe5ee] bg-[#f5f7fa]">
      <SectionHeader title="Live conversations" />
      <div>{liveConversations.map((item) => <SidebarRow key={item.label} item={item} />)}</div>
      <SectionHeader title="Tickets" plus />
      <div>{tickets.map((item) => <SidebarRow key={item.label} item={item} muted />)}</div>
      <div className="pt-4">{utilityItems.map((item) => <SidebarRow key={item.label} item={item} muted />)}</div>
      <SectionHeader title="Views" plus />
      <div>{views.map((item) => <SidebarRow key={item.label} item={item} muted />)}</div>
      <SectionHeader title="Agents" />
      <div>{agents.map((item) => <SidebarRow key={item.label} item={item} muted />)}</div>
    </aside>
  );
}

function Avatar({ color, initials, count, smallDot = false }) {
  return (
    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ backgroundColor: color }}>
      {count ? count : initials || "•"}
      {smallDot ? <span className="absolute right-[-2px] top-[15px] h-[7px] w-[7px] rounded-full bg-[#ff3d59] border border-white" /> : null}
    </div>
  );
}

function ConversationList({ items, activeConversationId, onSelectConversation }) {
  return (
    <section className="flex w-[268px] shrink-0 flex-col border-r border-[#dfe5ee] bg-white">
      <div className="flex h-[58px] items-center border-b border-[#dfe5ee] px-4">
        <button className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#d6dee9] bg-[#f8fafc] text-[14px] text-[#94a3b8]">‹</button>
        <span className="mr-3 text-[22px]">📬</span>
        <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1f2937]">My open</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {items.map((item, idx) => {
          const selected = item.id === activeConversationId;
          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => onSelectConversation(item.id)}
              className={`mx-2 my-[6px] flex w-[250px] items-start gap-3 rounded-[12px] px-3 py-3 text-left ${selected ? "bg-[#f1f4f8]" : "hover:bg-[#f8fafc]"}`}
            >
              <Avatar color={item.color} initials={item.initials || item.name[0]} count={item.count} smallDot={item.dot} />
              <div className="min-w-0 flex-1 pt-[1px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate text-[12.5px] font-medium text-[#111827]">{item.name}</div>
                  <div className="shrink-0 pt-[1px] text-[12px] text-[#111827]">{item.time}</div>
                </div>
                <div className="mt-[1px] truncate text-[11px] text-[#6b82a7]">{item.source}</div>
                <div className={`mt-[2px] truncate text-[12px] ${selected || idx === 4 ? "font-semibold text-[#111827]" : "text-[#111827]"}`}>{item.preview}</div>
              </div>
              <div className="mt-4 h-5 w-5 rounded-full bg-[#e8edf3]" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TopMessageBar({ conversation }) {
  return (
    <div className="flex h-[50px] items-center justify-between border-b border-[#dfe5ee] bg-white px-5">
      <div className="flex items-center gap-3 text-[13px]">
        <span className="text-[#7a8699]">Assignee</span>
        <div className="flex items-center gap-2 rounded-full border border-[#d5dde8] bg-white px-3 py-[6px] text-[13px] text-[#111827] shadow-[0_1px_0_rgba(255,255,255,0.8)]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dfe5ee] text-[12px] text-[#94a3b8]">◔</span>
          {conversation.assignee}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-[10px] border border-[#cfd8e3] bg-white px-4 py-[7px] text-[13px] font-medium text-[#273449] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <span className="text-[#2fb65c]">☑</span>
          Solve
        </button>
        <span className="text-[#64748b]">✚</span>
        <span className="text-[#64748b]">⋮</span>
      </div>
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
      <div className="max-w-[420px] text-[15px] leading-[1.35] text-[#111827]">
        {message.text}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button className="rounded-[10px] bg-[#dfe9ff] px-4 py-[6px] text-[13px] font-medium text-[#2563eb]">Add to input</button>
        <button className="rounded-[10px] border border-[#ccd6e3] bg-white px-4 py-[6px] text-[13px] text-[#111827]">Cancel</button>
        <button className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-[#ccd6e3] bg-[#f8fafc] text-[#64748b]">…</button>
      </div>
    </div>
  );
}

function ChatCenter({ conversation, messages, draftMessage, onDraftChange, onSendMessage }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-[#dfe5ee] bg-white">
      <TopMessageBar conversation={conversation} />
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="flex h-full flex-col">
          <div className="flex-1 px-5 pb-2 pt-4">
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
                    <div>
                      <div className="text-[15px] leading-[1.3] text-[#111827]"><span className="font-medium">{message.author}</span> <span className="text-[#6e83a6] text-[13px]">{message.time}</span></div>
                      <div className="text-[15px] leading-[1.35] text-[#111827] whitespace-pre-line">{message.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t-[3px] border-[#2c6cff]" />
          <div className="h-[47px] border-b border-[#dfe5ee] bg-[#f3f4f6] px-5">
            <div className="flex h-full items-center gap-3 text-[14px] text-[#273449]">
              <span className="rounded-full bg-[#8e9cb0] text-white h-4 w-4 inline-flex items-center justify-center text-[10px]">✓</span>
              <span className="text-[11px] text-[#7a8699]">▼</span>
              <span className="font-medium">{conversation.channel}</span>
            </div>
          </div>
          <div className="bg-[#fbfcfe] px-5 py-4">
            <textarea
              value={draftMessage}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Write a message..."
              className="min-h-[66px] w-full resize-none border-0 bg-transparent text-[15px] leading-[1.3] text-[#111827] outline-none placeholder:text-[#7d89a2]"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[#6b82a7]">
                <span className="text-[18px]">🤖</span>
                <span className="text-[18px]">🪄</span>
                <span className="text-[16px]">↯</span>
                <span className="text-[18px]">⌘</span>
                <span className="text-[18px]">⌥</span>
                <span className="ml-4 text-[18px]">📎</span>
                <span className="text-[18px]">☺</span>
                <span className="mx-2 h-6 w-px bg-[#d6dee9]" />
                <span className="text-[18px]">⊞</span>
              </div>
              <button
                onClick={onSendMessage}
                disabled={!draftMessage.trim()}
                className={`rounded-[10px] px-6 py-[10px] text-[13px] font-medium ${draftMessage.trim() ? "bg-[#2563eb] text-white" : "bg-[#eef2f7] text-[#a1acbb]"}`}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RightPanel({ conversation }) {
  return (
    <aside className="flex w-[210px] shrink-0 flex-col bg-white">
      <div className="flex h-[50px] items-end gap-6 border-b border-[#dfe5ee] px-5 pt-2 text-[14px]">
        <div className="border-b-[3px] border-[#2c6cff] pb-[11px] font-medium text-[#2563eb]">Info</div>
        <div className="pb-3 text-[#111827]">Viewed pages</div>
        <div className="pb-3 text-[#111827]">Notes</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-[#dfe5ee] px-5 py-6">
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">Customer data</div>
          <div className="space-y-5 text-[13px] text-[#334155]">
            <div className="flex items-center gap-3">
              <span className="w-4 text-center text-[#9aa5b5]">👥</span>
              <span>{conversation.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 text-center text-[#9aa5b5]">✉</span>
              <span>{conversation.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 text-center text-[#9aa5b5]">◔</span>
              <div className="flex h-6 items-center justify-center rounded-[8px] border border-[#d6dee9] bg-[#f8fafc] px-3 text-[#64748b]">{conversation.status} <span className="ml-2 text-[10px]">▼</span></div>
            </div>
            <div className="flex items-center gap-3"><span className="w-4 text-center text-[#9aa5b5]">📞</span><span>{conversation.phone}</span></div>
            <div className="flex items-center gap-3 text-[#6b82a7]"><span className="w-4 text-center text-[#9aa5b5]">🏷</span><span>Add a customer tag...</span></div>
            <div className="flex items-center gap-3 text-[#6b82a7]"><span className="w-4 text-center text-[#9aa5b5]">📁</span><span>Add a contact property...</span></div>
          </div>
        </div>
        <div className="px-5 py-6">
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#111827]">Satisfaction survey</div>
          <div className="flex items-start gap-3 text-[13px] leading-[1.35] text-[#6b82a7]">
            <span className="mt-[1px] text-[#9aa5b5]">ⓘ</span>
            <span>We are not collecting satisfaction ratings on Messenger.</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AdminSidebar({ activePage, onSelectPage }) {
  const [knowledgeOpen, setKnowledgeOpen] = useState(true);
  const [behaviorOpen, setBehaviorOpen] = useState(true);
  const primaryItems = adminNavItems.filter((item) => !item.nested);
  const knowledgeChildren = adminNavItems.filter((item) => item.nested && ["data-sources", "products", "suggestions"].includes(item.key));
  const behaviorChildren = adminNavItems.filter((item) => item.nested && ["guidance", "actions"].includes(item.key));

  function renderNavButton(item, options = {}) {
    const isActive = activePage === item.key;
    const isNested = options.nested || false;
    const isOpen = options.open;
    const onToggle = options.onToggle;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => {
          if (onToggle) {
            onToggle();
            return;
          }

          onSelectPage(item.key === "knowledge" || item.key === "behavior" ? activePage : item.key);
        }}
        className={`flex h-9 w-full items-center justify-between rounded-[10px] px-3 text-left text-[14px] ${isActive ? "bg-[#dfe9ff] text-[#11306a]" : "text-[#334155] hover:bg-[#eef2f7]"}`}
      >
        <span className={`flex items-center gap-[10px] ${isNested ? "pl-4" : ""}`}>
          <span className="inline-flex h-[15px] w-[15px] items-center justify-center">
            <AdminSidebarIcon name={item.icon} active={isActive} />
          </span>
          <span>{item.label}</span>
        </span>
        {item.caret ? (
          <span className="inline-flex h-4 w-4 items-center justify-center text-[#334155]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`${isOpen === false ? "-rotate-90" : "rotate-0"} transition-transform duration-150`}>
              <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <aside className="flex w-[228px] shrink-0 flex-col border-r border-[#dfe5ee] bg-[#f5f7fa] px-3 py-4">
      <div className="space-y-1">
        {primaryItems.filter((item) => item.key === "dashboard").map((item) => renderNavButton(item))}
        {primaryItems.filter((item) => item.key === "knowledge").map((item) => (
          <div key={item.key} className="space-y-1">
            {renderNavButton(item, { open: knowledgeOpen, onToggle: () => setKnowledgeOpen((value) => !value) })}
            {knowledgeOpen ? <div className="space-y-1">{knowledgeChildren.map((child) => renderNavButton(child, { nested: true }))}</div> : null}
          </div>
        ))}
        {primaryItems.filter((item) => item.key === "behavior").map((item) => (
          <div key={item.key} className="space-y-1">
            {renderNavButton(item, { open: behaviorOpen, onToggle: () => setBehaviorOpen((value) => !value) })}
            {behaviorOpen ? <div className="space-y-1">{behaviorChildren.map((child) => renderNavButton(child, { nested: true }))}</div> : null}
          </div>
        ))}
        {primaryItems.filter((item) => ["playground", "configure"].includes(item.key)).map((item) => renderNavButton(item))}
      </div>
      <div className="mt-auto border-t border-[#e5eaf1] px-1 pt-4">
        {secondaryAdminNavItems.map((item) => (
          <button key={item.key} type="button" className="mb-1 flex h-9 w-full items-center justify-between rounded-[10px] px-2 text-left text-[14px] text-[#334155] hover:bg-[#eef2f7]">
            <span className="flex items-center gap-[10px]">
              <span className="inline-flex h-[15px] w-[15px] items-center justify-center">
                <AdminSidebarIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </span>
            <span className="inline-flex h-4 w-4 items-center justify-center text-[#64748b]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 16 16 8M10 8h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function DashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 gap-4 bg-[#f6f8fb] p-4">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-4">
          <div className="flex items-center justify-between rounded-[14px] border border-[#dfe5ee] bg-[#f8fbff] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#7bd88f] text-[12px] font-semibold text-[#111827]">3/5</div>
              <div>
                <div className="text-[16px] font-semibold text-[#111827]">Finalize your TODO setup</div>
                <div className="text-[13px] text-[#64748b]">Let's get you setup to delight your customers. It's super easy and only takes a few minutes.</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-[10px] border border-[#d6dee9] bg-white px-4 py-2 text-[13px] text-[#111827]">Skip</button>
              <button className="rounded-[10px] border border-[#cfe0ff] bg-[#edf4ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">Finish setup</button>
            </div>
          </div>

          <div className="mt-4 text-[20px] font-semibold text-[#111827]">Quick actions</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {quickActions.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-[14px] border border-[#dfe5ee] bg-white px-4 py-[14px] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <span className="mt-[2px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[#64748b]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d={item.iconPath} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="text-[14px] font-medium text-[#111827]">{item.title}</div>
                  <div className="mt-[2px] text-[13px] text-[#2563eb]">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-[20px] font-semibold text-[#111827]">Performance</div>
            <div className="rounded-[10px] border border-[#d6dee9] bg-white px-3 py-2 text-[12px] text-[#64748b]">18 Mar 2026 - 16 Apr 2026</div>
          </div>
          <div className="mt-3 rounded-[16px] border border-[#dfe5ee] bg-white p-4">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-[#f8fbff] p-4 text-[13px] leading-[1.45] text-[#334155]">
              Eliminate repetitive questions from your team's workload. Answer up to 70% of customer inquiries with human-like conversations in an instant. While traditional teams have an average response time of 2 minutes, Lyro answers questions in under 6 seconds.
            </div>
            <div className="mt-4 border-b border-[#e8edf3] pb-4">
              <div className="flex gap-0">
                <div className="min-w-0 flex-1 border-b-[3px] border-[#2563eb] pb-3 pr-6">
                  <div className="text-[13px] text-[#64748b]">Interactions <span className="text-[#94a3b8]">?</span></div>
                  <div className="text-[36px] font-semibold text-[#111827]">0</div>
                </div>
                <div className="min-w-0 flex-1 pb-3 pr-6">
                  <div className="text-[13px] text-[#64748b]">Lyro AI Agent resolution rate <span className="text-[#94a3b8]">?</span></div>
                  <div className="text-[36px] font-semibold text-[#111827]">0%</div>
                </div>
                <div className="min-w-0 flex-1 pb-3 pr-6">
                  <div className="text-[13px] text-[#64748b]">Leads acquired <span className="text-[#94a3b8]">?</span></div>
                  <div className="text-[36px] font-semibold text-[#111827]">0</div>
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <div className="mt-4 text-[13px] text-[#2563eb]">Set up Lyro AI Agent</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { dot: "#2563eb", label: "Replied live\nconversations", val: "0" },
                  { dot: "#f59e0b", label: "Replied\ntickets", val: "0" },
                  { dot: "#3b82f6", label: "Flows\ninteractions", val: "0" },
                  { dot: "#ec4899", label: "Lyro AI Agent\nconversations", val: "0" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: m.dot }} />
                      <span className="text-[11px] text-[#64748b]">{m.label.split("\n").map((l, i) => <span key={i}>{l}{i === 0 ? <br /> : null}</span>)}</span>
                      <span className="ml-auto text-[11px] text-[#94a3b8]">?</span>
                    </div>
                    <div className="mt-1 text-[22px] font-semibold text-[#111827]">{m.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 h-[330px] rounded-[14px] bg-gradient-to-b from-[#ffffff] to-[#f8fafc] px-4 py-3 text-[12px] text-[#94a3b8]">
              <div className="mb-4 flex justify-between"><span>10</span><span>Apr 14</span></div>
              <div className="space-y-6">
                <div className="h-px bg-[#e5eaf1]" />
                <div className="h-px bg-[#e5eaf1]" />
                <div className="h-px bg-[#e5eaf1]" />
                <div className="h-px bg-[#e5eaf1]" />
                <div className="h-px bg-[#e5eaf1]" />
                <div className="h-px bg-[#e5eaf1]" />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-[20px] font-semibold text-[#111827]">News Feed</div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="overflow-hidden rounded-[16px] border border-[#dfe5ee] bg-white">
                  <div className="flex h-[120px] items-start justify-between bg-[#e8fbef] p-4">
                    <div className="rounded-full bg-[#1fb66a] px-2 py-1 text-[11px] font-semibold text-white">NEW</div>
                    <div className="text-[24px] font-semibold text-[#25a56a]">Judge.me</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-[14px] text-[#111827]">Build trust with Judge.me reviews</div>
                    <div className="mt-6 text-[13px] text-[#2563eb]">Connect now</div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-[16px] border border-[#dfe5ee] bg-white">
                  <div className="flex h-[120px] items-center justify-center bg-[#eef2ff] p-4 text-center text-[28px] font-semibold text-[#111827]">AI in Ecomm 2026</div>
                  <div className="p-4 text-center">
                    <div className="text-[14px] text-[#111827]">Learn what's happening now and prepare for the future</div>
                    <div className="mt-6 text-[13px] text-[#2563eb]">Get the free report</div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-[16px] border border-[#dfe5ee] bg-white">
                  <div className="flex h-[120px] items-center justify-center bg-[#dbeafe] p-4 text-center text-[28px] font-semibold text-[#0f2b68]">Leave your review</div>
                  <div className="p-4 text-center">
                    <div className="text-[14px] text-[#111827]">Review TODO on Gartner, get $25</div>
                    <div className="mt-6 text-[13px] text-[#2563eb]">Share your experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[268px] shrink-0 space-y-4">
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-4">
          <div className="text-[18px] font-semibold text-[#111827]">Project status</div>
          <div className="mt-4 space-y-4 text-[13px]">
            <div className="flex items-start justify-between gap-3"><div><div className="font-medium text-[#111827]">Chat Widget</div><div className="text-[#64748b]">ripcrack.net</div></div><span className="text-[#22c55e]">◉</span></div>
            <div className="flex items-start justify-between gap-3"><div><div className="font-medium text-[#111827]">Mailbox</div><div className="text-[#64748b]">Mailbox verification in progress</div><div className="text-[#2563eb]">Go to Email</div></div><span className="text-[#f59e0b]">△</span></div>
            <div className="flex items-start justify-between gap-3"><div><div className="font-medium text-[#111827]">Domains</div><div className="text-[#2563eb]">Connect domain</div></div></div>
            <div className="flex items-start justify-between gap-3"><div><div className="font-medium text-[#111827]">Facebook</div><div className="text-[#64748b]">Accounts connected (5)</div><div className="mt-3 text-[#94a3b8]">Add a channel: ⓘ ☺︎</div></div><span className="text-[#22c55e]">◉</span></div>
          </div>
        </div>
        <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-4">
          <div className="text-[18px] font-semibold text-[#111827]">Current usage</div>
          <div className="mt-4 space-y-4 text-[13px]">
            <div>
              <div className="font-medium text-[#111827]">Customer service</div>
              <div className="text-[#64748b]">Billable conversations</div>
              <div className="mt-1 flex items-center justify-between"><span>0 / 50</span><div className="h-1.5 w-[92px] rounded-full bg-[#eef2f7]" /></div>
            </div>
            <div>
              <div className="font-medium text-[#111827]">Lyro AI Agent</div>
              <div className="text-[#64748b]">AI conversations</div>
              <div className="mt-1 flex items-center justify-between"><span>24 / 50</span><div className="h-1.5 w-[92px] rounded-full bg-[#eef2f7]"><div className="h-1.5 w-[44px] rounded-full bg-[#2563eb]" /></div></div>
            </div>
            <div>
              <div className="font-medium text-[#111827]">Flows</div>
              <div className="text-[#64748b]">Visitors reached</div>
              <div className="mt-1 flex items-center justify-between"><span>0 / 100</span><div className="h-1.5 w-[92px] rounded-full bg-[#eef2f7]" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionsPage() {
  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb] p-4">
      <div className="min-h-0 flex-1 rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="text-[20px] font-semibold text-[#111827]">Suggestions</div>
        <div className="mt-1 text-[14px] text-[#64748b]">Complete suggested questions to help Lyro handle similar queries, based on unanswered customer issues and past operator Q&amp;A.</div>
        <div className="mt-5 rounded-[16px] bg-[#f4f7fb] p-4">
          <div className="text-[16px] font-semibold text-[#111827]">Boost the AI Agent knowledge</div>
          <div className="mt-2 max-w-[720px] text-[14px] leading-[1.5] text-[#334155]">The AI Agent collects similar unanswered questions or questions previously resolved by operators and suggests answers. Just review and add them — they'll appear in Knowledge and Data sources and help both the AI Agent and Copilot respond better.</div>
          <div className="mt-3 text-[14px] text-[#2563eb]">◫ Learn about Suggestions</div>
        </div>
        <div className="mt-4 flex h-[540px] items-center justify-center rounded-[18px] border border-[#dfe5ee] bg-white">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f0ff] text-[#2563eb]">✣</div>
            <div className="mt-4 text-[18px] font-semibold text-[#111827]">No suggestions to review</div>
            <div className="mt-2 max-w-[540px] text-[14px] text-[#64748b]">The AI Agent will add its own unanswered customer questions or those resolved by operators. Add these suggestions to Lyro knowledge to improve resolution rates.</div>
            <div className="mt-3 text-[14px] text-[#2563eb]">Learn more</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb] p-4">
      <div className="min-h-0 flex-1 rounded-[20px] border border-[#dfe5ee] bg-white p-5 text-center">
        <div className="mx-auto flex h-[240px] max-w-[520px] items-center justify-center rounded-[16px] bg-[#f5f7fb]">
          <div className="space-y-3">
            <div className="text-[14px] text-[#64748b]">Product recommendation preview</div>
            <div className="flex gap-3">
              <div className="h-[110px] w-[90px] rounded-[12px] bg-[#9c6b5f]" />
              <div className="h-[110px] w-[90px] rounded-[12px] bg-[#6d625f]" />
              <div className="h-[110px] w-[90px] rounded-[12px] bg-[#aa7f63]" />
            </div>
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-[540px] text-[20px] font-semibold leading-[1.25] text-[#111827]">Turn every product question into a sales opportunity</div>
        <div className="mx-auto mt-3 max-w-[520px] text-[14px] text-[#64748b]">Provide your product listing so Lyro can answer product-related questions.</div>
        <button className="mt-5 rounded-[10px] bg-[#2563eb] px-6 py-3 text-[14px] font-medium text-white">Sync products</button>
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#e5eaf1] pt-5 text-left">
          {productBenefits.map((item) => (
            <div key={item.title} className="px-4">
              <div className="text-[14px] font-medium text-[#111827]">{item.title}</div>
              <div className="mt-2 text-[13px] leading-[1.45] text-[#64748b]">{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GuidancePage() {
  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb] p-4">
      <div className="min-h-0 flex-1 rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="rounded-[16px] bg-[#f4f7fb] p-4">
          <div className="text-[18px] font-semibold text-[#111827]">Provide Lyro with specific guidance</div>
          <div className="mt-2 max-w-[720px] text-[14px] leading-[1.5] text-[#334155]">Train your AI Agent to provide precise responses and handle escalations when needed. It adapts to your tone, clarification process, and escalation rules to deliver consistent, scalable support.</div>
          <div className="mt-3 text-[14px] text-[#2563eb]">◫ How to use Guidance</div>
        </div>

        <div className="mt-6 text-[20px] font-semibold text-[#111827]">Guidance</div>
        <div className="mt-1 text-[14px] text-[#64748b]">Train Lyro to follow your team's approach — communicating clearly, resolving issues, and escalating when needed, just like your team would.</div>

        <div className="mt-6 border-b border-[#e5eaf1] pb-6">
          <div className="text-[16px] font-semibold text-[#111827]">Basic answer personalization</div>
          <div className="mt-4 space-y-4 max-w-[300px]">
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#111827]">Use emojis 🙂</span><span className="h-6 w-11 rounded-full bg-[#2563eb] px-1"><span className="mt-[2px] block h-5 w-5 translate-x-5 rounded-full bg-white" /></span></div>
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#111827]">&quot;Read more&quot; links</span><span className="h-6 w-11 rounded-full bg-[#2563eb] px-1"><span className="mt-[2px] block h-5 w-5 translate-x-5 rounded-full bg-white" /></span></div>
          </div>
        </div>

        <div className="py-6 border-b border-[#e5eaf1]">
          <div className="text-[16px] font-semibold text-[#111827]">Communication style</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Create customized guidance on the vocabulary and terms Lyro should use.</div>
          <div className="mt-4 overflow-hidden rounded-[14px] border border-[#dfe5ee]">
            <div className="grid grid-cols-[1fr_180px] bg-[#fbfcfe] px-4 py-3 text-[13px] text-[#64748b]"><span>Name</span><span>Audience</span></div>
            {guidanceRows.map((row) => (
              <div key={row.name} className="grid grid-cols-[1fr_180px] items-start border-t border-[#eef2f7] px-4 py-3 text-[14px]">
                <div>
                  <div className="font-medium text-[#111827]">{row.name}</div>
                  <div className="text-[#64748b]">{row.note}</div>
                </div>
                <div className="flex items-center justify-between"><span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[12px] text-[#64748b]">{row.audience}</span><span className="text-[#94a3b8]">⋮</span></div>
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[14px] font-medium text-[#2563eb]">+ Add</button>
        </div>

        <div className="py-6 border-b border-[#e5eaf1]">
          <div className="text-[16px] font-semibold text-[#111827]">Handoff and escalation</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Create customized guidance when Lyro should route straight to your team.</div>
          <button className="mt-4 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[14px] font-medium text-[#2563eb]">+ Add</button>
        </div>

        <div className="py-6">
          <div className="text-[16px] font-semibold text-[#111827]">Other</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Create any other guidance you want Lyro to follow.</div>
          <button className="mt-4 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[14px] font-medium text-[#2563eb]">+ Add</button>
        </div>
      </div>
    </div>
  );
}

function ActionsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="rounded-[16px] bg-[#f4f7fb] p-4">
          <div className="text-[18px] font-semibold text-[#111827]">Meet Actions - AI that works like your team would</div>
          <div className="mt-2 max-w-[760px] text-[14px] leading-[1.5] text-[#334155]">Lyro can now do more than just respond: it connects to your systems via API to execute real tasks, just like a human.</div>
          <div className="mt-3 text-[14px] text-[#2563eb]">◫ Learn about Actions</div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <div className="text-[20px] font-semibold text-[#111827]">Actions</div>
            <div className="mt-1 text-[14px] text-[#64748b]">Lyro can perform actions across your apps and services via API calls, delivering a more engaging and personalized conversation experience.</div>
          </div>
          <div className="flex gap-3">
            <button className="rounded-[10px] border border-[#d6dee9] bg-white px-4 py-2 text-[13px] font-medium text-[#111827]">◉ Test Lyro</button>
            <button className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">+ Create Action</button>
          </div>
        </div>

        <div className="mt-5 flex gap-6 border-b border-[#e5eaf1] text-[15px]">
          <div className="border-b-[3px] border-[#2563eb] pb-3 font-medium text-[#2563eb]">My Actions</div>
          <div className="pb-3 text-[#111827]">Templates</div>
        </div>

        <div className="mt-4 rounded-[18px] border border-[#dfe5ee] px-5 py-10 text-center">
          <div className="text-[18px] font-semibold text-[#111827]">You have no Actions yet</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Start creating your first Action or use one of our templates</div>
          <div className="mt-5 flex justify-center gap-3">
            <button className="rounded-[10px] border border-[#d6dee9] px-4 py-2 text-[13px]">Create from scratch</button>
            <button className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">Explore templates</button>
          </div>
        </div>

        <div className="mt-6 rounded-[18px] border border-[#dfe5ee] p-5">
          <div className="text-[18px] font-semibold text-[#111827]">Explore how Lyro can do more with templates</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Templates let you get started quickly with minimal setup.</div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {actionTemplates.map((item) => (
              <div key={item.title} className="rounded-[16px] border border-[#dfe5ee] p-5">
                <div className="text-[18px] font-semibold leading-[1.25] text-[#111827]">{item.title}</div>
                <div className="mt-3 text-[14px] leading-[1.5] text-[#64748b]">{item.body}</div>
                {item.title === "Explore all templates" ? <button className="mt-5 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">Explore all →</button> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaygroundPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="flex gap-6 border-b border-[#e5eaf1] text-[15px]">
          <div className="border-b-[3px] border-[#2563eb] pb-3 font-medium text-[#2563eb]">Live chat</div>
          <div className="pb-3 text-[#111827]">Email</div>
        </div>
        <div className="mt-4 grid grid-cols-[320px_1fr] gap-6 rounded-[18px] border border-[#dfe5ee] p-6">
          <div className="rounded-[20px] border border-[#e5eaf1] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between text-[14px] text-[#111827]"><span>Hi there 👋</span><span>⋮</span></div>
            <div className="mt-24 flex justify-end"><div className="rounded-[12px] bg-[#4f2bd6] px-4 py-3 text-[14px] text-white">Hi</div></div>
            <div className="mt-4 inline-block rounded-[12px] bg-[#f6f7fb] px-4 py-3 text-[14px] text-[#111827]">Hello, how can I help you? 😊</div>
            <div className="mt-10 border-t border-[#e5eaf1] pt-3 text-[14px] text-[#94a3b8]">Enter your message...</div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[20px] font-semibold text-[#111827]">Test Lyro with your knowledge</div>
              <div className="text-[14px] text-[#2563eb]">↻ Reset test</div>
            </div>
            <div className="mt-3 text-[14px] text-[#64748b]">Type a question or try the following examples to see how Lyro responds.</div>
            <div className="mt-5 space-y-3">
              {playgroundPrompts.map((prompt) => (
                <div key={prompt} className="max-w-[520px] rounded-[16px] bg-[#eef2f7] px-4 py-3 text-[15px] text-[#111827]">{prompt}</div>
              ))}
            </div>
            <div className="mt-5 text-[14px] text-[#2563eb]">Show other</div>
            <div className="mt-40 rounded-[14px] bg-[#f5f7fb] px-4 py-3 text-[13px] text-[#334155]">ⓘ To enhance Lyro's response quality and efficiency, keep adding more knowledge. <span className="text-[#2563eb]">Add more knowledge</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataSourcesPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[20px] font-semibold text-[#111827]">Data sources</div>
            <div className="mt-1 text-[14px] text-[#64748b]">Manage all imported website URLs, Q&amp;A entries, and knowledge sources for Lyro.</div>
          </div>
          <button className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">+ Add source</button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[16px] border border-[#dfe5ee]">
          <div className="grid grid-cols-[2fr_1fr_1fr_100px_120px_180px] bg-[#fbfcfe] px-4 py-3 text-[13px] text-[#64748b]">
            <span>Title</span><span>Type</span><span>Source</span><span>Status</span><span>Author</span><span>Updated at</span>
          </div>
          {dataSourceRows.map((row) => (
            <div key={`${row[0]}-${row[5]}`} className="grid grid-cols-[2fr_1fr_1fr_100px_120px_180px] items-center border-t border-[#eef2f7] px-4 py-3 text-[13px] text-[#111827]">
              <span>{row[0]}</span>
              <span>{row[1]}</span>
              <span className="text-[#64748b]">{row[2]}</span>
              <span><span className="rounded-full bg-[#eaf8ef] px-3 py-1 text-[12px] text-[#16a34a]">{row[3]}</span></span>
              <span className="text-[#64748b]">{row[4]}</span>
              <span className="text-[#64748b]">{row[5]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfigurePage({ activeTab, onChangeTab }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="flex gap-6 border-b border-[#e5eaf1] text-[15px]">
          {configureTabs.map((tab) => (
            <button key={tab} type="button" onClick={() => onChangeTab(tab)} className={`${activeTab === tab ? "border-b-[3px] border-[#2563eb] pb-3 font-medium text-[#2563eb]" : "pb-3 text-[#111827]"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "General" ? (
          <div className="py-6">
            <div className="text-[20px] font-semibold text-[#111827]">Main</div>
            <div className="mt-5 max-w-[440px] space-y-5">
              <div className="flex items-center justify-between"><span className="text-[14px] text-[#111827]">Activate</span><span className="h-6 w-11 rounded-full bg-[#e5eaf1] px-1"><span className="mt-[2px] block h-5 w-5 rounded-full bg-white" /></span></div>
              <div>
                <div className="mb-2 text-[14px] text-[#111827]">Lyro responds</div>
                <div className="rounded-[10px] border border-[#cfd8e3] px-4 py-3 text-[14px]">Always</div>
              </div>
            </div>
            <div className="mt-8 border-t border-[#e5eaf1] pt-6">
              <div className="text-[20px] font-semibold text-[#111827]">Channels</div>
              <div className="mt-2 text-[14px] text-[#64748b]">Select the channels on which Lyro should be visible to your customers.</div>
              <div className="mt-5 space-y-4 max-w-[460px] text-[14px]">
                <div className="flex items-center justify-between"><span>Live chat</span><span className="h-6 w-11 rounded-full bg-[#7aa7ff] px-1"><span className="mt-[2px] block h-5 w-5 translate-x-5 rounded-full bg-white" /></span></div>
                <div className="flex items-center justify-between"><span>Messenger</span><span className="h-6 w-11 rounded-full bg-[#e5eaf1] px-1"><span className="mt-[2px] block h-5 w-5 rounded-full bg-white" /></span></div>
                <div className="flex items-center justify-between"><span>Instagram</span><span className="text-[#2563eb]">Integrate</span></div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Handoff" ? (
          <div className="py-6 space-y-6">
            <div>
              <div className="text-[20px] font-semibold text-[#111827]">Handoff audiences</div>
              <div className="mt-2 text-[14px] text-[#64748b]">Choose which customers to exclude from the AI Agent.</div>
              <div className="mt-4 rounded-[10px] border border-[#cfd8e3] px-4 py-3 text-[14px] text-[#94a3b8] max-w-[380px]">Select audiences</div>
            </div>
            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[20px] font-semibold text-[#111827]">Handoff</div>
              <div className="mt-4 grid max-w-[520px] gap-4">
                <div className="rounded-[10px] border border-[#cfd8e3] px-4 py-3 text-[14px]">When agents are online — Transfer conversation to agent</div>
                <div className="rounded-[10px] border border-[#cfd8e3] px-4 py-3 text-[14px]">When agents are offline — Transfer conversation to agent</div>
              </div>
            </div>
            <div className="border-t border-[#e5eaf1] pt-6">
              <div className="text-[20px] font-semibold text-[#111827]">Predefined answers</div>
              <div className="mt-3 rounded-[12px] bg-[#eef4ff] px-4 py-3 text-[13px] text-[#334155]">Lyro automatically translates predefined answers into all enabled languages.</div>
              <div className="mt-4 space-y-5 max-w-[760px]">
                <div><div className="mb-2 text-[14px] text-[#111827]">Transfer conversation (agents are online)</div><div className="min-h-[96px] rounded-[10px] border border-[#cfd8e3] p-4 text-[14px]">Absolutely! I'm transferring you to a human right away</div></div>
                <div><div className="mb-2 text-[14px] text-[#111827]">Transfer conversation (agents are offline)</div><div className="min-h-[96px] rounded-[10px] border border-[#cfd8e3] p-4 text-[14px]">Currently, the team is unavailable, so I can't connect you. I'll pass along your message to our team, and they will contact you later.</div></div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Audiences" ? (
          <div className="py-6">
            <div className="rounded-[16px] bg-[#f4f7fb] p-4">
              <div className="text-[18px] font-semibold text-[#111827]">Use Lyro content to specific users</div>
              <div className="mt-2 max-w-[700px] text-[14px] text-[#334155]">Create and manage custom audiences to control which knowledge Lyro uses — ensuring consistently relevant answers.</div>
              <div className="mt-3 text-[14px] text-[#2563eb]">◫ How to use audiences to target Lyro</div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-[20px] font-semibold text-[#111827]">Audiences: 0</div>
              <div className="flex gap-3">
                <button className="rounded-[10px] border border-[#d6dee9] px-4 py-2 text-[13px]">↗ Manage knowledge</button>
                <button className="rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">+ Add audience</button>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-[14px] border border-[#dfe5ee]">
              <div className="grid grid-cols-[1fr_220px] bg-[#fbfcfe] px-4 py-3 text-[13px] text-[#64748b]"><span>Audience name</span><span>Filters</span></div>
              <div className="border-t border-[#eef2f7] px-4 py-5 text-[14px] text-[#64748b]">You don't have any audiences yet. <span className="text-[#2563eb]">Add first audience</span></div>
            </div>
          </div>
        ) : null}

        {activeTab === "Copilot" ? (
          <div className="py-6">
            <div className="rounded-[16px] bg-[#f4f7fb] p-4">
              <div className="text-[18px] font-semibold text-[#111827]">Copilot</div>
              <div className="mt-2 max-w-[700px] text-[14px] text-[#334155]">Copilot is your AI assistant powered by the knowledge you've added to Data Sources and past agents conversations.</div>
              <div className="mt-3 flex gap-4 text-[14px] text-[#2563eb]"><span>◌ Manage Copilot knowledge</span><span>◫ Learn about Copilot</span></div>
            </div>
            <div className="mt-6 border-b border-[#e5eaf1] pb-6">
              <div className="text-[20px] font-semibold text-[#111827]">Auto–suggestions</div>
              <div className="mt-2 text-[14px] text-[#64748b]">Automatically generates suggested replies in your Inbox.</div>
              <div className="mt-4 flex max-w-[300px] items-center justify-between"><span className="text-[14px] text-[#111827]">Auto–suggestions</span><span className="h-6 w-11 rounded-full bg-[#2563eb] px-1"><span className="mt-[2px] block h-5 w-5 translate-x-5 rounded-full bg-white" /></span></div>
            </div>
            <div className="pt-6">
              <div className="text-[20px] font-semibold text-[#111827]">Sources of suggestions</div>
              <div className="mt-2 text-[14px] text-[#64748b]">Choose what Copilot uses to suggest replies.</div>
              <div className="mt-5 space-y-4 text-[14px] text-[#111827]">
                <div className="flex items-center gap-3"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#2563eb] text-[10px] text-[#2563eb]">●</span><span>Knowledge + AI improvisations</span></div>
                <div className="flex items-center gap-3"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#94a3b8]" /><span>Knowledge</span></div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AdminPlaceholder({ activePage }) {
  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb] p-4">
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-[20px] border border-[#dfe5ee] bg-white text-center">
        <div>
          <div className="text-[28px] font-semibold text-[#111827]">{getPageMeta(activePage).title}</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Bu səhifənin tam dizaynını növbəti addımda screenshot-a uyğun quracağam.</div>
        </div>
      </div>
    </div>
  );
}

function AdminContent({ activePage, configureTab, onChangeConfigureTab }) {
  switch (activePage) {
    case "dashboard":
      return <DashboardPage />;
    case "suggestions":
      return <SuggestionsPage />;
    case "products":
      return <ProductsPage />;
    case "guidance":
      return <GuidancePage />;
    case "actions":
      return <ActionsPage />;
    case "playground":
      return <PlaygroundPage />;
    case "data-sources":
      return <DataSourcesPage />;
    case "configure":
      return <ConfigurePage activeTab={configureTab} onChangeTab={onChangeConfigureTab} />;
    default:
      return <AdminPlaceholder activePage={activePage} />;
  }
}

function LoginPage({ language, onChangeLanguage, email, password, showPassword, onChangeEmail, onChangePassword, onTogglePassword, onSubmit }) {
  const copy = loginTranslations[language] || loginTranslations.EN;

  return (
    <div className="flex h-screen w-full bg-[#f4f7ff] text-[#111827]">
      <div className="hidden w-[42%] bg-[linear-gradient(160deg,#2563eb_0%,#1d4ed8_45%,#0f172a_100%)] px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <img src={whiteLogo} alt="TODO" className="h-9 w-auto object-contain" />
        </div>
        <div className="max-w-[420px]">
          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] inline-flex">{copy.badge}</div>
          <div className="mt-7 text-[44px] font-semibold leading-[1.05] tracking-[-0.04em]">{copy.heroTitle}</div>
          <div className="mt-4 text-[15px] leading-[1.6] text-white/75">{copy.heroText}</div>
        </div>
        <div className="text-[13px] text-white/70">{copy.heroFooter}</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-[440px] rounded-[28px] border border-[#e6ebf4] bg-white p-8 shadow-[0_30px_80px_rgba(37,99,235,0.12)] sm:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <img src={whiteLogo} alt="TODO" className="h-9 w-auto object-contain invert" />
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-full border border-[#dbe4f0] bg-[#f8fbff] p-1 text-[12px] font-semibold text-[#64748b]">
              {[
                ["EN", "English"],
                ["TR", "Türkçe"],
                ["AZ", "Azərbaycan"],
                ["RU", "Русский"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLanguage(code)}
                  className={`rounded-full px-3 py-1 transition ${language === code ? "bg-[#2563eb] text-white" : "text-[#64748b] hover:bg-white"}`}
                  title={label}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-[34px] font-semibold tracking-[-0.04em] text-[#0f172a]">{copy.title}</div>
          <div className="mt-2 text-[15px] text-[#7c8aa5]">{copy.subtitle}</div>

          <form onSubmit={onSubmit} className="mt-8">
            <input
              type="email"
              value={email}
              onChange={(event) => onChangeEmail(event.target.value)}
              placeholder={copy.emailPlaceholder}
              className="h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10"
            />

            <div className="relative mt-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => onChangePassword(event.target.value)}
                placeholder={copy.passwordPlaceholder}
                className="h-[54px] w-full rounded-[14px] border border-[#dbe4f0] bg-[#fbfdff] px-4 pr-12 text-[16px] outline-none focus:border-[#2c6cff] focus:ring-4 focus:ring-[#2c6cff]/10"
              />
              <button type="button" onClick={onTogglePassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111827]">
                {showPassword ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.2 12c2.25-3.55 5.7-5.8 9.8-5.8 4.1 0 7.55 2.25 9.8 5.8-2.25 3.55-5.7 5.8-9.8 5.8-4.1 0-7.55-2.25-9.8-5.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="4.2" fill="currentColor"/>
                    <circle cx="10.4" cy="10.3" r="1.2" fill="white"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.2 12c2.25-3.55 5.7-5.8 9.8-5.8 4.1 0 7.55 2.25 9.8 5.8-2.25 3.55-5.7 5.8-9.8 5.8-4.1 0-7.55-2.25-9.8-5.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 20 20 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>

            <button type="button" className="mt-3 text-[14px] font-medium text-[#2c6cff]">{copy.forgotPassword}</button>

            <button
              type="submit"
              disabled={!email.trim() || !password.trim()}
              className={`mt-6 h-[54px] w-full rounded-[14px] text-[17px] font-semibold transition ${email.trim() && password.trim() ? "bg-[#5ee879] text-[#08210f] shadow-[0_12px_30px_rgba(94,232,121,0.35)]" : "bg-[#dff7e6] text-[#7aa287]"}`}
            >
              {copy.submit}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-[14px] text-[#94a3b8]">
            <div className="h-px flex-1 bg-[#e5eaf1]" />
            <span>{copy.divider}</span>
            <div className="h-px flex-1 bg-[#e5eaf1]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const items = useMemo(() => conversations, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginLanguage, setLoginLanguage] = useState("EN");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [activePage, setActivePage] = useState("inbox");
  const [configureTab, setConfigureTab] = useState("General");
  const [activeConversationId, setActiveConversationId] = useState(items[0]?.id);
  const [messagesByConversation, setMessagesByConversation] = useState(() =>
    Object.fromEntries(items.map((item) => [item.id, getInitialMessages(item.id)]))
  );
  const [draftMessage, setDraftMessage] = useState("");

  const pageMeta = getPageMeta(activePage);
  const activeConversation = items.find((item) => item.id === activeConversationId) || items[0];
  const activeMessages = messagesByConversation[activeConversation.id] || [];

  function handleSelectConversation(conversationId) {
    setActiveConversationId(conversationId);
    setDraftMessage("");
  }

  function handleSelectPage(page) {
    setActivePage(page);
  }

  function handleChangeConfigureTab(tab) {
    setConfigureTab(tab);
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      return;
    }

    setIsAuthenticated(true);
  }

  function handleSendMessage() {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    const nextMessage = {
      id: `message-${Date.now()}`,
      sender: "agent",
      author: activeConversation.assignee,
      time: formatCurrentTime(),
      text: trimmedMessage,
    };

    setMessagesByConversation((current) => ({
      ...current,
      [activeConversation.id]: [...(current[activeConversation.id] || []), nextMessage],
    }));
    setDraftMessage("");
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        language={loginLanguage}
        onChangeLanguage={setLoginLanguage}
        email={loginEmail}
        password={loginPassword}
        showPassword={showLoginPassword}
        onChangeEmail={setLoginEmail}
        onChangePassword={setLoginPassword}
        onTogglePassword={() => setShowLoginPassword((current) => !current)}
        onSubmit={handleLoginSubmit}
      />
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f3f6fb] p-3 text-[#111827]">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-[#dfe5ee] border-t-[3px] border-t-[#2563eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <TopBar title={pageMeta.title} searchPlaceholder={pageMeta.searchPlaceholder} showTestButton={pageMeta.showTestButton} />
        <div className="flex min-h-0 flex-1">
          <LeftRail activePage={activePage} onSelectPage={handleSelectPage} />
          {activePage === "inbox" ? (
            <>
              <Sidebar />
              <ConversationList items={items} activeConversationId={activeConversation.id} onSelectConversation={handleSelectConversation} />
              <ChatCenter conversation={activeConversation} messages={activeMessages} draftMessage={draftMessage} onDraftChange={setDraftMessage} onSendMessage={handleSendMessage} />
              <RightPanel conversation={activeConversation} />
            </>
          ) : activePage === "home" ? (
            <DashboardPage />
          ) : (
            <>
              <AdminSidebar activePage={activePage} onSelectPage={handleSelectPage} />
              <AdminContent activePage={activePage} configureTab={configureTab} onChangeConfigureTab={handleChangeConfigureTab} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Manual test cases:
// 1. Full layout renders with top bar + 5-column inbox structure and no external icon library.
// 2. Conversation list is scrollable and selected row highlight updates on click.
// 3. Side sections, top actions, composer, and right info tabs visually render in a near 1:1 arrangement.
