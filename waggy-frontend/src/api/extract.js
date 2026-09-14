/**
 * Read structured results from a Waggy API envelope.
 * Presentation navigation only — not scientific or optimizer logic.
 */

function canonical(envelope) {
  if (!envelope || typeof envelope !== "object") return {};
  if (envelope.canonical && typeof envelope.canonical === "object") return envelope.canonical;
  return envelope;
}

export function healthFromAnalysis(envelope) {
  var science = canonical(envelope).scientific_analysis || {};
  return {
    findings: science.findings || [],
    warehouse_status: science.warehouse_status || null,
  };
}

export function nutritionFromAnalysis(envelope) {
  var science = canonical(envelope).scientific_analysis || {};
  return {
    nutrient_targets: science.nutrient_targets || [],
  };
}

export function productsFromAnalysis(envelope) {
  var matching = canonical(envelope).product_matching || {};
  return matching.recommendations || [];
}

export function packageOptionsFromAnalysis(envelope) {
  var opt = canonical(envelope).package_optimization || {};
  return opt.package_options || {};
}

export function provenanceFromAnalysis(envelope) {
  var env = envelope && typeof envelope === "object" ? envelope : {};
  var inner = canonical(env);
  var science = inner.scientific_analysis || {};
  var opt = inner.package_optimization || {};
  return {
    engine_version: env.engine_version || null,
    warehouse_version: env.warehouse_version || null,
    analysis_signature: env.analysis_signature || inner.analysis_id || null,
    optimizer: opt.search || null,
    evidence: science.evidence || [],
  };
}

export function recalculationFromRecompute(payload) {
  if (!payload || typeof payload !== "object") return null;
  return payload.explanation || null;
}
