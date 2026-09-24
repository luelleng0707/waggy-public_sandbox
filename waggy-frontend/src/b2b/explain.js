/**
 * Explanation context is taken from an API envelope.
 * This module does not invent findings, citations, or package choices.
 */

export function explanationContext(analysis, question) {
  var envelope = analysis && typeof analysis === "object" ? analysis : null;
  if (!envelope) {
    return {
      answer: "Insufficient evidence in the current analysis.",
      context: { analysis_present: false, question: question || "" },
    };
  }
  var canonical = envelope.canonical || {};
  var customer = (envelope.roles && envelope.roles.customer) || {};
  var packages = (customer.wellness && customer.wellness.package_options) || {};
  var findings = (customer.health_analysis && customer.health_analysis.findings) || [];
  var balanced = (packages.balanced || [])[0] || null;
  var hasEvidence = findings.some(function (row) { return row && (row.scientific_quote || row.paper_name); });
  var lines = [];
  if (balanced) {
    lines.push("Balanced Wellness is the first balanced package returned by the Waggy API for this analysis.");
    if (balanced.monthly_cost != null) lines.push("Reported monthly cost: " + balanced.monthly_cost + ".");
    var names = (balanced.products || []).map(function (item) { return item.product_name || item.name; }).filter(Boolean);
    if (names.length) lines.push("Products in that package: " + names.join(", ") + ".");
  } else if (!findings.length) {
    lines.push("Insufficient evidence in the current analysis.");
  } else {
    lines.push("The current analysis has findings, and no balanced package option was returned.");
  }
  if (!hasEvidence) lines.push("No paper citation was present on the findings in this envelope.");
  return {
    answer: lines.join(" "),
    context: {
      analysis_present: true,
      question: question || "",
      analysis_signature: envelope.analysis_signature || null,
      engine_version: envelope.engine_version || null,
      warehouse_version: envelope.warehouse_version || null,
      api_version: envelope.api_version || null,
      finding_count: findings.length,
      balanced_bundle_id: balanced && balanced.bundle_id || null,
      canonical_present: !!canonical,
    },
  };
}
