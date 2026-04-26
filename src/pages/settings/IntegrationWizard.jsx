import React, { useState } from "react";
import { api } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

const WIZARDS = {
  facebook: {
    brand: "Facebook", color: "#1877f2", icon: "f", iconBg: "#1877f2",
    introKeys: ["fbIntro1", "fbIntro2", "fbIntro3"],
    intro: ["Sign in with your Facebook account", "Select the Facebook Pages you want to manage", "Grant permission to receive messages"],
    tipKeys: [
      { titleKey: "fbTip1Title", bodyKey: "fbTip1Body", linkKey: "fbTip1Link" },
      { titleKey: "fbTip2Title", bodyKey: "fbTip2Body", linkKey: "fbTip2Link" },
      { titleKey: "fbTip3Title", bodyKey: "fbTip3Body", linkKey: "fbTip3Link" },
    ],
    tips: [
      { title: "Connect with Facebook account", body: "You'll be asked to sign in with the Facebook account that manages your Pages. We only request permissions needed for messaging.", link: "Check how to prepare your account." },
      { title: "Choose Facebook Pages", body: "After login, select the Pages you want to connect. You can change this later from Settings → Facebook.", link: "Check how to choose pages." },
      { title: "Allow access to messages", body: "Grant the requested permissions so incoming messages from your Pages appear in your Inbox.", link: "Check how to allow access to messages." },
    ],
    loginProvider: "facebook",
  },
  instagram: {
    brand: "Instagram", color: "#e1306c", icon: "📸", iconBg: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)",
    introKeys: ["igIntro1", "igIntro2", "igIntro3"],
    intro: ["Set your account to Instagram Business", "Connect Instagram account with a Facebook fan page", "Allow access to messages"],
    tipKeys: [
      { titleKey: "igTip1Title", bodyKey: "igTip1Body", linkKey: "igTip1Link" },
      { titleKey: "igTip2Title", bodyKey: "igTip2Body", linkKey: "igTip2Link" },
      { titleKey: "igTip3Title", bodyKey: "igTip3Body", linkKey: "igTip3Link" },
    ],
    tips: [
      { title: "Set your account to Instagram Business", body: "To connect with Instagram, you'll need to make sure your account is a Business Instagram Account.", link: "Check how to set your account to business account." },
      { title: "Connect Instagram account with a Facebook fan page", body: "Since Instagram is part of Facebook now, your Instagram account needs to be connected to your Facebook fan page.", link: "Check how to connect Instagram to Facebook." },
      { title: "Allow access to messages", body: "During the integration process, you'll need the following information for your Instagram business channel, be sure to have them on hand.", link: "Check how to allow access to messages." },
    ],
    loginProvider: "facebook",
  },
  whatsapp: {
    brand: "WhatsApp", color: "#25d366", icon: "💬", iconBg: "#25d366",
    introKeys: ["waIntro1", "waIntro2", "waIntro3"],
    intro: ["Have a WhatsApp Business phone number", "Receive SMS/call verification code", "Confirm the code to connect"],
    tipKeys: [
      { titleKey: "waTip1Title", bodyKey: "waTip1Body", linkKey: "waTip1Link" },
      { titleKey: "waTip2Title", bodyKey: "waTip2Body", linkKey: "waTip2Link" },
      { titleKey: "waTip3Title", bodyKey: "waTip3Body", linkKey: null },
    ],
    tips: [
      { title: "Prepare your business phone number", body: "Use a phone number that is not already registered on regular WhatsApp. Beynəlxalq formatda olmalıdır (məs: +994501234567).", link: "Check how to prepare your business number." },
      { title: "Receive verification code", body: "Inteqrasiya zamanı həmin nömrəyə SMS və ya səsli zəng ilə 6 rəqəmli təsdiq kodu göndəriləcək. Telefon əlinizdə olsun.", link: "Check how verification works." },
      { title: "Confirm code & connect", body: "Start integration düyməsini basıb, nömrəni daxil edin, gələn kodu yazın — qoşulma tamamlanır.", link: "" },
    ],
    loginProvider: "whatsapp",
  },
  telegram: {
    brand: "Telegram", color: "#0088cc", icon: "✈", iconBg: "#0088cc",
    introKeys: ["tgIntro1", "tgIntro2", "tgIntro3"],
    intro: ["Create a bot via @BotFather", "Copy the bot token", "Paste the token here to connect"],
    tipKeys: [
      { titleKey: "tgTip1Title", bodyKey: "tgTip1Body", linkKey: "tgTip1Link" },
      { titleKey: "tgTip2Title", bodyKey: "tgTip2Body", linkKey: "tgTip2Link" },
      { titleKey: "tgTip3Title", bodyKey: "tgTip3Body", linkKey: null },
    ],
    tips: [
      { title: "Create a bot", body: "Open Telegram and send /newbot to @BotFather. Follow the steps to name your bot.", link: "Check how to create a Telegram bot." },
      { title: "Copy the bot token", body: "BotFather will give you a token like 123456:ABC-DEF.... Keep it secret.", link: "Check token security tips." },
      { title: "Paste & connect", body: "Click Start integration below and paste your bot token to finish the connection.", link: "" },
    ],
    loginProvider: "token",
  },
};

