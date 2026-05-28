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

const MARKER = "# [patched: ninja + cmake-project-include]";
if (src.includes(MARKER)) {
  console.log("[patch-hermes] Already patched, skipping");
  process.exit(0);
}

src = src.replace(
  "-DIMPORT_HERMESC:PATH=\"$IMPORT_HERMESC_PATH\" \\",
  `-DIMPORT_HERMESC:PATH=\"$IMPORT_HERMESC_PATH\" \\\n      -DCMAKE_PROJECT_INCLUDE=\"$IMPORT_HERMESC_PATH\" \\ ${MARKER}`
);

src = src.replace(
  /^(build_apple_framework\(\) \{)/m,
  `$1\n  export CMAKE_GENERATOR=Ninja`
);

fs.writeFileSync(scriptPath, src, "utf8");
fs.chmodSync(scriptPath, 0o755);
console.log("[patch-hermes] Patched build-apple-framework.sh");
