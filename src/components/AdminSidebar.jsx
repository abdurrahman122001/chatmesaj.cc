import React, { useState } from "react";
import AdminSidebarIcon from "./AdminSidebarIcon.jsx";
import { adminNavItems, secondaryAdminNavItems } from "../lyroData.js";
import { useT } from "../LanguageContext.jsx";

export default function AdminSidebar({ activePage, onSelectPage }) {
  const tr = useT();
  const [knowledgeOpen, setKnowledgeOpen] = useState(true);
  const primaryItems = adminNavItems.filter((item) => !item.nested);
  const knowledgeChildren = adminNavItems.filter((item) => item.nested && ["data-sources", "products", "suggestions"].includes(item.key));

  const navLabels = {
    dashboard: tr("navDashboard", "Dashboard"),
    knowledge: tr("navKnowledge", "Knowledge"),
    "data-sources": tr("navDataSources", "Data sources"),
    products: tr("navProducts", "Products"),
    suggestions: tr("navSuggestions", "Suggestions"),
    playground: tr("navPlayground", "Playground"),
    configure: tr("navConfigure", "Configure"),
    conversations: tr("navConversations", "Conversations"),
    analytics: tr("navAnalytics", "Analytics"),
  };

  function renderNavButton(item, options = {}) {
    const isActive = activePage === item.key;
    const isNested = options.nested || false;
    const isOpen = options.open;
    const onToggle = options.onToggle;
    const label = navLabels[item.key] || item.label;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => {
          if (onToggle) { onToggle(); return; }
          onSelectPage(item.key === "knowledge" ? activePage : item.key);
        }}
        className={`flex h-9 w-full items-center justify-between rounded-[10px] px-3 text-left text-[14px] ${isActive ? "bg-[#dfe9ff] text-[#11306a]" : "text-[#334155] hover:bg-[#eef2f7]"}`}
      >
        <span className={`flex items-center gap-[10px] ${isNested ? "pl-4" : ""}`}>
          <span className="inline-flex h-[15px] w-[15px] items-center justify-center">
            <AdminSidebarIcon name={item.icon} active={isActive} />
          </span>
          <span>{label}</span>
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
    <aside className="flex shrink-0 flex-col border-r border-[#dfe5ee] bg-[#f5f7fa] px-3 py-4" style={{ width: '228px' }}>
      <div className="space-y-1">
        {primaryItems.filter((item) => item.key === "dashboard").map((item) => renderNavButton(item))}
        {primaryItems.filter((item) => item.key === "knowledge").map((item) => (
          <div key={item.key} className="space-y-1">
            {renderNavButton(item, { open: knowledgeOpen, onToggle: () => setKnowledgeOpen((v) => !v) })}
            {knowledgeOpen ? <div className="space-y-1">{knowledgeChildren.map((child) => renderNavButton(child, { nested: true }))}</div> : null}
          </div>
        ))}
        {primaryItems.filter((item) => ["playground", "configure"].includes(item.key)).map((item) => renderNavButton(item))}
      </div>
      <div className="mt-auto border-t border-[#e5eaf1] px-1 pt-4">
        {secondaryAdminNavItems.map((item) => {
          const targetKey = item.key === "conversations" ? "inbox" : item.key;
          const isActive = activePage === targetKey;
          return (
            <button key={item.key} type="button" onClick={() => onSelectPage(targetKey)}
              className={`mb-1 flex h-9 w-full items-center justify-between rounded-[10px] px-2 text-left text-[14px] ${isActive ? "bg-[#dfe9ff] text-[#11306a]" : "text-[#334155] hover:bg-[#eef2f7]"}`}>
              <span className="flex items-center gap-[10px]">
                <span className="inline-flex h-[15px] w-[15px] items-center justify-center">
                  <AdminSidebarIcon name={item.icon} active={isActive} />
                </span>
                <span>{navLabels[item.key] || item.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
