/**
 * B2B Data Hub. Presentation and prototype ingestion only.
 * Analysis HTTP goes through src/api/client.js.
 */
import { createWaggyClient } from "../api/client.js";
import { WORKBENCH_EXAMPLE_REQUEST } from "../demo/dogs.js";
import { DEMO_CSV_FILES, TENANT_WAGTOPIA } from "./fixtures.js";
import { profileCsv, profileRDataset, testSqlConnection } from "./adapters.js";
import { catalogGaps, packagePerformance, packagePurchaseEvents, recommendationOutcomeEvents, DEMO_LABEL } from "./analytics.js";
import { explanationContext } from "./explain.js";
import { markAnalysis, markSent, startPipeline } from "./pipeline.js";
import { datasetsFor, resetDemo, saveDatasets, saveRun } from "./store.js";

var waggy = createWaggyClient();
var source = "csv";
var pipeline = null;
var lastAnalysis = null;
var section = "connect";
var apiNote = "";

function esc(value) {
  return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function mountB2bHub() {
  var root = document.getElementById("b2b-app");
  var open = document.getElementById("open-data-hub");
  var back = document.getElementById("close-data-hub");
  if (!root) return;
  if (open) open.addEventListener("click", function () { show(true); });
  if (back) back.addEventListener("click", function () { show(false); });
  root.addEventListener("click", onClick);
  if (location.pathname === "/data-hub") show(true);
  else render();
}

function show(on) {
  var root = document.getElementById("b2b-app");
  var layout = document.querySelector(".wb-layout");
  if (root) root.hidden = !on;
  if (layout) layout.hidden = on;
  if (on) render();
}

function onClick(event) {
  var button = event.target.closest("[data-b2b]");
  if (!button) return;
  var action = button.getAttribute("data-b2b");
  if (action === "section") {
    section = button.getAttribute("data-section");
    render();
    return;
  }
  if (action === "source") {
    source = button.getAttribute("data-source");
    render();
    return;
  }
  if (action === "sql-test") testSql();
  if (action === "process") processData();
  if (action === "reset") {
    resetDemo();
    pipeline = null;
    lastAnalysis = null;
    render();
  }
  if (action === "ask") ask();
}

function selectedCsvDatasets() {
  return Object.keys(DEMO_CSV_FILES).map(function (filename) {
    var dataset = profileCsv(filename, DEMO_CSV_FILES[filename]);
    dataset.tenant_id = TENANT_WAGTOPIA;
    return dataset;
  });
}

function testSql() {
  var result = testSqlConnection({
    host: value("sql-host"),
    database: value("sql-database"),
    username: value("sql-username"),
    password: value("sql-password"),
  });
  var box = document.getElementById("sql-result");
  if (!box) return;
  if (!result.ok) {
    box.textContent = result.message;
    return;
  }
  box.textContent = result.message + " Tables: " + result.tables.map(function (table) {
    return (table.selected ? "[x] " : "[ ] ") + table.name;
  }).join(", ");
}

function value(id) {
  var el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

async function processData() {
  var datasets = selectedCsvDatasets();
  saveDatasets(TENANT_WAGTOPIA, datasets);
  pipeline = startPipeline(datasets);
  render();
  pipeline = markSent(pipeline);
  render();
  var body = Object.assign({}, WORKBENCH_EXAMPLE_REQUEST, {
    role_context: { groomer: { observations: "", observed_conditions: [] }, business: { segment: "demo" } },
    correlation_id: "b2b-demo-001",
  });
  var response = await waggy.runWorkbenchAnalysis(body);
  lastAnalysis = response.ok ? response.body : null;
  pipeline = markAnalysis(pipeline, !!(response && response.ok));
  saveRun({
    tenant_id: TENANT_WAGTOPIA,
    ok: !!(response && response.ok),
    analysis_signature: lastAnalysis && lastAnalysis.analysis_signature,
    engine_version: lastAnalysis && lastAnalysis.engine_version,
    warehouse_version: lastAnalysis && lastAnalysis.warehouse_version,
  });
  apiNote = response.ok
    ? "Waggy API returned " + (lastAnalysis.schema || "an envelope") + " from the production workbench route."
    : "Waggy API did not return an analysis. Demo analytics below stay labeled simulated.";
  section = "insights";
  render();
}

async function ask() {
  var question = value("b2b-question") || "Why was Balanced Wellness recommended?";
  var analysis = lastAnalysis || (window.WagtopiaWorkbench && window.WagtopiaWorkbench.getAnalysis && window.WagtopiaWorkbench.getAnalysis());
  var result = explanationContext(analysis, question);
  var box = document.getElementById("b2b-answer");
  if (!analysis) {
    if (box) box.textContent = result.answer;
    return;
  }
  var response = await waggy.explainAnalysis({
    analysis_signature: analysis.analysis_signature || "",
    canonical: analysis.canonical || {},
    user_message: question,
    conversation_id: null,
    role: "business",
    bundle_id: result.context.balanced_bundle_id,
    dog_id: null,
    recalculation: null,
  });
  var apiMessage = response.ok && response.body && response.body.message ? response.body.message : "";
  if (box) {
    box.textContent = (apiMessage || result.answer) + "\n\nContext: " + JSON.stringify(result.context, null, 2);
  }
}

function render() {
  var root = document.getElementById("b2b-app");
  if (!root) return;
  var datasets = datasetsFor(TENANT_WAGTOPIA);
  var purchases = packagePurchaseEvents(TENANT_WAGTOPIA);
  var performance = packagePerformance(purchases);
  var catalogIds = ["joint_supplement", "dental_care", "dry_food"];
  var gaps = catalogGaps(catalogIds, recommendationOutcomeEvents(TENANT_WAGTOPIA));
  var provenance = provenanceBlock();
  root.innerHTML = [
    '<div class="b2b-nav">',
    nav("connect", "Connect Your Data"),
    nav("quality", "Data Quality"),
    nav("pipeline", "Pipeline"),
    nav("insights", "Generated Insights"),
    nav("packages", "Package Performance"),
    nav("gaps", "Catalog Gaps"),
    nav("feedback", "Feedback Loop"),
    nav("ask", "Ask Waggy"),
    nav("api", "API / Integration"),
    nav("provenance", "Data Provenance"),
    '<button type="button" data-b2b="reset">Reset demo</button>',
    "</div>",
    '<p class="wb-banner">Demo / Simulated client data. Not scientific evidence. Not another client\'s raw data.</p>',
    '<p class="wb-muted">' + esc(apiNote) + "</p>",
    body(datasets, performance, gaps, provenance),
  ].join("");
}

function nav(id, label) {
  return '<button type="button" data-b2b="section" data-section="' + id + '"' + (section === id ? ' class="is-active"' : "") + ">" + label + "</button>";
}

function body(datasets, performance, gaps, provenance) {
  if (section === "connect") return connectView();
  if (section === "quality") return qualityView(datasets);
  if (section === "pipeline") return pipelineView();
  if (section === "insights") return insightsView(performance, gaps);
  if (section === "packages") return packagesView(performance);
  if (section === "gaps") return gapsView(gaps);
  if (section === "feedback") return feedbackView();
  if (section === "ask") return askView();
  if (section === "api") return apiView();
  return "<pre class=\"wb-json\">" + esc(provenance) + "</pre>";
}

function connectView() {
  return [
    "<h2>Connect Your Data</h2>",
    "<p>Choose how you provide client-owned data. Waggy does not need your internal system diagram.</p>",
    '<p><button type="button" data-b2b="source" data-source="csv">CSV Files</button> ',
    '<button type="button" data-b2b="source" data-source="sql">SQL Database</button> ',
    '<button type="button" data-b2b="source" data-source="r">R Dataset</button></p>',
    source === "sql" ? sqlView() : source === "r" ? rView() : csvView(),
    '<p><button type="button" class="wb-primary" data-b2b="process">Process Data</button></p>',
  ].join("");
}

function csvView() {
  var rows = Object.keys(DEMO_CSV_FILES).map(function (filename) {
    var profile = profileCsv(filename, DEMO_CSV_FILES[filename]);
    var warnings = profile.quality_summary.warnings;
    return "<li><strong>" + esc(filename) + "</strong> — " + profile.record_count + " records. Columns: " +
      esc(profile.schema.join(", ")) + ". " + (warnings.length ? "Warning: " + esc(warnings.join("; ")) : "Valid.") + "</li>";
  }).join("");
  return "<h3>Wagtopia Demo CSV</h3><ul>" + rows + "</ul>";
}

function sqlView() {
  return [
    "<h3>SQL connection prototype</h3>",
    "<p>Real credentials would be handled by a server-side connection. This form is not saved.</p>",
    '<label>Host <input id="sql-host" value="demo.internal"></label>',
    '<label>Port <input id="sql-port" value="5432"></label>',
    '<label>Database <input id="sql-database" value="wagtopia_demo"></label>',
    '<label>Username <input id="sql-username" value="demo_reader"></label>',
    '<label>Password <input id="sql-password" type="password" autocomplete="off" placeholder="not saved"></label>',
    '<p><button type="button" data-b2b="sql-test">Test Connection</button></p>',
    '<p id="sql-result">Detected tables appear here. employees and payments stay unselected.</p>',
  ].join("");
}

function rView() {
  var rds = profileRDataset("catalog.rds");
  var sourceFile = profileRDataset("model.R");
  return "<h3>R Dataset</h3><p>" + esc(rds.dataset.source_name) + " — " + rds.dataset.record_count +
    " records. .RDS and .RData only.</p><p>" + esc(sourceFile.message) + "</p>";
}

function qualityView(datasets) {
  if (!datasets.length) return "<p>Process the demo CSV files to store a tenant-scoped quality summary.</p>";
  return "<ul>" + datasets.map(function (dataset) {
    return "<li>" + esc(dataset.tenant_id) + " · " + esc(dataset.source_name) + " · " + dataset.record_count +
      " · " + esc(dataset.status) + "</li>";
  }).join("") + "</ul>";
}

function pipelineView() {
  if (!pipeline) return "<p>Process Data to walk intake, profiling, quality, normalization, and the Waggy API call.</p>";
  return "<ol>" + pipeline.stages.map(function (stage) {
    return "<li>" + esc(stage.name) + " — " + esc(stage.status) + " · records " + stage.record_count +
      (stage.warnings.length ? " · " + esc(stage.warnings.join("; ")) : "") + "</li>";
  }).join("") + "</ol>";
}

function insightsView(performance, gaps) {
  return "<h2>Generated Insights</h2><p>" + DEMO_LABEL + "</p><p>Packages tracked: " + performance.length +
    ". Catalog gaps: " + gaps.length + ".</p>" + packagesView(performance) + gapsView(gaps);
}

function packagesView(performance) {
  return "<h3>Package performance</h3><ul>" + performance.map(function (row) {
    return "<li>" + esc(row.package_id) + " — recommended " + row.recommended + ", purchased " + row.purchased +
      ", conversion " + row.conversion + "%, revenue " + row.revenue + " (" + DEMO_LABEL + ")</li>";
  }).join("") + "</ul>";
}

function gapsView(gaps) {
  if (!gaps.length) return "<p>No catalog gap. A gap requires an explicit outcome event for a product absent from the catalog.</p>";
  return "<h3>Catalog gap</h3><ul>" + gaps.map(function (gap) {
    return "<li>" + esc(gap.display_name) + " — not in catalog. Exposed " + gap.customers_exposed +
      ". Reported purchases " + gap.reported_purchases + ". Demand " + gap.demand_signal + ". " + esc(gap.label) + "</li>";
  }).join("") + "</ul>";
}

function feedbackView() {
  return "<h2>Feedback loop prototype</h2><p>This is not production reinforcement learning.</p><ol><li>Recommendation</li><li>Client interaction</li><li>Outcome event</li><li>Analytics</li><li>Future model evaluation</li></ol>";
}

function askView() {
  return '<h2>Ask Waggy</h2><p>Answers use the current analysis envelope. Missing evidence is stated, not invented.</p><label>Question <input id="b2b-question" value="Why was Balanced Wellness recommended?"></label><p><button type="button" data-b2b="ask">Ask</button></p><pre id="b2b-answer" class="wb-json"></pre>';
}

function apiView() {
  return "<h2>Waggy API</h2><p>Send authorized dog context to POST /api/v1/presentation/workbench. You receive one envelope: canonical, four role projections, analysis_signature, api_version, engine_version, warehouse_version.</p><p>Input → Waggy processing → analysis → product matching → package optimization → evidence metadata → role outputs.</p><p>The scientific warehouse stays in the private core. This page does not contain it.</p>";
}

function provenanceBlock() {
  var signature = lastAnalysis && lastAnalysis.analysis_signature;
  return [
    "Insight: Fresh Frozen Nutrition is a potential catalog gap.",
    "Label: " + DEMO_LABEL,
    "Tenant: " + TENANT_WAGTOPIA,
    "Dataset: orders demo-v1",
    "Catalog: products demo-v1",
    "Analysis: " + (signature || "not returned yet"),
    "Engine: " + ((lastAnalysis && lastAnalysis.engine_version) || "waiting for Waggy API"),
    "Warehouse: " + ((lastAnalysis && lastAnalysis.warehouse_version) || "waiting for Waggy API"),
  ].join("\n");
}
