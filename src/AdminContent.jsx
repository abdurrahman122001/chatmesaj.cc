import React from "react";
import { getPageMeta } from "./utils.js";
import { useT } from "./LanguageContext.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SuggestionsPage from "./pages/SuggestionsPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import PlaygroundPage from "./pages/PlaygroundPage.jsx";
import DataSourcesPage from "./pages/DataSourcesPage.jsx";
import ConfigurePage from "./pages/ConfigurePage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";

function AdminPlaceholder({ activePage }) {
  const tr = useT();
  const i18n = {
    pageTitleHome: tr("pageTitleHome", "Dashboard"),
    pageTitleInbox: tr("pageTitleInbox", "Inbox"),
    pageTitleDataSources: tr("pageTitleDataSources", "Data sources"),
    pageTitleProducts: tr("pageTitleProducts", "Products"),
    pageTitleSuggestions: tr("pageTitleSuggestions", "Suggestions"),
    pageTitleGuidance: tr("pageTitleGuidance", "Guidance"),
    pageTitleActions: tr("pageTitleActions", "Actions"),
    pageTitlePlayground: tr("pageTitlePlayground", "Playground"),
    pageTitleConfigure: tr("pageTitleConfigure", "Configure"),
    pageTitleSettings: tr("pageTitleSettings", "Settings"),
    pageTitleCustomers: tr("pageTitleCustomers", "Customers"),
    pageTitleAnalytics: tr("pageTitleAnalytics", "Analytics"),
    searchPlaceholder: tr("searchPlaceholder", "Search..."),
    searchInInbox: tr("searchInInbox", "Search in Inbox..."),
    searchInDataSources: tr("searchInDataSources", "Search data sources..."),
    searchInProducts: tr("searchInProducts", "Search products..."),
    searchInSuggestions: tr("searchInSuggestions", "Search suggestions..."),
    searchInGuidance: tr("searchInGuidance", "Search guidance..."),
    searchInActions: tr("searchInActions", "Search actions..."),
    searchInPlayground: tr("searchInPlayground", "Search questions..."),
    searchInConfigure: tr("searchInConfigure", "Search settings..."),
    searchInSettings: tr("searchInSettings", "Search settings..."),
    searchInCustomers: tr("searchInCustomers", "Search customers..."),
  };
  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb] p-4">
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-[20px] border border-[#dfe5ee] bg-white text-center">
        <div>
          <div className="text-[28px] font-semibold text-[#111827]">{getPageMeta(activePage, i18n).title}</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Bu səhifə tezliklə əlavə olunacaq.</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminContent({ activePage, configureTab, onChangeConfigureTab, searchQuery, onSearchChange, onNavigate }) {
  const nav = (key) => onNavigate && onNavigate(key);
  switch (activePage) {
    case "dashboard": return <DashboardPage onNavigate={nav} />;
    case "suggestions": return <SuggestionsPage />;
    case "products": return <ProductsPage />;
    case "playground": return <PlaygroundPage />;
    case "data-sources": return <DataSourcesPage searchQuery={searchQuery} onSearchChange={onSearchChange} />;
    case "configure": return <ConfigurePage activeTab={configureTab} onChangeTab={onChangeConfigureTab} />;
    case "analytics": return <AnalyticsPage />;
    default: return <AdminPlaceholder activePage={activePage} />;
  }
}
