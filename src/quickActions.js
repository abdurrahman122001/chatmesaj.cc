import { api, getToken } from "./api.js";

const STORAGE_KEY = "chatbot_quick_actions";
const EVENT = "chatbot_quick_actions_update";

const DEFAULTS = {
  whatsapp: "",
  email: "",
  telegram: "",
  facebook: "",
  instagram: "",
};

export function loadQuickActions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveQuickActions(data) {
  const next = { ...DEFAULTS, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));

  // Backend-ə sinxronla (auth olsa)
  if (getToken()) {
    api.me()
      .then(({ sites }) => {
        const site = sites?.[0];
        if (site) return api.updateSite(site.id, { quickActions: next });
      })
      .catch(() => {}); // fail etsə localStorage-da qalır
  }
  return next;
}

// Backend-dən load et və localStorage-ı yenilə
export async function syncQuickActionsFromServer() {
  if (!getToken()) return null;
  try {
    const { sites } = await api.me();
    const site = sites?.[0];
    if (!site?.quickActions) return null;
    const next = { ...DEFAULTS, ...site.quickActions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
    return next;
  } catch {
    return null;
  }
}

export function subscribeQuickActions(callback) {
  const handler = (e) => callback(e.detail ?? loadQuickActions());
  const storageHandler = (e) => {
    if (e.key === STORAGE_KEY) callback(loadQuickActions());
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function buildWhatsAppUrl(value) {
  if (!value) return "";
  const clean = value.replace(/[^\d+]/g, "");
  if (!clean) return "";
  return `https://wa.me/${clean.replace(/^\+/, "")}`;
}

export function buildEmailUrl(value) {
  if (!value) return "";
  return `mailto:${value.trim()}`;
}

export function buildTelegramUrl(value) {
  if (!value) return "";
  const v = value.trim();
  if (v.startsWith("http")) return v;
  return `https://t.me/${v.replace(/^@/, "")}`;
}

export function buildFacebookUrl(value) {
  if (!value) return "";
  const v = value.trim();
  if (v.startsWith("http")) return v;
  return `https://facebook.com/${v.replace(/^@/, "")}`;
}

export function buildInstagramUrl(value) {
  if (!value) return "";
  const v = value.trim();
  if (v.startsWith("http")) return v;
  return `https://instagram.com/${v.replace(/^@/, "")}`;
}
