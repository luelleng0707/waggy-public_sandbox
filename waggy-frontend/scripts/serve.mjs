#!/usr/bin/env node
/**
 * Independent static host for waggy-frontend.
 * Injects WAGGY_API_BASE_URL into /src/api/runtime-config.js.
 * No secrets. Default API URL is a local development value only.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 5173);
const apiBase = String(
  process.env.WAGGY_API_BASE_URL || process.env.VITE_WAGGY_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent((requestPath || "/").split("?")[0]);
  const target = path.resolve(base, "." + decoded);
  if (!target.startsWith(base)) return null;
  return target;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (url.pathname === "/src/api/runtime-config.js") {
    const body =
      "window.__WAGGY_API_BASE_URL__ = " + JSON.stringify(apiBase) + ";\n";
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(body);
    return;
  }
  if (url.pathname === "/favicon.ico" || url.pathname === "/favicon.svg") {
    const icon = path.join(root, "public", "favicon.svg");
    if (fs.existsSync(icon)) {
      res.writeHead(200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(icon).pipe(res);
      return;
    }
  }
  let filePath = safeJoin(root, url.pathname === "/" ? "/index.html" : url.pathname);
  if (!filePath) {
    res.writeHead(400);
    res.end("bad path");
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const fromPublic = safeJoin(path.join(root, "public"), url.pathname);
    if (fromPublic && fs.existsSync(fromPublic) && fs.statSync(fromPublic).isFile()) {
      filePath = fromPublic;
    }
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": TYPES[ext] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  fs.createReadStream(filePath).pipe(res);
});

if (process.argv.includes("--check")) {
  for (const rel of [
    "index.html",
    "package.json",
    "src/workbench.js",
    "src/api/client.js",
    "src/api/config.js",
    "src/styles/workbench.css",
    "src/demo/dogs.js",
  ]) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) {
      console.error("missing " + rel);
      process.exit(1);
    }
  }
  console.log("waggy-frontend static tree ok");
  process.exit(0);
}

server.listen(port, "127.0.0.1", () => {
  console.log("waggy-frontend http://127.0.0.1:" + port);
  console.log("Waggy API " + apiBase);
});
