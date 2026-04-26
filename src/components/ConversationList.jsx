import React from "react";
import { useT } from "../LanguageContext.jsx";

function Avatar({ color, initials, count, smallDot = false }) {
  return (
    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ backgroundColor: color }}>
      {count ? count : initials || "•"}
      {smallDot ? <span className="absolute right-[-2px] top-[15px] h-[7px] w-[7px] rounded-full bg-[#ff3d59] border border-white" /> : null}
    </div>
  );
}

export default function ConversationList({ items, activeConversationId, onSelectConversation, title = "My open", emoji = "📬", unreadConversationIds = new Set(), onMobileBack }) {
  const tr = useT();
  return (
    <section className="flex w-full min-w-0 flex-1 flex-col border-r border-[#dfe5ee] bg-white md:w-[268px] md:flex-none md:shrink-0">
      <div className="flex h-[58px] items-center border-b border-[#dfe5ee] px-4">
        <button onClick={onMobileBack} aria-label={tr("back", "Back")}
          className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#d6dee9] bg-[#f8fafc] text-[14px] text-[#334155] hover:bg-[#eef2f7] md:hidden">‹</button>
        <span className="mr-3 text-[22px]">{emoji}</span>
        <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1f2937]">{title}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {items.map((item, idx) => {
          const selected = item.id === activeConversationId;
          const unread = unreadConversationIds.has(item.id);
          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => onSelectConversation(item.id)}
              className={`mx-2 my-[6px] flex w-[calc(100%-1rem)] items-start gap-3 rounded-[12px] px-3 py-3 text-left md:w-[250px] ${unread ? (selected ? "bg-[#dbe7ff]" : "bg-[#edf3ff] hover:bg-[#e4edff]") : (selected ? "bg-[#f1f4f8]" : "hover:bg-[#f8fafc]")}`}
            >
              <Avatar color={item.color} initials={item.initials || item.name[0]} count={item.count} smallDot={item.dot} />
              <div className="min-w-0 flex-1 pt-[1px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate text-[12.5px] font-medium text-[#111827]">{item.name}</div>
                  <div className="shrink-0 pt-[1px] text-[12px] text-[#111827]">{item.time}</div>
                </div>
                <div className="mt-[1px] truncate text-[11px] text-[#6b82a7]">{item.source === "Live chat" ? tr("cfgLiveChat", "Live chat") : item.source}</div>
                <div className={`mt-[2px] truncate text-[12px] ${unread || selected || idx === 4 ? "font-semibold text-[#0f172a]" : "text-[#111827]"}`}>{item.preview}</div>
              </div>
              <div className={`mt-4 h-5 w-5 rounded-full ${unread ? "bg-[#93c5fd] ring-2 ring-[#e0ecff]" : "bg-[#e8edf3]"}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
