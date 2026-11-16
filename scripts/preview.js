// Dependency-free local preview. This server listens only on this computer.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const root = path.resolve(__dirname, "..");
const port = 4173;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
};

function sendStatus(response, code, message, headers) {
  response.writeHead(code, headers || {});
  response.end(message);
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendStatus(response, 405, "Method not allowed", { Allow: "GET, HEAD" });
    return;
  }
  let relativePath;
  try {
    const pathname = decodeURIComponent(url.parse(request.url).pathname);
    relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  } catch (error) {
    sendStatus(response, 400, "Invalid request");
    return;
  }
  // Preview only the page and public assets; never serve repository metadata.
  if (relativePath.split(/[\\/]/).some((segment) => segment.startsWith(".")) ||
      (relativePath !== "index.html" && !relativePath.startsWith("assets/"))) {
    sendStatus(response, 404, "Not found");
    return;
  }
  const file = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, file);
  const mime = mimeTypes[path.extname(file).toLowerCase()];
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot) || !mime) {
    sendStatus(response, 404, "Not found");
    return;
  }
  fs.stat(file, (statError, info) => {
    if (statError || !info.isFile()) {
      sendStatus(response, 404, "Not found");
      return;
    }
    fs.readFile(file, (readError, body) => {
      if (readError) {
        sendStatus(response, 404, "Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      response.end(request.method === "HEAD" ? undefined : body);
    });
  });
});

server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE" ? `Port ${port} is in use. Stop the other preview and try again.` : error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => console.log(`Local preview: http://127.0.0.1:${port}\nPress Ctrl+C to stop.`));