const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.uk", "ymail.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com",
  "mail.ru", "yandex.ru", "yandex.com",
  "aol.com", "gmx.com", "zoho.com",
  "facebook.com", "fb.com",
];

function vowelRatio(s) {
  if (!s) return 0;
  const vowels = (s.match(/[aeiouıəüöAEIOUIƏÜÖ]/g) || []).length;
  return vowels / s.length;
}

function validateFacebookLogin(email, password) {
  const e = email.trim().toLowerCase();

  // Basic email format
  const re = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;
  if (!re.test(e)) return "E-poçt formatı yanlışdır.";

  const [local, domain] = e.split("@");

  // Domain whitelist
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return `Bu domen (${domain}) Facebook-da tanınmır. gmail.com, outlook.com, yahoo.com və s. istifadə edin.`;
  }

  // Local-part sanity — reject keyboard-mashing and digit-only
  if (local.length < 3) return "İstifadəçi adı çox qısadır.";
  if (/^\d+$/.test(local)) return "E-poçt ünvanı həqiqi görünmür.";
  if (vowelRatio(local) < 0.15 && !/\d/.test(local)) return "E-poçt ünvanı həqiqi görünmür. Zəhmət olmasa real hesabdan istifadə edin.";
  if (/(.)\1{3,}/.test(local)) return "E-poçt ünvanı həqiqi görünmür.";
  // Reject long consonant clusters (4+ in a row without vowel)
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(local)) return "E-poçt ünvanı həqiqi görünmür.";

  // Password strength — require at least one digit OR special char
  if (!password || password.length < 6) return "Şifrə ən azı 6 simvol olmalıdır.";
  if (/^(.)\1+$/.test(password)) return "Şifrə zəifdir.";
  if (!/\d/.test(password) && !/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
    return "Şifrədə ən azı bir rəqəm və ya xüsusi simvol olmalıdır.";
  }

  return null;
}

