/**
 * Public API base URL. No secrets.
 *
 * Resolution order:
 * 1. ?api= query parameter
 * 2. globalThis.__WAGGY_API_BASE_URL__ (runtime-config.js, or serve.mjs when env is set)
 * 3. import.meta.env.VITE_WAGGY_API_BASE_URL when a bundler defines it
 * 4. <meta name="waggy-api-base">
 * 5. window.location.origin (same-origin only when this UI is served by the API itself)
 *
 * Do not hardcode localhost, production domains, or credentials here.
 * The public sandbox default lives in runtime-config.js so a separately
 * hosted frontend does not call its own origin.
 */
function stripSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function fromViteEnv() {
  try {
    var meta = import.meta;
    if (meta && meta.env && meta.env.VITE_WAGGY_API_BASE_URL) {
      return stripSlash(meta.env.VITE_WAGGY_API_BASE_URL);
    }
  } catch (_err) {
    /* native modules without a bundler have import.meta but no env map */
  }
  return "";
}

function injectedApiBase() {
  try {
    if (typeof globalThis !== "undefined" && globalThis.__WAGGY_API_BASE_URL__) {
      return stripSlash(globalThis.__WAGGY_API_BASE_URL__);
    }
  } catch (_err) {
    /* ignore hosts without globalThis */
  }
  if (typeof window !== "undefined" && window.__WAGGY_API_BASE_URL__) {
    return stripSlash(window.__WAGGY_API_BASE_URL__);
  }
  return "";
}

export function getApiBaseUrl() {
  var params = new URLSearchParams(window.location.search);
  var fromQuery = params.get("api");
  if (fromQuery) return stripSlash(fromQuery);
  var injected = injectedApiBase();
  if (injected) return injected;
  var fromVite = fromViteEnv();
  if (fromVite) return fromVite;
  var tag = document.querySelector('meta[name="waggy-api-base"]');
  if (tag && tag.content && tag.content.indexOf("__") !== 0) return stripSlash(tag.content);
  return stripSlash(window.location.origin);
}

export function bindApiLinks() {
  var base = getApiBaseUrl();
  document.querySelectorAll("[data-waggy-api-link]").forEach(function (anchor) {
    var path = anchor.getAttribute("data-waggy-api-link") || "";
    if (!path) return;
    if (path.charAt(0) !== "/") path = "/" + path;
    anchor.setAttribute("href", base + path);
  });
}
