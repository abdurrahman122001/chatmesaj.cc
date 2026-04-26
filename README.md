# Chatbot Admin + Widget + Backend

Tam chatbot sistemi:
- **Admin panel** (React / Vite) — operator inbox, knowledge base, settings
- **Chat widget** — müştəri saytlarına embed edilir (iframe + Shadow-DOM səviyyəsində izolyasiya)
- **Backend** (Node + Express + PostgreSQL + Prisma + Socket.IO) — auth, realtime, knowledge full-text search

## Arxitektura

```
Müştəri saytı (məs. ripcrack.net)
  └── widget-embed.js (iframe)
       └── /embed.html → ChatWidget → Backend API
                                         ├── /api/widget/session (IP geo-lookup)
                                         ├── /api/widget/message (+ knowledge bot auto-reply)
                                         └── Socket.IO (canlı mesajlaşma)

Admin paneli (sizin domeninizdə)
  └── /index.html → LoginPage → Inbox (real data + socket)
                               → Knowledge base (CRUD)
                               → Settings (quick actions → site config)
                               → Customers (visitor siyahısı)
```

## Sürətli start (local)

### 1. Backend qaldır

```bash
cd server
cp .env.example .env
# .env içindəki DATABASE_URL və JWT_SECRET yoxla
npm install
# PostgreSQL yoxdursa Docker ilə:
# docker run --name chatbot-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chatbot -p 5432:5432 -d postgres:16
npm run prisma:migrate
# Full-text search üçün:
docker exec -i chatbot-pg psql -U postgres -d chatbot < prisma/fts_setup.sql
# Admin + demo knowledge yarat:
npm run seed
# → console-da çıxan apiKey-i kopyala
npm run dev
```

### 2. Frontend qaldır

```bash
# əsas qovluqda
cp .env.example .env
# .env faylına apiKey yaz:
# VITE_WIDGET_API_KEY=demo_xxxxx
npm install
npm run dev
```

- Admin panel: <http://localhost:5173>
- Widget iframe entry: <http://localhost:5173/embed.html>
- Demo müştəri saytı: <http://localhost:5173/demo-site.html>

### 3. Login

- `admin@example.com` / `admin1234`

### 4. Test axını

1. Admin panelində **Knowledge base** (sol mənyudan Data Sources) — nümunə entry-lər görünür.
2. `Test bot` düyməsi ilə sual yoxla: *"çatdırılma neçə günə"* → knowledge-dan cavab.
3. Yeni pencərədə aç: **demo-site.html** — apiKey sorulacaq, seed-də çıxan `demo_xxxxx` yapışdır.
4. Widget açıb sual yaz:
   - Mövcud mövzu (məs. "qaytarma") → bot cavab verir.
   - Yeni mövzu (məs. "rənglər") → SYSTEM mesajı "operator..." + admin **Inbox**-a notification.
5. Admin Inbox-da yeni söhbət — mesajı yaz, widget-də **canlı** görünür.

## Nə işləyir

| Modul | Status |
|---|---|
| Login / logout (JWT) | ✅ |
| Inbox real conversations + socket | ✅ |
| Bot auto-reply (full-text search) | ✅ |
| Escalate to human | ✅ |
| Visitor IP / ölkə / şəhər / cihaz | ✅ (geoip-lite offline) |
| Agent mesaj göndərmə (canlı widget-ə) | ✅ |
| Knowledge CRUD (admin) | ✅ |
| Settings → quick actions → site config | ✅ |
| Customers (real contacts API) | ✅ |
| Widget embed (iframe) | ✅ |
| Demo sayt | ✅ |
| File upload | ✅ |
| AI / LLM inteqrasiyası | ⏸ (istənildikdə əlavə olunar) |

## Widget-i real sayta qoşmaq

Müştəri saytının `</body>` etiketindən əvvəl:

```html
<script>
  window.ChatbotConfig = {
    apiKey: "demo_xxxxx",           // seed-də çıxan key
    apiUrl: "https://your-domain.com", // backend URL
    title: "Dəstək",
    subtitle: "Sizə necə kömək edə bilərik?"
  };
</script>
<script src="https://your-domain.com/widget-embed.js" async></script>
```

`widget-embed.js` iframe kimi `/embed.html` yükləyir — müştəri saytının CSS və JS-i widget-ə heç cür təsir etmir (tam izolyasiya).

## Production deploy

Tam təlimat: `server/README.md` — VPS setup, nginx reverse proxy, pm2, SSL.

Əsas addımlar:
1. VPS-də PostgreSQL qur, `DATABASE_URL` yaz.
2. Backend `pm2 start src/index.js --name chatbot-api`.
3. Frontend-i build et (`npm run build`) və nginx-lə static serve et.
4. Nginx-də `/api/*` və `/socket.io/*` backend-ə proxy et.
5. Hər iki domen üçün SSL (Let's Encrypt).
6. `WIDGET_ORIGINS`-da müştəri domenlərini siyahıla (məs. `https://ripcrack.net,https://another.com`).



demo_8oa2dmdu"# chatmesaj.cc" 