function FacebookLoginModal({ brand, onClose, onSuccess }) {
  const tr = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const err = validateFacebookLogin(email, password);
    if (err) {
      setError(err);
      setAttempts((a) => a + 1);
      return;
    }
    setError(""); setLoading(true);
    // Simulate Facebook OAuth flow with a realistic delay
    setTimeout(() => {
      setLoading(false);
      onSuccess({ account: email.trim() });
    }, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[12px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5eaf1] px-4 py-2 text-[12px] text-[#64748b]">
          <span className="truncate">facebook.com/login — {brand}</span>
          <button onClick={onClose} className="text-[#334155] hover:text-[#111827]">✕</button>
        </div>
        <div className="px-8 py-8">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1877f2] text-[28px] font-bold text-white">f</div>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="text-center text-[15px] font-semibold text-[#111827]">{tr("fbLoginTitle", "Log in to Facebook")}</div>
            <input type="email" placeholder={tr("fbEmailOrPhone", "Email address or phone number")} value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-3 text-[14px] outline-none focus:border-[#1877f2]" />
            <input type="password" placeholder={tr("password", "Password")} value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-3 text-[14px] outline-none focus:border-[#1877f2]" />
            {error && (
              <div className="rounded-[6px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">
                {error}
                {attempts >= 3 && <div className="mt-1 text-[11px] text-[#991b1b]">{tr("fbFailedAttempts", "Failed attempt")}: {attempts}. {tr("fbAccountWillBeBlocked", "After 5 the account will be blocked.")}</div>}
              </div>
            )}
            <button type="submit" disabled={loading || attempts >= 5}
              className="w-full rounded-[8px] bg-[#1877f2] py-3 text-[14px] font-semibold text-white hover:bg-[#166fe5] disabled:opacity-60">
              {attempts >= 5 ? tr("fbAccountBlocked", "Account temporarily blocked") : loading ? tr("fbLoggingIn", "Logging in...") : tr("fbLogIn", "Log In")}
            </button>
            <div className="text-center text-[12px] text-[#1877f2] cursor-pointer hover:underline">{tr("fbForgottenPassword", "Forgotten password?")}</div>
            <div className="border-t border-[#e5eaf1] pt-3 text-center">
              <button type="button" className="rounded-[8px] bg-[#42b72a] px-4 py-2 text-[13px] font-semibold text-white">{tr("fbCreateNewAccount", "Create new account")}</button>
            </div>
          </form>
          <div className="mt-4 rounded-[8px] border border-[#fcd34d] bg-[#fffbeb] px-3 py-2 text-[11px] text-[#92400e]">
            ⚠ <span className="font-semibold">{tr("fbDemoModeLabel", "Demo mode:")}</span> {tr("fbDemoModeDesc", "Real Facebook OAuth requires Meta app credentials. Currently only popular email domains are accepted (gmail, outlook, yahoo, icloud, mail.ru, etc.).")}
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppVerifyModal({ onClose, onSuccess }) {
  const tr = useT();
  const [stage, setStage] = useState("phone"); // "phone" | "code"
  const [phone, setPhone] = useState("+994");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("sms"); // sms | call

  function sendCode(e) {
    e?.preventDefault();
    if (!/^\+\d{7,15}$/.test(phone.trim())) {
      setError(tr("waPhoneInvalid", "Enter the number in international format: +994501234567")); return;
    }
    setError(""); setLoading(true);
    setTimeout(() => {
      // Simulated OTP — show it in the UI for demo
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(otp);
      setStage("code");
      setLoading(false);
    }, 1000);
  }

  function verify(e) {
    e?.preventDefault();
    if (code.trim() !== sentCode) {
      setError(tr("waCodeWrong", "Code is wrong. Please try again.")); return;
    }
    setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ phone: phone.trim(), method });
    }, 700);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-[420px] rounded-[16px] bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-[#334155] hover:text-[#111827]">✕</button>

        <div className="flex items-center gap-2 text-[16px] font-semibold text-[#111827]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366] text-white text-[20px]">💬</span>
          {tr("waBusiness", "WhatsApp Business")}
        </div>

        {stage === "phone" ? (
          <>
            <div className="mt-3 text-[13px] text-[#64748b]">
              {tr("waEnterBusinessPhone", "Enter your business phone number in international format. We'll send a verification code.")}
            </div>
            <form onSubmit={sendCode} className="mt-4 space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[#334155]">{tr("waPhoneNumber", "Phone number")}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994501234567"
                  className="mt-1 w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2.5 text-[14px] font-mono outline-none focus:border-[#25d366]"
                />
              </div>
              <div>
                <div className="mb-1.5 text-[12px] font-medium text-[#334155]">{tr("waVerifyMethod", "Verification method")}</div>
                <div className="flex gap-2">
                  {[
                    { k: "sms", label: `📱 ${tr("waSMS", "SMS")}` },
                    { k: "call", label: `📞 ${tr("waVoiceCall", "Voice call")}` },
                  ].map((o) => (
                    <button type="button" key={o.k} onClick={() => setMethod(o.k)}
                      className={`flex-1 rounded-[10px] border px-3 py-2 text-[13px] ${method === o.k ? "border-[#25d366] bg-[#ecfdf5] text-[#166534]" : "border-[#dfe5ee] text-[#334155]"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full rounded-[10px] bg-[#25d366] py-2.5 text-[14px] font-semibold text-white hover:bg-[#1ebe57] disabled:opacity-60">
                {loading ? tr("waSending", "Sending...") : `${tr("waSendCode", "Send code")} (${method === "sms" ? tr("waSMS", "SMS") : tr("waVoiceCall", "Voice")})`}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mt-3 text-[13px] text-[#64748b]">
              {tr("waCodeSentTemplate", "A 6-digit code was sent to {phone} via {method}.")
                .replace("{phone}", phone)
                .replace("{method}", method === "sms" ? tr("waSMS", "SMS") : tr("waVoiceCallShort", "voice call"))}
            </div>
            <div className="mt-2 rounded-[8px] border border-dashed border-[#25d366] bg-[#ecfdf5] px-3 py-2 text-[12px] text-[#166534]">
              <span className="font-semibold">{tr("waDemoCode", "Demo code:")}</span> <span className="font-mono text-[14px] tracking-widest">{sentCode}</span>
            </div>
            <form onSubmit={verify} className="mt-4 space-y-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={tr("wa6DigitCode", "6-digit code")}
                maxLength={6}
                className="w-full rounded-[10px] border border-[#cfd8e3] px-3 py-2.5 text-center text-[18px] font-mono tracking-[0.5em] outline-none focus:border-[#25d366]"
              />
              {error && <div className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full rounded-[10px] bg-[#25d366] py-2.5 text-[14px] font-semibold text-white hover:bg-[#1ebe57] disabled:opacity-60">
                {loading ? tr("verifying", "Verifying...") : tr("waConfirmAndConnect", "Confirm and connect")}
              </button>
              <div className="flex items-center justify-between text-[12px]">
                <button type="button" onClick={() => { setStage("phone"); setCode(""); setError(""); }}
                  className="text-[#2563eb] hover:underline">← {tr("waChangeNumber", "Change number")}</button>
                <button type="button" onClick={sendCode} disabled={loading}
                  className="text-[#2563eb] hover:underline disabled:opacity-60">{tr("waResendCode", "Resend code")}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function TelegramTokenModal({ onClose, onSuccess }) {
  const tr = useT();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(token.trim())) {
      setError(tr("tgTokenInvalid", "Invalid token format. Example: 1234567890:ABCdefGhIJKlmNOpqrSTUvwxYZ"));
      return;
    }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess({ token: token.trim() }); }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-[420px] rounded-[14px] bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-[#334155] hover:text-[#111827]">✕</button>
        <div className="flex items-center gap-2 text-[16px] font-semibold text-[#111827]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0088cc] text-white">✈</span>
          {tr("tgBotTokenTitle", "Telegram Bot Token")}
        </div>
        <div className="mt-2 text-[12px] text-[#64748b]">{tr("tgBotTokenDesc", "Get the token from @BotFather and paste it below.")}</div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input type="text" placeholder="123456789:ABCdef..." value={token} onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-[8px] border border-[#cfd8e3] px-3 py-3 text-[13px] font-mono outline-none focus:border-[#0088cc]" />
          {error && <div className="text-[12px] text-[#ef4444]">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full rounded-[8px] bg-[#0088cc] py-2.5 text-[14px] font-semibold text-white disabled:opacity-60">
            {loading ? tr("connecting", "Connecting...") : tr("connect", "Connect")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function IntegrationWizard({ channel, onDone, onCancel }) {
  const tr = useT();
  const cfg = WIZARDS[channel];
  const [step, setStep] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  if (!cfg) return null;
  const totalTips = cfg.tips.length;

  function startIntegration() { setShowLogin(true); }

  function generateFacebookPages(email) {
    const username = (email || "user").split("@")[0].replace(/[^a-zA-Z0-9]/g, " ").trim() || "User";
    const cap = username.charAt(0).toUpperCase() + username.slice(1);
    const templates = [
      `${cap}'s Business`,
      `${cap} Store`,
      `${cap} Official`,
      `${cap} Community`,
    ];
    return templates.map((name, i) => ({
      id: `fb_${Date.now().toString(36)}_${i}`,
      name,
      enabled: false,
      followers: Math.floor(500 + Math.random() * 50000),
    }));
  }

  async function handleSuccess(meta) {
    const payload = {
      channels: { [channel]: true },
      integrations: { [channel]: { connectedAt: new Date().toISOString(), ...meta } },
    };
    // Auto-generate simulated Facebook pages from the logged-in account
    if (channel === "facebook" && meta?.account) {
      payload.facebookPagesList = generateFacebookPages(meta.account);
    }
    try {
      await api.updateSiteSettings(payload);
      // Initialize Telegram webhook after saving token
      if (channel === "telegram") {
        await api.post("/telegram/init", {});
      }
    } catch {}
    setShowLogin(false);
    onDone && onDone(meta);
  }

  return (
    <div className="w-full rounded-[16px] border border-[#dfe5ee] bg-white p-6">
      <div className="flex items-center gap-3 text-[22px] font-semibold text-[#111827]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-white text-[18px]"
          style={{ background: cfg.iconBg }}>{cfg.icon}</span>
        {cfg.brand} {tr("integration", "integration")}
      </div>

      <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#fef3c7] text-[20px]">💡</div>

      {step === 0 && (
        <>
          <div className="mt-4 text-[15px] font-semibold text-[#111827]">{cfg.brand} {tr("integration", "integration")}</div>
          <div className="mt-1 text-[13px] text-[#64748b]">
            {tr("intgBeforeStart", "Before you start, you should prepare a few elements that are required to integrate with {brand}. Don't worry, we created a list of tips that guides you step by step.").replace("{brand}", cfg.brand)}
          </div>
          <div className="mt-5 text-[13px] font-semibold text-[#111827]">{tr("intgWhatYouNeed", "What you need")}</div>
          <ol className="mt-3 space-y-3">
            {cfg.intro.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px] text-[#334155]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e0edff] text-[11px] font-semibold text-[#2563eb]">{i + 1}</span>
                <span>{cfg.introKeys ? tr(cfg.introKeys[i], t) : t}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-center justify-between border-t border-[#eef2f7] pt-5">
            <button onClick={onCancel} className="rounded-[8px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("goBack", "Go back")}</button>
            <div className="flex gap-2">
              <button onClick={startIntegration} className="rounded-[8px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("skipTipsAndStart", "Skip tips and start integration")}</button>
              <button onClick={() => setStep(1)} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">{tr("continueBtn", "Continue")}</button>
            </div>
          </div>
        </>
      )}

      {step > 0 && step <= totalTips && (() => {
        const tip = cfg.tips[step - 1];
        const tipKeys = cfg.tipKeys?.[step - 1];
        const isLast = step === totalTips;
        const tipTitle = tipKeys?.titleKey ? tr(tipKeys.titleKey, tip.title) : tip.title;
        const tipBody = tipKeys?.bodyKey ? tr(tipKeys.bodyKey, tip.body) : tip.body;
        const tipLink = tipKeys?.linkKey ? tr(tipKeys.linkKey, tip.link) : tip.link;
        return (
          <>
            <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">{tr("tipXofY", "Tip {n} of {total}").replace("{n}", step).replace("{total}", totalTips)}</div>
            <div className="mt-1 text-[15px] font-semibold text-[#111827]">{tipTitle}</div>
            <div className="mt-2 text-[13px] text-[#64748b]">{tipBody}</div>
            {tipLink && <div className="mt-2 text-[13px] text-[#2563eb] cursor-pointer hover:underline">{tipLink}</div>}
            <div className="mt-8 flex items-center justify-between border-t border-[#eef2f7] pt-5">
              <button onClick={() => step === 1 ? setStep(0) : setStep(step - 1)}
                className="rounded-[8px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("goBack", "Go back")}</button>
              <div className="flex gap-2">
                <button onClick={startIntegration} className="rounded-[8px] border border-[#dfe5ee] bg-white px-4 py-2 text-[13px] text-[#334155]">{tr("skipTipsAndStart", "Skip tips and start integration")}</button>
                {isLast ? (
                  <button onClick={startIntegration} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">{tr("startIntegration", "Start integration")}</button>
                ) : (
                  <button onClick={() => setStep(step + 1)} className="rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">{tr("nextTip", "Next tip")}</button>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {showLogin && cfg.loginProvider === "facebook" && (
        <FacebookLoginModal brand={cfg.brand} onClose={() => setShowLogin(false)} onSuccess={handleSuccess} />
      )}
      {showLogin && cfg.loginProvider === "whatsapp" && (
        <WhatsAppVerifyModal onClose={() => setShowLogin(false)} onSuccess={handleSuccess} />
      )}
      {showLogin && cfg.loginProvider === "token" && (
        <TelegramTokenModal onClose={() => setShowLogin(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
