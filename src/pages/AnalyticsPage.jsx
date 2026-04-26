import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

function SidebarTabs({ tr }) {
  return [
    { key: "overview", label: tr("analyticsOverview", "Overview"), icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>) },
    { key: "human", label: tr("analyticsHuman", "Human support"), icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7"/><path d="M5 19c.8-3.2 3.3-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>) },
    { key: "ai", label: tr("analyticsAI", "AI support"), icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="7" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.7"/><path d="M12 4v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="9.5" cy="12" r="1" fill="currentColor"/><circle cx="14.5" cy="12" r="1" fill="currentColor"/></svg>) },
    { key: "leads", label: tr("analyticsLeads", "Leads"), icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2 3 7l9 5 9-5-9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>) },
  ];
}

function DateRangePill() {
  return (
    <button className="inline-flex items-center gap-2 rounded-[10px] border border-[#dfe5ee] bg-white px-3 py-1.5 text-[12px] text-[#334155]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
      19 Mar 2026 - 17 Apr 2026
      <span className="text-[#94a3b8]">▼</span>
    </button>
  );
}

function StatBlock({ label, value, hint }) {
  return (
    <div className="flex-1 rounded-[12px] border border-[#dfe5ee] bg-white p-4">
      <div className="flex items-center gap-1 text-[12px] text-[#2563eb]">
        <span className="underline-offset-2 underline">{label}</span>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#cfd8e3] text-[10px] text-[#94a3b8]">?</span>
      </div>
      <div className="mt-2 text-[26px] font-semibold text-[#111827]">{value}</div>
      {hint && <div className="mt-1 text-[12px] text-[#64748b]">{hint}</div>}
    </div>
  );
}

