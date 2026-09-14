/**
 * Make the generated Prisma client resolve to its WASM build on Cloudflare Workers.
 *
 * Prisma generates conditional exports that list "node" before "workerd":
 *
 *   "#main-entry-point": { "require": { "node": "./index.js", "workerd": "./wasm.js", ... } }
 *
 * Conditions are matched in the order they appear in package.json, and OpenNext
 * bundles the worker with esbuild's node platform (which always activates the
 * "node" condition) plus an explicit "workerd" condition. "node" therefore wins
 * and the worker gets index.js, whose runtime loads the query compiler with
 * readAll() off a filesystem that does not exist on Workers, so every query
 * fails with:
 *
 *   no such file or directory, readAll '/bundle/node_modules/.prisma/client/query_compiler_bg.wasm'
 *
 * Hoisting "workerd"/"worker" above "node" makes that build resolve wasm.js,
 * which imports the .wasm as a module for wrangler to bundle. Toolchains that do
 * not set the workerd condition (next dev) still match "node" and are unaffected.
 *
 * Runs from postinstall, after `prisma generate` regenerates the file.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PKG = "node_modules/.prisma/client/package.json";
const WORKER_CONDITIONS = ["workerd", "worker"];

if (!existsSync(PKG)) {
  console.log(`[patch-prisma-workerd] ${PKG} not found, skipping.`);
  process.exit(0);
}

/** Hoist the worker conditions above "node", recursing through nested maps. */
function hoist(node) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return node;

  const hasWorkerCondition = WORKER_CONDITIONS.some((c) => c in node);
  const needsHoist =
    hasWorkerCondition &&
    "node" in node &&
    Object.keys(node).indexOf("node") <
      Math.min(...WORKER_CONDITIONS.filter((c) => c in node).map((c) => Object.keys(node).indexOf(c)));

  const entries = Object.entries(node).map(([key, value]) => [key, hoist(value)]);
  if (!needsHoist) return Object.fromEntries(entries);

  const workerEntries = entries.filter(([key]) => WORKER_CONDITIONS.includes(key));
  const rest = entries.filter(([key]) => !WORKER_CONDITIONS.includes(key));
  return Object.fromEntries([...workerEntries, ...rest]);
}

const pkg = JSON.parse(readFileSync(PKG, "utf8"));
const before = JSON.stringify(pkg);

for (const key of [".", "./client"]) {
  if (pkg.exports?.[key]) pkg.exports[key] = hoist(pkg.exports[key]);
}
if (pkg.imports?.["#main-entry-point"]) {
  pkg.imports["#main-entry-point"] = hoist(pkg.imports["#main-entry-point"]);
}

if (JSON.stringify(pkg) === before) {
  console.log("[patch-prisma-workerd] Already ordered for workerd, nothing to do.");
} else {
  writeFileSync(PKG, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("[patch-prisma-workerd] Hoisted workerd conditions above node.");
}
