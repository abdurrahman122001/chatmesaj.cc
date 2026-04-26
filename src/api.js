// Frontend API client
// Bütün HTTP çağırışları bu fayl üzərindən gedir.

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4001").replace(/\/$/, "");
const TOKEN_KEY = "chatbot_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(method, path, body, { auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  url: API_URL,

  // Generic HTTP methods
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),

  // Auth
  register: (body) => request("POST", "/api/auth/register", body, { auth: false }),
  login: (body) => request("POST", "/api/auth/login", body, { auth: false }),
  me: () => request("GET", "/api/auth/me"),
  updateProfile: (body) => request("PATCH", "/api/auth/profile", body),
  uploadAvatar: (dataUrl) => request("POST", "/api/auth/avatar", { dataUrl }),
  changePassword: (body) => request("POST", "/api/auth/change-password", body),
  setup2FA: () => request("POST", "/api/auth/2fa/setup", {}),
  verifySetup2FA: (body) => request("POST", "/api/auth/2fa/verify-setup", body),
  disable2FA: (body) => request("POST", "/api/auth/2fa/disable", body),
  login2FA: (body) => request("POST", "/api/auth/login/2fa", body, { auth: false }),
  forgotPassword: (body) => request("POST", "/api/auth/forgot-password", body, { auth: false }),
  resetPassword: (body) => request("POST", "/api/auth/reset-password", body, { auth: false }),

  // Conversations
  listConversations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/api/conversations${q ? "?" + q : ""}`);
  },
  getConversation: (id) => request("GET", `/api/conversations/${id}`),
  sendMessage: (id, body) => request("POST", `/api/conversations/${id}/messages`, body),
  updateConversation: (id, body) => request("PATCH", `/api/conversations/${id}`, body),

  // Contacts
  listContacts: (q) => request("GET", `/api/contacts${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  listAllContacts: () => request("GET", "/api/contacts?includeAnonymous=true"),
  updateContact: (id, body) => request("PATCH", `/api/contacts/${id}`, body),

  // Sites
  updateSite: (id, body) => request("PATCH", `/api/sites/${id}`, body),

  // Knowledge base
  listKnowledge: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/api/knowledge${q ? "?" + q : ""}`);
  },
  createKnowledge: (body) => request("POST", "/api/knowledge", body),
  updateKnowledge: (id, body) => request("PATCH", `/api/knowledge/${id}`, body),
  deleteKnowledge: (id) => request("DELETE", `/api/knowledge/${id}`),
  testKnowledgeSearch: (q) => request("GET", `/api/knowledge/search?q=${encodeURIComponent(q)}`),
  scrapeKnowledgeUrl: (url) => request("POST", "/api/knowledge/scrape", { url }),
  importKnowledgeCsv: (csv) => request("POST", "/api/knowledge/import-csv", { csv }),

  // Products
  listProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/api/products${q ? "?" + q : ""}`);
  },
  createProduct: (body) => request("POST", "/api/products", body),
  updateProduct: (id, body) => request("PATCH", `/api/products/${id}`, body),
  deleteProduct: (id) => request("DELETE", `/api/products/${id}`),
  scrapeProductUrl: (url) => request("POST", "/api/products/scrape", { url }),
  importProductsCsv: (csv) => request("POST", "/api/products/import-csv", { csv }),

  // Suggestions
  listSuggestions: () => request("GET", "/api/suggestions"),
  dismissSuggestion: (id) => request("POST", `/api/suggestions/${id}/dismiss`),
  addSuggestionToKnowledge: (id, body) => request("POST", `/api/suggestions/${id}/add-to-knowledge`, body),

  // Site settings (Configure)
  getSiteSettings: () => request("GET", "/api/sites/me/settings"),
  updateSiteSettings: (body) => request("PATCH", "/api/sites/me/settings", body),

  // Playground
  playgroundTest: (message, mode = "live") => request("POST", "/api/playground/test", { message, mode }),
  playgroundPrompts: (mode = "live") => request("GET", `/api/playground/prompts?mode=${mode}`),

  // Macros
  listMacros: () => request("GET", "/api/macros"),
  createMacro: (body) => request("POST", "/api/macros", body),
  updateMacro: (id, body) => request("PATCH", `/api/macros/${id}`, body),
  deleteMacro: (id) => request("DELETE", `/api/macros/${id}`),

  // Analytics
  analytics: (days = 7) => request("GET", `/api/analytics?days=${days}`),
  analyticsHuman: (days = 30, type = "live") => request("GET", `/api/analytics/human?days=${days}&type=${type}`),
  analyticsAI: (days = 30, type = "live") => request("GET", `/api/analytics/ai?days=${days}&type=${type}`),
  analyticsLeads: (days = 30) => request("GET", `/api/analytics/leads?days=${days}`),

  // Team
  listTeam: () => request("GET", "/api/team"),
  createTeamMember: (body) => request("POST", "/api/team", body),
  updateTeamMember: (id, body) => request("PATCH", `/api/team/${id}`, body),
  deleteTeamMember: (id) => request("DELETE", `/api/team/${id}`),

  // Tickets
  listTickets(status) { return request("GET", `/api/tickets${status ? `?status=${status}` : ""}`); },
  getTicket(id) { return request("GET", `/api/tickets/${id}`); },
  updateTicket(id, data) { return request("PATCH", `/api/tickets/${id}`, data); },
  deleteTicket(id) { return request("DELETE", `/api/tickets/${id}`); },

  // Subscribers
  listSubscribers() { return request("GET", "/api/subscribers"); },
  deleteSubscriber(id) { return request("DELETE", `/api/subscribers/${id}`); },

  // Uploads (multipart)
  async upload(files) {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const token = getToken();
    const res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};
