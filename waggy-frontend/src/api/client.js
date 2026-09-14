/**
 * Explicit Waggy HTTP client. Presentation layer only.
 * Does not calculate nutrients, optimize packages, or read the warehouse.
 */
import { getApiBaseUrl } from "./config.js";
import { parseErrorPayload } from "./errors.js";

export const PATHS = Object.freeze({
  WORKBENCH: "/api/v1/presentation/workbench",
  ANALYZE: "/api/v1/analyze",
  AI_EXPLAIN: "/api/v1/ai/explain",
  DOGS: "/api/v1/dogs",
  HEALTH: "/health",
  DOCS: "/docs",
  OPENAPI: "/openapi.json",
});

function joinUrl(base, path) {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return String(base || "") + (path.charAt(0) === "/" ? path : "/" + path);
}

function queryString(params) {
  if (!params) return "";
  var search = new URLSearchParams();
  Object.keys(params).forEach(function (key) {
    var value = params[key];
    if (value == null || value === "") return;
    search.set(key, String(value));
  });
  var text = search.toString();
  return text ? "?" + text : "";
}

export function createWaggyClient(options) {
  var opts = options || {};

  function baseUrl() {
    return opts.baseUrl != null ? String(opts.baseUrl).replace(/\/$/, "") : getApiBaseUrl();
  }

  async function send(method, path, json, params) {
    var url = joinUrl(baseUrl(), path) + queryString(params);
    var response;
    try {
      response = await fetch(url, {
        method: method,
        headers: json != null ? { "Content-Type": "application/json" } : {},
        body: json != null ? JSON.stringify(json) : undefined,
      });
    } catch (err) {
      return {
        ok: false,
        network: true,
        status: 0,
        statusText: "network error",
        text: String(err && err.message ? err.message : err || ""),
        body: null,
        url: url,
      };
    }
    var text = await response.text();
    var body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch (_err) {
      body = null;
    }
    return {
      ok: response.ok,
      network: false,
      status: response.status,
      statusText: response.statusText,
      text: text,
      body: body,
      url: url,
      parsedError: response.ok ? null : parseErrorPayload(response.status, response.statusText, text),
    };
  }

  return {
    PATHS: PATHS,
    getApiBaseUrl: baseUrl,

    getDogProfile: function (dogId) {
      return send("GET", PATHS.DOGS + "/" + encodeURIComponent(dogId));
    },
    createDog: function (payload) {
      return send("POST", PATHS.DOGS, payload);
    },
    patchDog: function (dogId, payload) {
      return send("PATCH", PATHS.DOGS + "/" + encodeURIComponent(dogId), payload);
    },
    listDogEvents: function (dogId) {
      return send("GET", PATHS.DOGS + "/" + encodeURIComponent(dogId) + "/events");
    },
    listDogPreferences: function (dogId) {
      return send("GET", PATHS.DOGS + "/" + encodeURIComponent(dogId) + "/preferences");
    },

    /**
     * One Waggy analysis. Health, nutrition, products, and packages are
     * projections of this envelope. The frontend does not calculate them.
     */
    runWorkbenchAnalysis: function (payload) {
      return send("POST", PATHS.WORKBENCH, payload);
    },
    analyzeHealth: function (payload) {
      return send("POST", PATHS.WORKBENCH, payload);
    },
    calculateNutrition: function (payload) {
      return send("POST", PATHS.WORKBENCH, payload);
    },
    getProducts: function (payload) {
      return send("POST", PATHS.WORKBENCH, payload);
    },
    getPackageOptions: function (payload) {
      return send("POST", PATHS.WORKBENCH, payload);
    },

    recomputeDogPreferences: function (dogId, payload) {
      return send(
        "POST",
        PATHS.DOGS + "/" + encodeURIComponent(dogId) + "/recompute",
        payload || {}
      );
    },
    compareAnalyses: function (dogId, params) {
      return send(
        "GET",
        PATHS.DOGS + "/" + encodeURIComponent(dogId) + "/analyses/compare",
        null,
        params
      );
    },
    getRecalculationExplanation: function (dogId, params) {
      return send(
        "GET",
        PATHS.DOGS + "/" + encodeURIComponent(dogId) + "/analyses/compare",
        null,
        params
      );
    },

    explainAnalysis: function (payload) {
      return send("POST", PATHS.AI_EXPLAIN, payload);
    },
  };
}

export const waggyClient = createWaggyClient();
