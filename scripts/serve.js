const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 18929;
const STATIC_DIR = path.join(__dirname, "..", "static-build");

const MIME = {
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".html": "text/html",
  ".css": "text/css",
};

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath)) return false;
  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": mime });
  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error(`Stream error serving ${filePath}: ${err.message}`);
    if (!res.writableEnded) res.destroy();
  });
  stream.pipe(res);
  return true;
}

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url, `http://localhost:${PORT}`);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  const pathname = url.pathname;

  if (pathname === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  const platform = req.headers["expo-platform"] || url.searchParams.get("platform");

  if (pathname === "/manifest" || pathname === "/manifest/") {
    const manifestPath = path.join(STATIC_DIR, platform || "ios", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        res.writeHead(200, {
          "Content-Type": "application/json",
          "expo-protocol-version": "0",
          "expo-sfv-version": "0",
          "cache-control": "private, max-age=0",
        });
        res.end(JSON.stringify(manifest));
      } catch (err) {
        console.error(`Manifest read error: ${err.message}`);
        res.writeHead(500);
        res.end("Error reading manifest");
      }
    } else {
      res.writeHead(404);
      res.end("Manifest not found — run the build first");
    }
    return;
  }

  const candidate = path.join(STATIC_DIR, pathname);
  if (!candidate.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!serveFile(res, candidate)) {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.on("error", (err) => {
  console.error(`Server error: ${err.message}`);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Expo OTA server running on port ${PORT}`);
});
