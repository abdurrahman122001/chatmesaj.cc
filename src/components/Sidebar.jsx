import React from "react";
import { liveConversations, tickets, utilityItems, views, agents } from "../inboxData.js";

function SectionHeader({ title, caret = true, plus = false, collapsed = false, onToggle }) {
  return (
    <button type="button" onClick={caret ? onToggle : undefined}
      className="flex w-full items-center justify-between px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#111827]">
      <div className="flex items-center gap-1">
        <span>{title}</span>
        {caret ? <span className="text-[10px] text-[#64748b]">{collapsed ? "▸" : "⌄"}</span> : null}
      </div>
      {plus ? <span className="text-[18px] font-normal text-[#94a3b8]">＋</span> : null}
    </button>
  );
}

function SidebarRow({ item, muted = false, onNavigate, activeRoute, badgeByRoute }) {
  const isActive = item.route === activeRoute;
  const dynamicBadge = item.route ? badgeByRoute?.[item.route] : undefined;
  const resolvedBadge = typeof dynamicBadge === "number" ? dynamicBadge : item.badge;
  return (
    <button
      onClick={() => item.route && onNavigate(item.route)}
      className={`mx-2 mb-1 flex h-9 w-[208px] items-center justify-between rounded-[11px] px-3 text-left text-[13px] ${isActive ? "bg-[#dfe9ff] text-[#11306a]" : muted ? "text-[#1f2a3d] hover:bg-[#eef2f7]" : "text-[#1f2a3d] hover:bg-[#eef2f7]"}`}
    >
      <span className="flex items-center gap-3">
        <span className="w-4 text-center text-[14px]">{item.emoji}</span>
        <span className={`${isActive ? "font-medium" : "font-normal"}`}>{item.label}</span>
      </span>
      <span className="flex items-center gap-2">
        {item.suffix ? <span className="text-[12px] text-[#2563eb]">{item.suffix}</span> : null}
        {resolvedBadge ? <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ef233c] px-1 text-[10px] font-semibold text-white">{resolvedBadge}</span> : null}
        {item.withMenu ? <span className="text-[#94a3b8]">⋮</span> : null}
      </span>
    </button>
  );
}

export default function Sidebar({ onNavigate, activeRoute, badgeByRoute, collapsedSections, onToggleSection, t }) {
  const collapsed = collapsedSections || { live: false, tickets: false, views: false, agents: false };
  const translateLabel = (label) => {
    const map = {
      "Unassigned": t?.unassigned,
      "My open": t?.myOpen,
      "Solved": t?.solved,
      "End chat": t?.endChat,
      "Mentions": t?.mentions,
      "Lyro AI Agent": t?.lyroAiAgent,
      "Products": t?.products,
      "Order status": t?.orderStatus,
      "Order issues": t?.orderIssues,
      "Shipping policy": t?.shippingPolicy,
      "Spam": t?.spam,
    };
    return map[label] || label;
  };
  const withTranslatedLabel = (list) => list.map((item) => ({ ...item, label: translateLabel(item.label), suffix: item.suffix === "Activate" ? (t?.activate || item.suffix) : item.suffix }));

  return (
    <aside className="flex h-full min-h-0 w-[240px] shrink-0 flex-col overflow-y-auto border-r border-[#dfe5ee] bg-[#f5f7fa] md:w-[240px]">
      <SectionHeader title={t?.liveConversations || "Live conversations"} collapsed={collapsed.live} onToggle={() => onToggleSection && onToggleSection("live")} />
      {!collapsed.live ? <div>{withTranslatedLabel(liveConversations).map((item) => <SidebarRow key={item.label} item={item} onNavigate={onNavigate} activeRoute={activeRoute} badgeByRoute={badgeByRoute} />)}</div> : null}
      <SectionHeader title={t?.tickets || "Tickets"} plus collapsed={collapsed.tickets} onToggle={() => onToggleSection && onToggleSection("tickets")} />
      {!collapsed.tickets ? <div>{withTranslatedLabel(tickets).map((item) => <SidebarRow key={item.label} item={item} muted onNavigate={onNavigate} activeRoute={activeRoute} badgeByRoute={badgeByRoute} />)}</div> : null}
      <div className="pt-4">{withTranslatedLabel(utilityItems).map((item) => <SidebarRow key={item.label} item={item} muted onNavigate={onNavigate} activeRoute={activeRoute} badgeByRoute={badgeByRoute} />)}</div>
      <SectionHeader title={t?.views || "Views"} plus collapsed={collapsed.views} onToggle={() => onToggleSection && onToggleSection("views")} />
      {!collapsed.views ? <div>{withTranslatedLabel(views).map((item) => <SidebarRow key={item.label} item={item} muted onNavigate={onNavigate} activeRoute={activeRoute} badgeByRoute={badgeByRoute} />)}</div> : null}
      <SectionHeader title={t?.agents || "Agents"} collapsed={collapsed.agents} onToggle={() => onToggleSection && onToggleSection("agents")} />
      {!collapsed.agents ? <div>{withTranslatedLabel(agents).map((item) => <SidebarRow key={item.label} item={item} muted onNavigate={onNavigate} activeRoute={activeRoute} badgeByRoute={badgeByRoute} />)}</div> : null}
    </aside>
  );
}
