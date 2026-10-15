const express = require("express");
const path = require("node:path");
const pagesRouter = require("./routes/pages");
const aiRouter = require("./routes/ai");
const authRouter = require("./routes/auth");

const app = express();
const appRoot = process.env.LAMBDA_TASK_ROOT || path.resolve(__dirname, "..");

// Security headers. Pages use inline scripts and styles, so those stay allowed;
// everything else (scripts from other sites, framing, sending data out) is locked to this origin.
// Same list lives in netlify.toml for the static files Netlify serves directly.
const fonts = "https://fonts.googleapis.com https://fonts.gstatic.com";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  `connect-src 'self' ${fonts}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.set({
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  });
  next();
});

app.use(express.json({ limit: "64kb" }));
app.use("/assets", express.static(path.resolve(appRoot, "assets")));
// The service worker must live at the root so it can serve every page offline.
app.get("/sw.js", (_req, res) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.resolve(appRoot, "assets/sw.js"));
});
app.use("/", pagesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ prototype: true, message: "API route not found." });
});

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Page not found.");
});

module.exports = app;
