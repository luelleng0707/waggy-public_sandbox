import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("named client operations map to existing HTTP contracts", () => {
  const client = fs.readFileSync(path.join(root, "src/api/client.js"), "utf8");
  const required = [
    "getDogProfile",
    "analyzeHealth",
    "calculateNutrition",
    "getProducts",
    "getPackageOptions",
    "getRecalculationExplanation",
    "compareAnalyses",
    "recomputeDogPreferences",
    "runWorkbenchAnalysis",
    "explainAnalysis",
  ];
  for (const name of required) {
    assert.match(client, new RegExp(name + "\\s*:"), name);
  }
  assert.match(client, /POST.*PATHS\.WORKBENCH|send\("POST", PATHS\.WORKBENCH/);
  assert.equal(client.includes("generate_reproducible_report("), false);
});

test("extractors only read API JSON", () => {
  const extract = fs.readFileSync(path.join(root, "src/api/extract.js"), "utf8");
  assert.match(extract, /healthFromAnalysis/);
  assert.match(extract, /nutritionFromAnalysis/);
  assert.match(extract, /packageOptionsFromAnalysis/);
  assert.match(extract, /provenanceFromAnalysis/);
  assert.equal(extract.includes("2 **"), false);
  assert.equal(extract.includes("prevalence"), false);
});
