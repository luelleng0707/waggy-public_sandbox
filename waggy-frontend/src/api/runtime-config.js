/**
 * Public API base for this sandbox. Not a secret.
 * scripts/serve.mjs replaces this file only when WAGGY_API_BASE_URL is set.
 * config.js still lets ?api= override this value.
 */
var WAGGY_PUBLIC_API_BASE = "https://waggy-production.up.railway.app";
var waggyApiBase =
  (typeof globalThis !== "undefined" && globalThis.__WAGGY_API_BASE_URL__) ||
  WAGGY_PUBLIC_API_BASE;
if (typeof globalThis !== "undefined") globalThis.__WAGGY_API_BASE_URL__ = waggyApiBase;
if (typeof window !== "undefined") window.__WAGGY_API_BASE_URL__ = waggyApiBase;
