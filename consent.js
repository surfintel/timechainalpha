/*! SurfIntel cookie consent v1 (2026-10-20). One file, no dependencies.
 * Load it FIRST in <head>, synchronously, before Google Analytics:
 *   <script src="/consent.js" data-privacy="/privacy" data-analytics="on"></script>
 * - Google Consent Mode v2 defaults to DENIED, so no analytics or ad cookies
 *   are written until the visitor accepts. A stored choice is applied at once.
 * - Accept and Reject are equal-weight buttons; the page is never blocked.
 * - The choice is kept for 12 months in localStorage (key "si_consent").
 * - A small "Cookies" button, any link to #cookie-settings, or
 *   window.siConsent.open() reopens the choice.
 * - data-analytics="off" (sites with no analytics): an informational notice
 *   with a single "Got it".
 */
(function () {
  var KEY = "si_consent", TTL = 365 * 864e5;
  var me = document.currentScript;
  var privacy = (me && me.getAttribute("data-privacy")) || "";
  var analytics = !me || me.getAttribute("data-analytics") !== "off";
  var w = window;
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  if (typeof w.gtag !== "function") w.gtag = gtag;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      return v && v.t && Date.now() - v.t < TTL ? v : null;
    } catch (e) { return null; }
  }
  function grants(ok) {
    var s = ok ? "granted" : "denied";
    return { analytics_storage: s, ad_storage: s, ad_user_data: s, ad_personalization: s };
  }
  var saved = read();
  // Defaults before any tag fires. Security storage is always allowed.
  var d = grants(false); d.functionality_storage = "granted"; d.security_storage = "granted"; d.wait_for_update = 500;
  gtag("consent", "default", d);
  gtag("set", "ads_data_redaction", true);
  if (saved) gtag("consent", "update", grants(saved.analytics));

  function save(ok) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: !!ok, t: Date.now(), v: 1 })); } catch (e) {}
    gtag("consent", "update", grants(ok));
    try { w.dispatchEvent(new CustomEvent("si:consent", { detail: { analytics: !!ok } })); } catch (e) {}
  }

  var css =
    ".sic{position:fixed;z-index:2147483000;left:16px;bottom:16px;max-width:420px;box-sizing:border-box;" +
    "font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#15181d;background:#fff;" +
    "border:1px solid #d5d8dc;border-radius:12px;padding:16px 16px 14px;box-shadow:0 12px 36px -12px rgba(0,0,0,.35)}" +
    ".sic p{margin:0 0 12px}.sic a{color:inherit;text-decoration:underline;text-underline-offset:2px}" +
    ".sic-row{display:flex;gap:8px;flex-wrap:wrap}" +
    ".sic button{font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;min-height:40px;padding:0 16px;" +
    "border-radius:8px;cursor:pointer;flex:1 1 auto;border:1px solid #15181d}" +
    ".sic-yes{background:#15181d;color:#fff}.sic-no{background:#fff;color:#15181d}" +
    ".sic button:focus-visible,.sic-chip:focus-visible{outline:3px solid #1f63b0;outline-offset:2px}" +
    ".sic-chip{position:fixed;z-index:2147482999;left:12px;bottom:12px;font:600 12px/1 system-ui,-apple-system,sans-serif;" +
    "min-height:32px;padding:0 12px;border-radius:999px;border:1px solid #d5d8dc;background:#fff;color:#15181d;cursor:pointer;opacity:.85}" +
    ".sic-chip:hover{opacity:1}" +
    "@media (max-width:520px){.sic{left:8px;right:8px;bottom:8px;max-width:none}}" +
    "@media (prefers-color-scheme:dark){.sic,.sic-chip{background:#12161c;color:#e9edf2;border-color:#313946}" +
    ".sic button{border-color:#e9edf2}.sic-yes{background:#e9edf2;color:#0c0f13}.sic-no{background:#12161c;color:#e9edf2}}" +
    "@media print{.sic,.sic-chip{display:none}}";

  var box, chip;
  function mount() {
    if (document.getElementById("sic-style")) return;
    var st = document.createElement("style"); st.id = "sic-style"; st.textContent = css; document.head.appendChild(st);
  }
  function close() { if (box) { box.remove(); box = null; } showChip(); }
  function open() {
    mount();
    if (chip) { chip.remove(); chip = null; }
    if (box) return;
    box = document.createElement("section");
    box.className = "sic"; box.setAttribute("role", "region"); box.setAttribute("aria-label", "Cookie choices");
    var link = privacy ? ' See our <a href="' + privacy + '">privacy policy</a>.' : "";
    box.innerHTML = analytics
      ? "<p>We use essential storage to run this site (and its chat, if it has one). With your OK we also use Google Analytics cookies to understand how the site is used." + link + "</p>" +
        '<div class="sic-row"><button type="button" class="sic-no">Reject</button><button type="button" class="sic-yes">Accept</button></div>'
      : "<p>This site uses only essential storage. Partner sites you visit from our links may set their own cookies." + link + "</p>" +
        '<div class="sic-row"><button type="button" class="sic-yes">Got it</button></div>';
    var yes = box.querySelector(".sic-yes"), no = box.querySelector(".sic-no");
    yes.addEventListener("click", function () { save(true); close(); });
    if (no) no.addEventListener("click", function () { save(false); close(); });
    document.body.appendChild(box);
  }
  function showChip() {
    if (chip || box) return;
    chip = document.createElement("button");
    chip.type = "button"; chip.className = "sic-chip"; chip.textContent = "Cookies";
    chip.setAttribute("aria-label", "Cookie settings");
    chip.addEventListener("click", open);
    document.body.appendChild(chip);
  }
  w.siConsent = { open: open, get: read, reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} open(); } };
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href$="#cookie-settings"]');
    if (a) { e.preventDefault(); open(); }
  });
  // Mount after the page has loaded: a framework that re-renders the whole
  // document while hydrating (React 18 on a hydration mismatch) would
  // otherwise wipe out the banner. If anything removes it later, put it back.
    function keep() {
    new MutationObserver(function () {
      if (!document.getElementById("sic-style")) { mount(); }
      if (box && !box.isConnected) document.body.appendChild(box);
      if (chip && !chip.isConnected) document.body.appendChild(chip);
    }).observe(document, { childList: true, subtree: true });
  }
  function start() { mount(); if (read()) showChip(); else open(); keep(); }
  function later() { setTimeout(start, 50); }
  if (document.readyState === "complete") later(); else w.addEventListener("load", later);
})();
