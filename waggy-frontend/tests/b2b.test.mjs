import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { profileCsv, profileRDataset, testSqlConnection } from "../src/b2b/adapters.js";
import { catalogGaps, packagePerformance, packagePurchaseEvents, recommendationOutcomeEvents, rowsForTenant } from "../src/b2b/analytics.js";
import { explanationContext } from "../src/b2b/explain.js";
import { DEMO_CSV_FILES, PRODUCTS_CSV, TENANT_OTHER, TENANT_WAGTOPIA } from "../src/b2b/fixtures.js";
import { startPipeline } from "../src/b2b/pipeline.js";
import { datasetsFor, resetDemo, saveDatasets } from "../src/b2b/store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("csv ingestion profiles products and warns on missing category", () => {
  const profile = profileCsv("products.csv", PRODUCTS_CSV);
  assert.equal(profile.record_count, 4);
  assert.ok(profile.schema.includes("product_id"));
  assert.ok(profile.schema.includes("price"));
  assert.match(profile.quality_summary.warnings.join(" "), /missing category/);
});

test("sql mock ingestion does not keep the password", () => {
  const result = testSqlConnection({ host: "db", database: "demo", username: "reader", password: "secret-value" });
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(result).includes("secret-value"), false);
  assert.ok(result.tables.some((table) => table.name === "products" && table.selected));
  assert.ok(result.tables.some((table) => table.name === "employees" && table.selected === false));
});

test("r dataset accepts rds and rejects R source", () => {
  assert.equal(profileRDataset("catalog.rds").ok, true);
  const rejected = profileRDataset("model.R");
  assert.equal(rejected.ok, false);
  assert.match(rejected.message, /not a dataset/);
});

test("dataset profiling and quality validation see every demo csv", () => {
  const datasets = Object.keys(DEMO_CSV_FILES).map((name) => profileCsv(name, DEMO_CSV_FILES[name]));
  assert.equal(datasets.length, 5);
  assert.ok(datasets.every((dataset) => dataset.record_count > 0));
  assert.equal(startPipeline(datasets).stages[0].status, "complete");
  assert.equal(startPipeline(datasets).stages[4].status, "pending");
});

test("tenant isolation hides raw rows from another tenant", () => {
  resetDemo();
  saveDatasets(TENANT_WAGTOPIA, [profileCsv("products.csv", PRODUCTS_CSV)]);
  saveDatasets(TENANT_OTHER, [profileCsv("customers.csv", DEMO_CSV_FILES["customers.csv"])]);
  const wagtopia = datasetsFor(TENANT_WAGTOPIA);
  assert.equal(wagtopia.length, 1);
  assert.equal(wagtopia[0].source_name, "products.csv");
  assert.equal(rowsForTenant(datasetsFor(TENANT_OTHER), TENANT_WAGTOPIA).length, 0);
  resetDemo();
  assert.equal(datasetsFor(TENANT_WAGTOPIA).length, 0);
});

test("purchase events, outcomes, and catalog gaps stay tenant scoped and labeled", () => {
  const purchases = packagePurchaseEvents(TENANT_WAGTOPIA);
  const performance = packagePerformance(purchases);
  assert.equal(performance[1].package_id, "balanced");
  assert.equal(performance[1].purchased, 141);
  assert.equal(performance[1].label, "Demo / Simulated");
  const gaps = catalogGaps(["joint_supplement", "dental_care", "dry_food"], recommendationOutcomeEvents(TENANT_WAGTOPIA));
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].product_id, "fresh_frozen_nutrition");
  assert.equal(gaps[0].catalog_status, "not_in_catalog");
  assert.equal(catalogGaps(["fresh_frozen_nutrition"], recommendationOutcomeEvents(TENANT_WAGTOPIA)).length, 0);
});

test("explanation context does not invent evidence", () => {
  assert.match(explanationContext(null, "Why?").answer, /Insufficient evidence/);
  const explained = explanationContext({
    analysis_signature: "abc",
    engine_version: "2.1.0",
    canonical: {},
    roles: { customer: { wellness: { package_options: { balanced: [{ bundle_id: "b1", monthly_cost: 10, products: [] }] } }, health_analysis: { findings: [] } } },
  }, "Why was Balanced Wellness recommended?");
  assert.match(explained.answer, /Balanced Wellness/);
  assert.match(explained.answer, /No paper citation/);
  assert.equal(explained.context.analysis_signature, "abc");
});

test("api mapping and production base stay out of call sites", () => {
  const client = fs.readFileSync(path.join(root, "src/api/client.js"), "utf8");
  const hub = fs.readFileSync(path.join(root, "src/b2b/hub.js"), "utf8");
  const workbench = fs.readFileSync(path.join(root, "src/workbench.js"), "utf8");
  assert.match(client, /\/api\/v1\/presentation\/workbench/);
  assert.equal(hub.includes("fetch("), false);
  assert.equal(workbench.includes("fetch("), false);
  assert.match(fs.readFileSync(path.join(root, "src/api/runtime-config.js"), "utf8"), /https:\/\/waggy-production\.up\.railway\.app/);
  const shipped = [hub, workbench, client].join("\n");
  for (const token of ["GEMINI_API_KEY", "OPENAI_API_KEY", "DATABASE_URL", "RAILWAY_TOKEN"]) {
    assert.equal(shipped.includes(token + "="), false);
  }
});