function SmallStat({ dot, label, value, link }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[12px] text-[#334155]">
        <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        {label}
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#cfd8e3] text-[10px] text-[#94a3b8]">?</span>
      </div>
      <div className="mt-1.5 text-[22px] font-semibold text-[#111827]">{value}</div>
      {link && <div className="text-[12px] text-[#2563eb] cursor-pointer">{link}</div>}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="mt-6 rounded-[12px] border border-[#dfe5ee] bg-white p-4">
      <div className="flex items-center justify-end gap-2">
        <button className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#eef2f7] text-[#2563eb]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 18.5V11M12 18.5V8M18 18.5V13.5M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button>
        <button className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#94a3b8]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 17l5-6 4 4 7-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>
      <div className="relative mt-3 h-[240px] w-full">
        {[0, 2, 4, 6, 8, 10].map((v, i) => (
          <div key={v} className="absolute left-0 right-0 flex items-center gap-2" style={{ bottom: `${(v / 10) * 100}%` }}>
            <span className="w-6 text-right text-[11px] text-[#94a3b8]">{v}</span>
            <div className="flex-1 border-t border-[#eef2f7]" />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between px-8 text-[11px] text-[#94a3b8]">
        {["Mar 18","Mar 22","Mar 26","Mar 30","Apr 3","Apr 7","Apr 11","Apr 15"].map((d) => <span key={d}>{d}</span>)}
      </div>
    </div>
  );
}

function EmptyCard({ title, text = "We're collecting data for you.", sub = "Come back later for updates." }) {
  return (
    <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-5">
      <div className="flex items-center gap-1 text-[13px] font-medium text-[#111827]">{title} <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#cfd8e3] text-[10px] text-[#94a3b8]">?</span></div>
      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M5 6.5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="#cbd5e1" strokeWidth="1.6"/><path d="M8 9l8 5" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <div className="text-[13px] text-[#334155]">{text}</div>
        <div className="text-[12px] text-[#94a3b8]">{sub}</div>
      </div>
    </div>
  );
}

function Row({ label, v, pct, color }) {
  return (
    <div>
      <div className="flex justify-between"><span className="text-[#334155]">{label}</span><span className="font-medium text-[#111827]">{v} <span className="text-[#94a3b8]">({pct}%)</span></span></div>
      <div className="mt-1 h-1.5 rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

function MiniBarChart({ data, days, tr }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  // Bütün günləri doldur (boş olanları 0)
  const today = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const match = data.find((x) => new Date(x.day).toISOString().slice(0, 10) === key);
    buckets.push({ date: d, count: match?.count || 0 });
  }

  return (
    <div className="mt-6 rounded-[12px] border border-[#dfe5ee] bg-white p-4">
      <div className="mb-2 text-[12px] font-medium text-[#334155]">{tr ? tr("conversationCountLastDays", `Last ${days} days conversations`).replace("{days}", days) : `Son ${days} gündə söhbət sayı`}</div>
      <div className="flex h-[180px] items-end gap-1">
        {buckets.map((b, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
            <div className="w-full rounded-t bg-[#2563eb]"
              style={{ height: `${(b.count / max) * 100}%`, minHeight: b.count > 0 ? "2px" : "0" }} />
            <div className="absolute -top-6 hidden rounded bg-[#111827] px-1.5 py-0.5 text-[10px] text-white group-hover:block">{b.count}</div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[#94a3b8]">
        <span>{buckets[0]?.date.toLocaleDateString("az", { month: "short", day: "numeric" })}</span>
        <span>{buckets[buckets.length - 1]?.date.toLocaleDateString("az", { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}

function OverviewPanel({ tr }) {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.analytics(days).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[22px] font-semibold text-[#111827]">{tr("analyticsOverview", "Overview")}</div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`rounded-[8px] border px-3 py-1 text-[12px] ${days === d ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#dfe5ee] bg-white text-[#64748b]"}`}>
              {d} {tr("daysSuffix", "days")}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="mt-4 text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>}
      {data && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 border-b border-[#eef2f7] pb-4 lg:grid-cols-3">
            <StatBlock label={tr("totalConversations", "Total conversations")} value={data.totalConversations} />
            <StatBlock label={tr("totalContacts", "Total contacts")} value={data.totalContacts} />
            <StatBlock label={tr("knowledgeCount", "Knowledge count")} value={data.knowledgeCount} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            <SmallStat dot="#2563eb" label={tr("open", "Open")} value={data.byStatus?.OPEN || 0} />
            <SmallStat dot="#f59e0b" label={tr("pendingHuman", "Pending human")} value={data.byStatus?.PENDING_HUMAN || 0} />
            <SmallStat dot="#10b981" label={tr("solved", "Solved")} value={data.byStatus?.SOLVED || 0} />
            <SmallStat dot="#8b5cf6" label={tr("botHandled", "Bot handled")} value={data.byStatus?.BOT || 0} />
          </div>
          <MiniBarChart data={data.byDay || []} days={days} tr={tr} />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-3 text-[13px] font-semibold text-[#111827]">{tr("botVsHuman", "Bot vs human")}</div>
              {(() => {
                const b = data.botVsHuman || {};
                const total = (b.bot || 0) + (b.agent || 0) + (b.visitor || 0);
                const pct = (v) => total ? Math.round((v / total) * 100) : 0;
                return (
                  <div className="space-y-2 text-[12px]">
                    <Row label={tr("visitor", "Visitor")} v={b.visitor || 0} pct={pct(b.visitor || 0)} color="#2563eb" />
                    <Row label={tr("bot", "Bot")} v={b.bot || 0} pct={pct(b.bot || 0)} color="#8b5cf6" />
                    <Row label={tr("operator", "Operator")} v={b.agent || 0} pct={pct(b.agent || 0)} color="#10b981" />
                  </div>
                );
              })()}
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-3 text-[13px] font-semibold text-[#111827]">{tr("topCountries", "Top countries")}</div>
              {(data.topCountries || []).length === 0 && <div className="text-[12px] text-[#94a3b8]">{tr("stillNoData", "Still no data")}</div>}
              <div className="space-y-2 text-[12px]">
                {(data.topCountries || []).map((c, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[#334155]">{c.country}</span>
                    <span className="font-medium text-[#111827]">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatDuration(ms) {
  if (ms == null) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}d ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}s ${m % 60}d`;
}

function DaysSelect({ days, setDays, tr }) {
  return (
    <div className="flex gap-2">
      {[7, 14, 30, 90].map((d) => (
        <button key={d} onClick={() => setDays(d)}
          className={`rounded-[8px] border px-3 py-1 text-[12px] ${days === d ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#dfe5ee] bg-white text-[#64748b]"}`}>
          {d} {tr ? tr("daysSuffix", "days") : "gün"}
        </button>
      ))}
    </div>
  );
}

const TICKET_SC = { OPEN: "#f59e0b", IN_REVIEW: "#3b82f6", IN_PROGRESS: "#8b5cf6", RESOLVED: "#22c55e", CANCELLED: "#94a3b8" };
const TICKET_PC = { LOW: "#94a3b8", MEDIUM: "#3b82f6", HIGH: "#f59e0b", URGENT: "#ef4444" };
const getTicketStatusLabel = (tr, s) => ({ OPEN: tr("ticketStatusOpen", "Open"), IN_REVIEW: tr("ticketStatusInReview", "In review"), IN_PROGRESS: tr("ticketStatusInProgress", "In progress"), RESOLVED: tr("ticketStatusResolved", "Resolved"), CANCELLED: tr("ticketStatusCancelled", "Cancelled") }[s] || s);
const getTicketPriorityLabel = (tr, p) => ({ LOW: tr("ticketPriorityLow", "Low"), MEDIUM: tr("ticketPriorityMedium", "Medium"), HIGH: tr("ticketPriorityHigh", "High"), URGENT: tr("ticketPriorityUrgent", "Urgent") }[p] || p);

function HumanSupportPanel({ tr }) {
  const [subTab, setSubTab] = useState("Live conversations");
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const tabs = [
    { key: "Live conversations", label: tr("liveConversations", "Live conversations") },
    { key: "Tickets", label: tr("ticketsTab", "Tickets") },
    { key: "Ratings", label: tr("ratingsTab", "Ratings") },
  ];
  const type = subTab === "Tickets" ? "tickets" : subTab === "Ratings" ? "ratings" : "live";

  useEffect(() => {
    setLoading(true);
    api.analyticsHuman(days, type).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [days, type]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[22px] font-semibold text-[#111827]">{tr("analyticsHuman", "Human support")}</div>
        <DaysSelect days={days} setDays={setDays} tr={tr} />
      </div>
      <div className="mt-4 flex items-center gap-3 border-b border-[#eef2f7] pb-4 text-[13px]">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setSubTab(t.key)}
            className={subTab === t.key ? "border-b-2 border-[#2563eb] pb-2 font-medium text-[#2563eb]" : "pb-2 text-[#334155]"}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="mt-4 text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>}

      {/* --- Live conversations --- */}
      {data && type === "live" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatBlock label={tr("conversations", "Conversations")} value={data.conversations} />
            <StatBlock label={tr("repliedConversations", "Replied conversations")} value={data.replied} />
            <StatBlock label={tr("firstResponseTime", "First response time")} value={formatDuration(data.firstResponseMs)} />
            <StatBlock label={tr("averageResponseTime", "Average response time")} value={formatDuration(data.avgResponseMs)} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("conversationsPerDay", "Conversations per day")}</div>
              <MiniBarChart data={data.perDay?.map((d) => ({ day: d.day, count: d.count })) || []} days={days} tr={tr} />
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("conversationsByAgent", "Conversations by agent")}</div>
              {(!data.byAgent || data.byAgent.length === 0) ? (
                <div className="py-6 text-center text-[12px] text-[#94a3b8]">{tr("stillNoData", "Still no data")}</div>
              ) : (
                <div className="space-y-2 text-[12px]">
                  {data.byAgent.map((a, i) => {
                    const max = data.byAgent[0].count;
                    const pct = Math.round((a.count / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between"><span className="text-[#334155]">{a.name}</span><span className="font-medium text-[#111827]">{a.count}</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full bg-[#10b981]" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("responseTime", "Response time")}</div>
              <div className="grid grid-cols-2 gap-3 py-3">
                <SmallStat dot="#2563eb" label={tr("firstResponse", "First response")} value={formatDuration(data.firstResponseMs)} />
                <SmallStat dot="#10b981" label={tr("averageResponse", "Average response")} value={formatDuration(data.avgResponseMs)} />
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("conversationsByChannel", "Conversations by channel")}</div>
              <div className="space-y-2 py-2 text-[12px]">
                <Row label={tr("chatWidget", "Chat widget")} v={data.conversations} pct={100} color="#2563eb" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Tickets --- */}
      {data && type === "tickets" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatBlock label={tr("totalTickets", "Total tickets")} value={data.total} />
            <StatBlock label={tr("openTickets", "Open tickets")} value={data.byStatus?.OPEN || 0} />
            <StatBlock label={tr("resolvedTickets", "Resolved tickets")} value={data.byStatus?.RESOLVED || 0} />
            <StatBlock label={tr("cancelledTickets", "Cancelled tickets")} value={data.byStatus?.CANCELLED || 0} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("ticketsPerDay", "Tickets per day")}</div>
              <MiniBarChart data={data.perDay || []} days={days} tr={tr} />
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("ticketsByStatus", "Tickets by status")}</div>
              <div className="space-y-2 text-[12px]">
                {Object.entries(data.byStatus || {}).map(([s, c]) => {
                  const total = data.total || 1;
                  return <Row key={s} label={getTicketStatusLabel(tr, s)} v={c} pct={Math.round((c / total) * 100)} color={TICKET_SC[s] || "#94a3b8"} />;
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("ticketsByPriority", "Tickets by priority")}</div>
              <div className="space-y-2 text-[12px]">
                {Object.entries(data.byPriority || {}).map(([p, c]) => {
                  const total = data.total || 1;
                  return <Row key={p} label={getTicketPriorityLabel(tr, p)} v={c} pct={Math.round((c / total) * 100)} color={TICKET_PC[p] || "#94a3b8"} />;
                })}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("ticketsByAssignee", "Tickets by assignee")}</div>
              {(!data.byAssignee || data.byAssignee.length === 0) ? (
                <div className="py-6 text-center text-[12px] text-[#94a3b8]">{tr("stillNoData", "Still no data")}</div>
              ) : (
                <div className="space-y-2 text-[12px]">
                  {data.byAssignee.map((a, i) => {
                    const max = data.byAssignee[0].count;
                    const pct = Math.round((a.count / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between"><span className="text-[#334155]">{a.name}</span><span className="font-medium text-[#111827]">{a.count}</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {/* Son ticketlər cədvəli */}
          <div className="mt-5 rounded-[12px] border border-[#dfe5ee] bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-3">
              <div className="text-[13px] font-semibold text-[#111827]">{tr("recentTickets", "Recent tickets")}</div>
            </div>
            {(!data.recent || data.recent.length === 0) ? (
              <div className="py-8 text-center text-[12px] text-[#94a3b8]">{tr("noTicketsYet", "No tickets yet.")}</div>
            ) : (
              <table className="w-full text-[12px]">
                <thead className="bg-[#f8fafc] text-[#64748b]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">{tr("subject", "Subject")}</th>
                    <th className="px-4 py-2 text-left font-medium">{tr("status", "Status")}</th>
                    <th className="px-4 py-2 text-left font-medium">{tr("priority", "Priority")}</th>
                    <th className="px-4 py-2 text-left font-medium">{tr("customer", "Customer")}</th>
                    <th className="px-4 py-2 text-left font-medium">{tr("date", "Date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((t) => (
                    <tr key={t.id} className="border-t border-[#eef2f7]">
                      <td className="px-4 py-2 text-[#111827] font-medium truncate max-w-[200px]">{t.subject}</td>
                      <td className="px-4 py-2"><span className="inline-block rounded-[6px] px-2 py-0.5 text-[11px] font-medium" style={{ background: (TICKET_SC[t.status]||"#94a3b8")+"18", color: TICKET_SC[t.status]||"#94a3b8" }}>{getTicketStatusLabel(tr, t.status)}</span></td>
                      <td className="px-4 py-2"><span className="inline-block rounded-[6px] px-2 py-0.5 text-[11px] font-medium" style={{ background: (TICKET_PC[t.priority]||"#94a3b8")+"18", color: TICKET_PC[t.priority]||"#94a3b8" }}>{getTicketPriorityLabel(tr, t.priority)}</span></td>
                      <td className="px-4 py-2 text-[#475569]">{t.contact?.name || t.contact?.email || "—"}</td>
                      <td className="px-4 py-2 text-[#64748b]">{new Date(t.createdAt).toLocaleDateString("az")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* --- Ratings --- */}
      {data && type === "ratings" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatBlock label={tr("totalRatings", "Total ratings")} value={data.total} />
            <StatBlock label={tr("averageRating", "Average rating")} value={data.avgRating} />
            <StatBlock label={tr("fiveStarRatings", "5-star ratings")} value={data.byRating?.[5] || 0} />
            <StatBlock label={tr("oneStarRatings", "1-star ratings")} value={data.byRating?.[1] || 0} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("ratingsOverTime", "Ratings over time")}</div>
              <MiniBarChart data={data.perDay || []} days={days} tr={tr} />
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("ratingDistribution", "Rating distribution")}</div>
              <div className="space-y-2 text-[12px]">
                {[5,4,3,2,1].map((v) => {
                  const c = data.byRating?.[v] || 0;
                  const total = data.total || 1;
                  const faces = ["😞","🙁","😐","😊","😁"];
                  return <Row key={v} label={`${v} ${tr("starSuffix", "star")} ${faces[v-1]}`} v={c} pct={Math.round((c/total)*100)} color={v>=4?"#22c55e":v>=3?"#f59e0b":"#ef4444"} />;
                })}
              </div>
            </div>
          </div>
          {/* Son qiymətləndirmələr */}
          <div className="mt-5 rounded-[12px] border border-[#dfe5ee] bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-3">
              <div className="text-[13px] font-semibold text-[#111827]">{tr("recentRatings", "Recent ratings")}</div>
            </div>
            {(!data.recent || data.recent.length === 0) ? (
              <div className="py-8 text-center text-[12px] text-[#94a3b8]">{tr("noRatingsYet", "No ratings yet.")}</div>
            ) : (
              <div className="divide-y divide-[#eef2f7]">
                {data.recent.map((r) => {
                  const faces = ["😞","🙁","😐","😊","😁"];
                  return (
                    <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="text-[24px]">{faces[r.rating-1]}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[13px]">
                          <span className="font-medium text-[#111827]">{r.contact?.name || r.contact?.email || tr("anonymous", "Anonymous")}</span>
                          <span className="text-[11px] text-[#64748b]">{r.rating}/5</span>
                        </div>
                        {r.ratingComment && <div className="mt-1 text-[12px] text-[#475569] italic">"{r.ratingComment}"</div>}
                        <div className="mt-1 text-[11px] text-[#94a3b8]">{new Date(r.updatedAt).toLocaleString("az")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AISupportPanel({ tr }) {
  const [subTab, setSubTab] = useState("Live conversations");
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const tabs = [
    { key: "Live conversations", label: tr("liveConversations", "Live conversations") },
    { key: "Emails", label: tr("emailsTab", "Emails") },
    { key: "Knowledge performance", label: tr("knowledgePerformanceTab", "Knowledge performance") },
  ];
  const type = subTab === "Emails" ? "emails" : subTab === "Knowledge performance" ? "knowledge" : "live";

  useEffect(() => {
    setLoading(true);
    api.analyticsAI(days, type).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [days, type]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[22px] font-semibold text-[#111827]">{tr("analyticsAI", "AI support")}</div>
        {type !== "knowledge" && <DaysSelect days={days} setDays={setDays} tr={tr} />}
      </div>
      <div className="mt-4 flex items-center gap-5 border-b border-[#eef2f7] pb-3 text-[13px]">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setSubTab(t.key)}
            className={subTab === t.key ? "border-b-2 border-[#2563eb] pb-2 font-medium text-[#2563eb]" : "pb-2 text-[#334155]"}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="mt-4 text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>}

      {data && type === "knowledge" && <KnowledgePerformanceView data={data} tr={tr} />}

      {data && type !== "knowledge" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatBlock label={tr("aiConversations", "AI conversations")} value={data.aiConversations} />
            <StatBlock label={tr("resolvedConversations", "Resolved conversations")} value={data.resolved} />
            <StatBlock label={tr("resolutionRate", "Resolution rate")} value={`${data.resolutionRate}%`} />
            <StatBlock label={tr("transfersToSupport", "Transfers to support")} value={data.transfers} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("conversationResolution", "Conversation resolution")}</div>
              <div className="space-y-2 py-2 text-[12px]">
                <Row label={tr("botResolved", "Bot resolved")} v={data.resolved} pct={data.aiConversations ? Math.round((data.resolved / data.aiConversations) * 100) : 0} color="#10b981" />
                <Row label={tr("transferredToSupport", "Transferred to support")} v={data.transfers} pct={data.aiConversations ? Math.round((data.transfers / data.aiConversations) * 100) : 0} color="#f59e0b" />
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("aiConversationsPerDay", "AI conversations per day")}</div>
              <MiniBarChart data={data.perDay || []} days={days} tr={tr} />
            </div>
          </div>

          <div className="mt-4 rounded-[12px] border border-[#dfe5ee] bg-white p-4">
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("topQuestions", "Top questions")}</div>
            {(!data.topQuestions || data.topQuestions.length === 0) ? (
              <div className="py-6 text-center text-[12px] text-[#94a3b8]">{tr("stillNoData", "Still no data")}</div>
            ) : (
              <div className="space-y-2 text-[12px]">
                {data.topQuestions.map((q, i) => {
                  const max = data.topQuestions[0].count;
                  const pct = Math.round((q.count / max) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between gap-3">
                        <span className="truncate text-[#334155]">{q.question}</span>
                        <span className="shrink-0 font-medium">{q.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KnowledgePerformanceView({ data, tr }) {
  const stats = data.knowledgeStats || { total: 0, active: 0, draft: 0 };
  const entries = data.knowledgeEntries || [];
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatBlock label={tr("totalEntries", "Total entries")} value={stats.total} />
        <StatBlock label={tr("activeEntries", "Active entries")} value={stats.active} />
        <StatBlock label={tr("draftEntries", "Draft entries")} value={stats.draft} />
      </div>

      <div className="mt-5 rounded-[12px] border border-[#dfe5ee] bg-white">
        <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-3">
          <div className="text-[13px] font-semibold text-[#111827]">{tr("knowledgeEntries", "Knowledge entries")}</div>
          <div className="text-[12px] text-[#64748b]">{tr("sortedByLastUpdate", "Sorted by last update")}</div>
        </div>
        {entries.length === 0 ? (
          <div className="py-10 text-center text-[12px] text-[#94a3b8]">{tr("noEntriesYet", "No entries yet.")}</div>
        ) : (
          <div className="divide-y divide-[#eef2f7]">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[#111827]">{e.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#64748b]">
                    <span>{tr("updated", "Updated")}: {new Date(e.updatedAt).toLocaleDateString("az")}</span>
                    {e.tags?.length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {e.tags.slice(0, 5).map((t, i) => (
                          <span key={i} className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] text-[#475569]">{t}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`ml-3 rounded-full px-2 py-0.5 text-[11px] font-medium ${e.status === "ACTIVE" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function LeadsPanel({ tr }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.analyticsLeads(days).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[22px] font-semibold text-[#111827]">{tr("analyticsLeads", "Leads")}</div>
        <DaysSelect days={days} setDays={setDays} tr={tr} />
      </div>

      {loading && <div className="mt-4 text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div>}
      {data && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatBlock label={tr("leadsAcquired", "Leads acquired")} value={data.leadsAcquired} />
            <StatBlock label={tr("conversionRate", "Conversion rate")} value={`${data.conversionRate}%`} />
            <StatBlock label={tr("newSubscribers", "New subscribers")} value={data.newSubscribers} />
            <StatBlock label={tr("unsubscribes", "Unsubscribes")} value={0} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("leadsOverTime", "Leads over time")}</div>
              <MiniBarChart data={data.perDay || []} days={days} tr={tr} />
            </div>
            <div className="rounded-[12px] border border-[#dfe5ee] bg-white p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">{tr("leadsBySource", "Leads by source")}</div>
              {(!data.bySource || data.bySource.length === 0) ? (
                <div className="py-6 text-center text-[12px] text-[#94a3b8]">{tr("stillNoData", "Still no data")}</div>
              ) : (
                <div className="space-y-2">
                  {data.bySource.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-[12px] text-[#334155]">
                      <span>{s.source}</span>
                      <span className="font-medium">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {!data && <div className="py-12 text-center text-[13px] text-[#64748b]">{tr("noLeadsYet", "No leads yet.")} {tr("leadsWillAppear", "Leads will appear here")}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const tr = useT();
  const [active, setActive] = useState("overview");
  const [mobileShowContent, setMobileShowContent] = useState(false);
  const tabs = SidebarTabs({ tr });
  const activeTab = tabs.find((t) => t.key === active);
  const pickItem = (key) => { setActive(key); setMobileShowContent(true); };
  return (
    <div className="flex min-h-0 flex-1">
      <aside className={`${mobileShowContent ? "hidden" : "flex"} w-full flex-col border-r border-[#dfe5ee] bg-white p-4 md:flex md:w-[220px] md:shrink-0`}>
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => pickItem(tab.key)}
              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium ${active === tab.key ? "bg-[#eff6ff] text-[#2563eb]" : "text-[#64748b] hover:bg-[#f1f5f9]"}`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </aside>
      <div className={`${mobileShowContent ? "flex" : "hidden"} min-w-0 flex-1 flex-col bg-[#f6f8fb] md:flex`}>
        <div className="flex h-[44px] shrink-0 items-center gap-2 border-b border-[#dfe5ee] bg-white px-3 md:hidden">
          <button onClick={() => setMobileShowContent(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#334155] hover:bg-[#eef2f7]" aria-label={tr("back", "Back")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="text-[14px] font-medium text-[#111827]">{activeTab?.label}</div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {active === "overview" && <OverviewPanel tr={tr} />}
          {active === "human" && <HumanSupportPanel tr={tr} />}
          {active === "ai" && <AISupportPanel tr={tr} />}
          {active === "leads" && <LeadsPanel tr={tr} />}
        </div>
      </div>
    </div>
  );
}
