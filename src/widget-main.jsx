import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./components/ChatWidget.jsx";

// URL parametrlərindən konfiq oxu
const params = new URLSearchParams(window.location.search);
const apiKey = params.get("apiKey") || import.meta.env.VITE_WIDGET_API_KEY || "";
const apiUrl = params.get("apiUrl") || import.meta.env.VITE_WIDGET_API_URL || import.meta.env.VITE_API_URL || "http://localhost:4001";
const title = params.get("title") || "Dəstək";
const subtitle = params.get("subtitle") || "Sizə necə kömək edə bilərik?";

const root = createRoot(document.getElementById("widget-root"));
root.render(<ChatWidget apiKey={apiKey} apiUrl={apiUrl} title={title} subtitle={subtitle} />);
