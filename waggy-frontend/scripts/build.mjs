#!/usr/bin/env node
/** Copy the portable frontend into dist/. No bundler, no secrets. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
copyDir(path.join(root, "src"), path.join(dist, "src"));
if (fs.existsSync(path.join(root, "public"))) {
  copyDir(path.join(root, "public"), dist);
}
fs.copyFileSync(path.join(root, ".env.example"), path.join(dist, ".env.example"));
console.log("wrote " + dist);
