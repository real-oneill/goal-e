const fs = require("fs");
const path = require("path");

const scriptPath = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "react-native",
  "sdks",
  "hermes-engine",
  "utils",
  "build-apple-framework.sh"
);

if (!fs.existsSync(scriptPath)) {
  console.log("[patch-hermes] build-apple-framework.sh not found, skipping");
  process.exit(0);
}

let src = fs.readFileSync(scriptPath, "utf8");

const MARKER = "# patched-libhermes";
if (src.includes(MARKER)) {
  console.log("[patch-hermes] Already patched, skipping");
  process.exit(0);
}

const before = src;
src = src.replace(/--target libhermes/g, `--target hermes ${MARKER}`);

if (src === before) {
  console.log("[patch-hermes] Pattern '--target libhermes' not found — may already be fixed upstream");
  process.exit(0);
}

fs.writeFileSync(scriptPath, src, "utf8");
fs.chmodSync(scriptPath, 0o755);
console.log("[patch-hermes] Patched: --target libhermes -> --target hermes");
