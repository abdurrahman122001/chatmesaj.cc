export const liveConversations = [
  { label: "Unassigned", emoji: "👋", badge: 12, route: "/conversations?status=unassigned" },
  { label: "My open", emoji: "📬", badge: 9, active: true, route: "/conversations?status=my-open" },
  { label: "Solved", emoji: "✅", route: "/conversations?status=solved" },
  { label: "End chat", emoji: "✖", route: "/conversations?status=close-chat" },
];

export const tickets = [
  { label: "Unassigned", emoji: "👋", route: "/tickets?status=unassigned" },
  { label: "My open", emoji: "📬", route: "/tickets?status=my-open" },
  { label: "Solved", emoji: "✅", route: "/tickets?status=solved" },
];

export const utilityItems = [
  { label: "Mentions", emoji: "@", route: "/mentions" },
  { label: "Lyro AI Agent", emoji: "🤖", suffix: "Activate", route: "/ai-agent" },
];

export const views = [
  { label: "Products", emoji: "🛍", badge: 5, route: "/products" },
  { label: "Order status", emoji: "◫", route: "/order-status" },
  { label: "Order issues", emoji: "📦", badge: 2, route: "/order-issues" },
  { label: "Shipping policy", emoji: "🚚", route: "/shipping-policy" },
  { label: "Messenger", emoji: "💬", badge: 4, active: true, withMenu: true, route: "/messenger" },
  { label: "Instagram", emoji: "📸", route: "/instagram" },
  { label: "WhatsApp", emoji: "🟢", route: "/whatsapp" },
];

export const agents = [{ label: "Spam", emoji: "◔", route: "/spam" }];

export const conversations = [
  { id: "conv-1", name: "#202f4", source: "Messenger", preview: "I have to work today but I inst...", time: "2mo", color: "#9eacbe", count: 2, active: true, email: "info@fusiongraphics.co.nz", phone: "+64 21 555 017", channel: "Messenger", assignee: "Lena Goski", status: "Open", country: "NZ", countryName: "New Zealand", city: "Auckland", region: "AUK", timezone: "Pacific/Auckland", ip: "203.86.205.44", browser: "Chrome 120", os: "Windows 11", device: "Desktop", language: "en-NZ", currentUrl: "https://ripcrack.net/products/sneakers", referrer: "https://google.com" },
  { id: "conv-2", name: "tlm21269@outlook.com", source: "Live chat", preview: "hello", time: "2mo", color: "#f3497b", initials: "T", email: "tlm21269@outlook.com", phone: "+1 202 555 0184", channel: "Live chat", assignee: "Nina Cole", status: "Pending", country: "US", countryName: "United States", city: "Washington", region: "DC", timezone: "America/New_York", ip: "198.51.100.24", browser: "Safari 17", os: "macOS 14", device: "Desktop", language: "en-US", currentUrl: "https://ripcrack.net/support" },
  { id: "conv-3", name: "#13cbf", source: "Messenger", preview: "Chinese factory is seeking dec...", time: "3mo", color: "#4b6fff", count: 1, email: "orders@ripcrack.example", phone: "+86 10 5555 8192", channel: "Messenger", assignee: "Lena Goski", status: "Open", country: "CN", countryName: "China", city: "Shanghai", timezone: "Asia/Shanghai", ip: "223.166.12.77", browser: "Chrome 120", os: "Android 14", device: "Mobile", language: "zh-CN" },
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
