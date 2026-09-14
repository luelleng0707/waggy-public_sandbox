/**
 * Typed API errors for the workbench. Does not invent scientific values.
 */

export class ApiError extends Error {
  constructor({ code, message, status, field, body, network }) {
    super(message || "API request failed");
    this.name = "ApiError";
    this.code = code || (network ? "API_UNAVAILABLE" : "API_ERROR");
    this.status = status || 0;
    this.field = field || null;
    this.body = body || null;
    this.network = Boolean(network);
  }
}

export function parseErrorPayload(status, statusText, text) {
  var parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (_err) {
    parsed = null;
  }
  if (parsed && parsed.error && parsed.error.message) {
    return {
      code: parsed.error.code || "API_ERROR",
      message:
        (parsed.error.code ? parsed.error.code + ": " : "") +
        parsed.error.message +
        (parsed.error.field ? " (" + parsed.error.field + ")" : ""),
      field: parsed.error.field || null,
      body: parsed,
    };
  }
  if (parsed && parsed.detail) {
    return {
      code: "API_ERROR",
      message: "API failure " + status + " · " + String(parsed.detail),
      field: null,
      body: parsed,
    };
  }
  return {
    code: status === 0 ? "API_UNAVAILABLE" : "API_ERROR",
    message:
      "API failure " +
      status +
      " " +
      (statusText || "") +
      (text ? " · " + String(text).slice(0, 280) : ""),
    field: null,
    body: parsed,
  };
}

export function formatApiError(status, statusText, text) {
  return parseErrorPayload(status, statusText, text).message;
}
