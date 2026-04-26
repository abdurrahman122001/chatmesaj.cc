/*
 * Chatbot widget embed script
 *
 * İstifadə (müştəri saytında):
 *   <script>
 *     window.ChatbotConfig = { apiKey: "site_abcdef", apiUrl: "https://your-chatbot.com" };
 *   </script>
 *   <script src="https://your-chatbot.com/widget-embed.js" async></script>
 *
 * Bu script iframe-lə widget-i hər hansı sayta embed edir.
 * Shadow DOM / CSS izolyasiya iframe ilə avtomatik təmin olunur.
 */
(function () {
  "use strict";
  if (window.__ChatbotWidgetLoaded) return;
  window.__ChatbotWidgetLoaded = true;

  var cfg = window.ChatbotConfig || {};
  var apiKey = cfg.apiKey;
  if (!apiKey) {
    console.warn("[Chatbot] window.ChatbotConfig.apiKey təyin edilməyib.");
    return;
  }
  var apiUrl = (cfg.apiUrl || "").replace(/\/$/, "");
  if (!apiUrl) {
    // Script src-dən avtomatik təyin et
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || "";
      if (src.indexOf("widget-embed.js") !== -1) {
        var url = new URL(src);
        apiUrl = url.origin;
        break;
      }
    }
  }

  var embedSrc = apiUrl + "/embed.html?apiKey=" + encodeURIComponent(apiKey) + "&apiUrl=" + encodeURIComponent(apiUrl);
  if (cfg.title) embedSrc += "&title=" + encodeURIComponent(cfg.title);
  if (cfg.subtitle) embedSrc += "&subtitle=" + encodeURIComponent(cfg.subtitle);

  function mount() {
    if (document.getElementById("__chatbot-widget-iframe")) return;
    var iframe = document.createElement("iframe");
    iframe.id = "__chatbot-widget-iframe";
    iframe.src = embedSrc;
    iframe.title = "Support chat";
    iframe.setAttribute("allow", "clipboard-write; microphone");
    iframe.style.cssText = [
      "position:fixed",
      "bottom:0",
      "right:0",
      "width:400px",
      "height:680px",
      "max-width:100vw",
      "max-height:100vh",
      "border:0",
      "z-index:2147483647",
      "background:transparent",
      "color-scheme:light",
    ].join(";") + ";";
    document.body.appendChild(iframe);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
