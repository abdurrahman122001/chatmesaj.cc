import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { loadQuickActions } from "../quickActions.js";
import { useT } from "../LanguageContext.jsx";

const ICON = {
  chat: "M8 10h8M8 14h5m-9 6 3-3h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9l1-8Z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
};

function Icon({ path, className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QAItem({ onClick, color, icon, title, subtitle }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 rounded-[12px] border border-[#dfe5ee] bg-white px-4 py-3 text-left transition-all hover:border-[#2563eb] hover:shadow-sm">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: color + "15", color }}>
        <Icon path={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-[#111827]">{title}</div>
        <div className="mt-0.5 truncate text-[11px] text-[#64748b]">{subtitle}</div>
      </div>
    </button>
  );
}

function KPI({ label, value, color }) {
  return (
    <div className="rounded-[10px] border border-[#eef2f7] bg-[#fafbfd] p-3">
      <div className="flex items-center gap-1 text-[11px] text-[#64748b]">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold text-[#111827]">{value}</div>
    </div>
  );
}

function StatusRow({ title, subtitle, ok, warn, onClick }) {
  const badge = ok
    ? { bg: "#dcfce7", fg: "#15803d", icon: "✓" }
    : warn
      ? { bg: "#fef3c7", fg: "#b45309", icon: "!" }
      : { bg: "#fee2e2", fg: "#b91c1c", icon: "×" };
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-[10px] p-2 text-left hover:bg-[#f8fafc]">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium text-[#111827]">{title}</div>
        <div className="mt-0.5 truncate text-[11px] text-[#64748b]">{subtitle}</div>
      </div>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: badge.bg, color: badge.fg }}>{badge.icon}</span>
    </button>
  );
}

function UsageBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#334155]">{label}</span>
        <span className="text-[#64748b]">{value} / {max}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-[#f1f5f9]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, hint, onClick, color = "#2563eb" }) {
  return (
    <button onClick={onClick}
      className="group flex items-start gap-3 rounded-[14px] border border-[#dfe5ee] bg-white px-4 py-[14px] text-left transition-all hover:border-[#2563eb] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)]">
      <span className="mt-[2px] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]" style={{ background: color + "15", color }}>
        <Icon path={icon} className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#64748b]">{label}</div>
        <div className="mt-[2px] text-[20px] font-semibold text-[#111827]">{value}</div>
        {hint && <div className="text-[11px] text-[#94a3b8]">{hint}</div>}
      </div>
    </button>
  );
}

export default function DashboardPage({ onNavigate, onOpenConversation, initialSection }) {
  const tr = useT();
  const [stats, setStats] = useState(null);
  const [site, setSite] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, me, convos] = await Promise.all([
          api.analytics(30),
          api.me(),
          api.listConversations(),
        ]);
        setStats(s);
        setSite(me.sites?.[0] || null);
        setRecent(convos.slice(0, 5));
      } catch (err) {
        console.warn("dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalConv = stats?.totalConversations ?? 0;
  const totalContacts = stats?.totalContacts ?? 0;
  const botConv = stats?.byStatus?.BOT ?? 0;
  const openConv = stats?.byStatus?.OPEN ?? 0;
  const solvedConv = stats?.byStatus?.SOLVED ?? 0;
  const pendingConv = stats?.byStatus?.PENDING_HUMAN ?? 0;
  const knowledgeCount = stats?.knowledgeCount ?? 0;
  const resolutionRate = totalConv > 0 ? Math.round((botConv / totalConv) * 100) : 0;
  const topCountries = stats?.topCountries || [];
  const daily = stats?.dailyCounts || [];
  const maxDaily = Math.max(1, ...daily.map((d) => d.count || 0));
  const qa = useMemo(() => loadQuickActions(), [loading]);
  const connectedChannels = ["whatsapp", "email", "telegram", "facebook", "instagram"].filter((k) => qa[k]);

  const setupSteps = useMemo(() => {
    const steps = [
      { key: "widget", label: tr("dashStepWidget", "Widget configured"), done: !!site },
      { key: "kb", label: tr("dashStepKb", "Knowledge base (at least 1 entry)"), done: knowledgeCount > 0 },
      { key: "channels", label: tr("dashStepChannels", "At least one channel connected"), done: connectedChannels.length > 0 },
      { key: "conv", label: tr("dashStepConv", "First conversation received"), done: totalConv > 0 },
      { key: "contact", label: tr("dashStepContact", "First visitor tracked"), done: totalContacts > 0 },
      { key: "team", label: tr("dashStepTeam", "Invite a teammate (optional)"), done: false },
    ];
    return steps;
  }, [site, knowledgeCount, connectedChannels.length, totalConv, totalContacts, tr]);
  const doneSteps = setupSteps.filter((s) => s.done).length;

  useEffect(() => {
    if (initialSection) {
      go(initialSection);
    }
  }, [initialSection]);

  function go(page) {
    if (onNavigate) onNavigate(page);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-6">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* SOL — main column */}
        <div className="space-y-5">
          <div className="text-[20px] font-semibold text-[#111827]">{tr("pageDashboard", "Dashboard")}</div>

          {/* Finalize setup */}
          <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#eef2f7" strokeWidth="6" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#10b981" strokeWidth="6"
                    strokeDasharray={`${(doneSteps / setupSteps.length) * 150.8} 150.8`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-[12px] font-semibold text-[#111827]">{doneSteps}/{setupSteps.length}</div>
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-[#111827]">{tr("dashFinalize", "Finalize your setup")}</div>
                <div className="mt-0.5 text-[12px] text-[#64748b]">{tr("dashFinalizeHint", "Finish the setup to delight your visitors.")}</div>
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {setupSteps.map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-[12px]">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${s.done ? "bg-[#10b981]" : "bg-[#cbd5e1]"}`}>
                        {s.done ? "✓" : ""}
                      </span>
                      <span className={s.done ? "text-[#64748b] line-through" : "text-[#334155]"}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => go("data-sources")} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[12px] font-medium text-white">{tr("dashFinishBtn", "Finish setup")}</button>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <div className="mb-3 text-[14px] font-semibold text-[#111827]">{tr("quickActions", "Quick actions")}</div>
            <div className="grid grid-cols-2 gap-3">
              <QAItem onClick={() => go("inbox")} color="#2563eb" icon={ICON.chat}
                title={tr("liveConversations", "Live conversations")} subtitle={`${pendingConv + openConv} ${tr("unassignedCount", "unassigned")}`} />
              <QAItem onClick={() => go("inbox")} color="#f59e0b" icon={ICON.bolt}
                title={tr("tickets", "Tickets")} subtitle={`${pendingConv} ${tr("waitingCount", "waiting")}`} />
              <QAItem onClick={() => go("data-sources")} color="#8b5cf6" icon={ICON.book}
                title={tr("knowledgeBase", "Knowledge base")} subtitle={`${knowledgeCount} ${tr("entriesCount", "entries")}`} />
              <QAItem onClick={() => go("analytics")} color="#10b981" icon={ICON.eye}
                title={tr("liveVisitors", "Live visitors")} subtitle={`${totalContacts} ${tr("trackedCount", "tracked")}`} />
              <QAItem onClick={() => go("customers")} color="#ef4444" icon={ICON.users}
                title={tr("pageCustomers", "Customers")} subtitle={`${totalContacts} ${tr("contactsCount", "contacts")}`} />
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-semibold text-[#111827]">{tr("performance", "Performance")}</div>
              <span className="rounded-[8px] border border-[#dfe5ee] px-3 py-1 text-[11px] text-[#64748b]">{tr("last30days", "Last 30 days")}</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <KPI label={tr("interactions", "Interactions")} value={totalConv} color="#2563eb" />
              <KPI label={tr("botResolutionRate", "Bot resolution rate")} value={`${resolutionRate}%`} color="#10b981" />
              <KPI label={tr("statSolved", "Solved")} value={solvedConv} color="#8b5cf6" />
            </div>

            {/* Bar chart */}
            <div className="mt-5 h-[200px] rounded-[12px] bg-[#fafbfd] p-4">
              {daily.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[12px] text-[#94a3b8]">{tr("dashNoData", "No data")}</div>
              ) : (
                <div className="flex h-full items-end gap-[3px]">
                  {daily.map((d, i) => {
                    const h = Math.max(2, Math.round((d.count / maxDaily) * 160));
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex w-full justify-center">
                          <div className="w-full rounded-t-[3px] bg-gradient-to-t from-[#2563eb] to-[#60a5fa]" style={{ height: h }} title={`${d.date}: ${d.count}`} />
                        </div>
                        {i % 5 === 0 && <div className="text-[9px] text-[#94a3b8]">{(d.date || "").slice(5)}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Son söhbətlər */}
          <div className="rounded-[16px] border border-[#dfe5ee] bg-white">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-3">
              <div className="text-[15px] font-semibold text-[#111827]">{tr("recentConversations", "Recent conversations")}</div>
              <button onClick={() => go("inbox")} className="text-[12px] text-[#2563eb] hover:underline">{tr("viewAll", "View all")} →</button>
            </div>
            {recent.length === 0 && !loading && (
              <div className="px-5 py-8 text-center text-[13px] text-[#94a3b8]">{tr("noConvsYet", "No conversations yet")}</div>
            )}
            <div className="divide-y divide-[#eef2f7]">
              {recent.map((c) => {
                const lastMsg = c.messages?.[0];
                const name = c.contact?.name || c.contact?.email || `#${c.id.slice(-4)}`;
                const statusLabel = c.status === "OPEN" ? tr("convOpen", "Open") : c.status === "PENDING_HUMAN" ? tr("convOperator", "Operator") : c.status === "BOT" ? tr("convBot", "Bot") : c.status === "SOLVED" ? tr("convSolved", "Solved") : c.status;
                const statusColor = c.status === "PENDING_HUMAN" ? "#ef4444" : c.status === "OPEN" ? "#2563eb" : c.status === "BOT" ? "#8b5cf6" : "#10b981";
                return (
                  <button key={c.id} onClick={() => onOpenConversation ? onOpenConversation(c.id) : go("inbox")} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#f8fafc]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef2f7] text-[13px] font-semibold text-[#475569]">
                      {(c.contact?.name || c.contact?.email || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-[13px] font-medium text-[#111827]">{name}</div>
                        {c.contact?.countryName && <span className="text-[10px] text-[#94a3b8]">· {c.contact.countryName}</span>}
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-[#64748b]">{lastMsg?.text || "—"}</div>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: statusColor + "15", color: statusColor }}>{statusLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* News feed */}
          <div>
            <div className="mb-3 text-[14px] font-semibold text-[#111827]">{tr("newsFeed", "News Feed")}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { t: tr("newsKbTitle", "Knowledge base setup guide"), d: tr("newsKbDesc", "Build your bot's brain in 5 minutes"), icon: ICON.book, nav: "data-sources" },
                { t: tr("newsTeamTitle", "Invite your team"), d: tr("newsTeamDesc", "Collaborate and respond faster"), icon: ICON.users, nav: "team" },
                { t: tr("newsWidgetTitle", "Customize widget"), d: tr("newsWidgetDesc", "Match your brand colours & copy"), icon: ICON.bolt, nav: "settings" },
              ].map((n) => (
                <button key={n.t} onClick={() => go(n.nav)} className="overflow-hidden rounded-[14px] border border-[#dfe5ee] bg-white text-left hover:shadow-sm hover:border-[#94a3b8]">
                  <div className="flex h-[90px] items-center justify-center border-b border-[#eef2f7] bg-[#fafbfd] text-[#334155]">
                    <Icon path={n.icon} className="h-8 w-8" />
                  </div>
                  <div className="p-4">
                    <div className="text-[13px] font-semibold text-[#111827]">{n.t}</div>
                    <div className="mt-1 text-[11px] text-[#64748b]">{n.d}</div>
                    <div className="mt-2 text-[11px] font-medium text-[#111827]">{tr("openArrow", "Open")} →</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Widget embed kod */}
          {site && (
            <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-5">
              <div className="text-[15px] font-semibold text-[#111827]">{tr("widgetEmbedTitle", "Add the widget to your site")}</div>
              <div className="mt-1 text-[12px] text-[#64748b]">{tr("widgetEmbedHint", "Paste this code before your </body> tag:")}</div>
              <pre className="mt-3 overflow-x-auto rounded-[10px] bg-[#0f172a] p-4 text-[11px] leading-[1.5] text-[#e2e8f0]">
{`<script>
  window.ChatbotConfig = {
    apiKey: "${site.apiKey || "SITE_API_KEY"}",
    apiUrl: "${(import.meta.env.VITE_API_URL || "http://localhost:4001")}"
  };
</script>
<script src="${(import.meta.env.VITE_API_URL || "http://localhost:4001")}/widget-embed.js" async></script>`}
              </pre>
            </div>
          )}
        </div>

        {/* SAĞ sidebar — Project status */}
        <aside className="space-y-5">
          <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-5">
            <div className="text-[14px] font-semibold text-[#111827]">{tr("projectStatus", "Project status")}</div>

            <div className="mt-4 space-y-3">
              <StatusRow title={tr("chatWidget", "Chat Widget")} subtitle={site?.domain || site?.name || "—"} ok={!!site} onClick={() => go("settings")} />
              <StatusRow title={tr("knowledgeBase", "Knowledge base")} subtitle={`${knowledgeCount} ${tr("entriesCount", "entries")}`} ok={knowledgeCount > 0} onClick={() => go("data-sources")} />
              <StatusRow title={tr("team", "Team")} subtitle={tr("inviteMembers", "Invite members")} ok={false} warn onClick={() => go("team")} />
              <StatusRow title="Facebook" subtitle={qa.facebook ? tr("connected", "Connected") : tr("notConnected", "Not connected")} ok={!!qa.facebook} onClick={() => go("settings")} />
              <StatusRow title="WhatsApp" subtitle={qa.whatsapp ? tr("connected", "Connected") : tr("notConnected", "Not connected")} ok={!!qa.whatsapp} onClick={() => go("settings")} />
              <StatusRow title="Email" subtitle={qa.email ? tr("connected", "Connected") : tr("notConnected", "Not connected")} ok={!!qa.email} onClick={() => go("settings")} />
              <StatusRow title="Telegram" subtitle={qa.telegram ? tr("connected", "Connected") : tr("notConnected", "Not connected")} ok={!!qa.telegram} onClick={() => go("settings")} />
              <StatusRow title="Instagram" subtitle={qa.instagram ? tr("connected", "Connected") : tr("notConnected", "Not connected")} ok={!!qa.instagram} onClick={() => go("settings")} />
            </div>

            <div className="mt-4 border-t border-[#eef2f7] pt-4">
              <div className="text-[12px] text-[#64748b]">{tr("addChannel", "Add a channel:")}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { k: "facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" },
                  { k: "instagram", custom: (<><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></>) },
                  { k: "whatsapp", path: "M4 12a8 8 0 1 1 3.4 6.5L4 20l1.5-3.4A8 8 0 0 1 4 12Z" },
                  { k: "telegram", path: "m3 11 18-7-3 16-6-5-3 3v-5l9-6" },
                  { k: "email", path: "M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7m-18 0 9 6 9-6m-18 0a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" },
                ].map((c) => (
                  <button key={c.k} onClick={() => go("settings")}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${qa[c.k] ? "border-[#111827] bg-[#111827] text-white" : "border-[#dfe5ee] bg-white text-[#64748b] hover:border-[#94a3b8]"}`}
                    title={c.k}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      {c.custom || <path d={c.path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-5">
            <div className="text-[14px] font-semibold text-[#111827]">{tr("currentUsage", "Current usage")}</div>
            <div className="mt-4 space-y-4">
              <UsageBar label={tr("conversations", "Conversations")} value={totalConv} max={totalConv || 1} color="#2563eb" />
              <UsageBar label={tr("botAnswers", "Bot answers")} value={botConv} max={botConv || 1} color="#10b981" />
              <UsageBar label={tr("visitorsTracked", "Visitors tracked")} value={totalContacts} max={totalContacts || 1} color="#8b5cf6" />
            </div>
          </div>

          {topCountries.length > 0 && (
            <div className="rounded-[16px] border border-[#dfe5ee] bg-white p-5">
              <div className="text-[14px] font-semibold text-[#111827]">{tr("topCountries", "Top countries")}</div>
              <div className="mt-3 space-y-2">
                {topCountries.slice(0, 5).map((c, i) => {
                  const pct = Math.round((c.count / topCountries[0].count) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#334155]">{c.country}</span>
                        <span className="font-medium text-[#111827]">{c.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#f1f5f9]">
                        <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* removed placeholder - stat kartları artıq quick actions */}
        <div className="hidden">
          <StatCard icon={ICON.chat} label="Toplam söhbət" value={totalConv}
            hint={`${openConv} açıq · ${pendingConv} operator · ${solvedConv} həll`}
            onClick={() => go("inbox")} color="#2563eb" />
          <StatCard icon={ICON.users} label="Ziyarətçilər" value={totalContacts}
            hint="30 gün ərzində"
            onClick={() => go("customers")} color="#10b981" />
          <StatCard icon={ICON.bolt} label="Bot cavab nisbəti" value={`${resolutionRate}%`}
            hint={`${botConv} avtomatik cavab`}
            onClick={() => go("analytics")} color="#8b5cf6" />
          <StatCard icon={ICON.book} label="Knowledge entry" value={knowledgeCount}
            hint="Aktiv"
            onClick={() => go("data-sources")} color="#f59e0b" />
        </div>

        {/* (köhnə alt bloklar artıq yuxarıda — bu hissə gizlədilmişdir) */}
        <div className="hidden">
          {/* Son söhbətlər */}
          <div className="lg:col-span-2 rounded-[16px] border border-[#dfe5ee] bg-white">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-3">
              <div className="text-[15px] font-semibold text-[#111827]">Son söhbətlər</div>
              <button onClick={() => go("inbox")} className="text-[12px] text-[#2563eb] hover:underline">Hamısına bax →</button>
            </div>
            {recent.length === 0 && !loading && (
              <div className="px-5 py-8 text-center text-[13px] text-[#94a3b8]">Hələ söhbət yoxdur</div>
            )}
            <div className="divide-y divide-[#eef2f7]">
              {recent.map((c) => {
                const lastMsg = c.messages?.[0];
                const name = c.contact?.name || c.contact?.email || `#${c.id.slice(-4)}`;
                const statusLabel = c.status === "OPEN" ? "Açıq" : c.status === "PENDING_HUMAN" ? "Operator gözləyir" : c.status === "BOT" ? "Bot" : c.status === "SOLVED" ? "Həll edilib" : c.status;
                const statusColor = c.status === "PENDING_HUMAN" ? "#ef4444" : c.status === "OPEN" ? "#2563eb" : c.status === "BOT" ? "#8b5cf6" : "#10b981";
                return (
                  <button key={c.id} onClick={() => go("inbox")}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#f8fafc]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef2f7] text-[13px] font-semibold text-[#475569]">
                      {(c.contact?.name || c.contact?.email || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-[13px] font-medium text-[#111827]">{name}</div>
                        {c.contact?.countryName && <span className="text-[10px] text-[#94a3b8]">· {c.contact.countryName}</span>}
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-[#64748b]">{lastMsg?.text || "—"}</div>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: statusColor + "15", color: statusColor }}>
                      {statusLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top ölkələr */}
          <div className="rounded-[16px] border border-[#dfe5ee] bg-white">
            <div className="border-b border-[#eef2f7] px-5 py-3 text-[15px] font-semibold text-[#111827]">Top ölkələr</div>
            {topCountries.length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-[#94a3b8]">Hələ məlumat yoxdur</div>
            )}
            <div className="divide-y divide-[#eef2f7]">
              {topCountries.map((c, i) => {
                const maxCount = topCountries[0].count;
                const pct = Math.round((c.count / maxCount) * 100);
                return (
                  <div key={i} className="px-5 py-3">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#334155]">{c.country}</span>
                      <span className="font-medium text-[#111827]">{c.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-[#f1f5f9]">
                      <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
