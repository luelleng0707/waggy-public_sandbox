import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BACKEND_TOKENS = [
  "from app.",
  "import app.",
  "scientific_care",
  "app/agent/package_search",
  "app/agent/package_optimizer",
  "app/data/repository",
  "DataRepository",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "warehouse/biology",
  "../../../app/",
];

function walkSrc() {
  const out = [];
  const src = path.join(root, "src");
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(full);
    }
  }
  walk(src);
  out.push(path.join(root, "index.html"));
  out.push(path.join(root, "package.json"));
  return out;
}

test("frontend tree has no Python, warehouse, or engine imports", () => {
  const files = walkSrc().filter((file) =>
    /\.(js|mjs|html|css|json)$/i.test(file)
  );
  for (const file of files) {
    const rel = path.relative(root, file).replaceAll("\\", "/");
    const text = fs.readFileSync(file, "utf8");
    for (const token of BACKEND_TOKENS) {
      assert.equal(text.includes(token), false, rel + " contains " + token);
    }
  }
});

test("copied tree contains no warehouse files, Python, or SKU fixtures", () => {
  const csv = [];
  const py = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".csv")) csv.push(full);
      else if (entry.name.endsWith(".py")) py.push(full);
    }
  }
  walk(root);
  assert.equal(csv.length, 0);
  assert.equal(py.length, 0);
  const workbench = fs.readFileSync(path.join(root, "src/workbench.js"), "utf8");
  assert.equal(workbench.includes("SF001"), false);
  assert.equal(workbench.includes("fetch("), false);
  assert.match(workbench, /from "\.\/api\/client\.js"/);
  assert.equal(/\nimport .* from ["']\.\.\//.test(workbench), false);
});

test("demo data is marked synthetic", () => {
  const demo = fs.readFileSync(path.join(root, "src/demo/dogs.js"), "utf8");
  assert.match(demo, /SYNTHETIC \/ DEMO ONLY/);
  assert.equal(demo.includes("SF001"), false);
});

test("API base URL is configurable and not hardcoded to a private host in app code", () => {
  const config = fs.readFileSync(path.join(root, "src/api/config.js"), "utf8");
  assert.match(config, /getApiBaseUrl/);
  assert.match(config, /location\.origin/);
  assert.equal(config.includes("localhost:8000"), false);
  assert.equal(config.includes("127.0.0.1"), false);
  const client = fs.readFileSync(path.join(root, "src/api/client.js"), "utf8");
  assert.match(client, /\/api\/v1\/presentation\/workbench/);
  assert.match(client, /runWorkbenchAnalysis/);
  assert.match(client, /recomputeDogPreferences/);
  assert.match(client, /compareAnalyses/);
});

test("javascript modules parse without the original repository", () => {
  const files = [
    "src/workbench.js",
    "src/api/client.js",
    "src/api/config.js",
    "src/api/errors.js",
    "src/api/extract.js",
    "src/api/types.js",
    "src/api/runtime-config.js",
    "src/demo/dogs.js",
    "scripts/serve.mjs",
    "scripts/build.mjs",
  ];
  for (const rel of files) {
    const result = spawnSync(process.execPath, ["--check", path.join(root, rel)], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, rel + "\n" + result.stderr);
  }
});
