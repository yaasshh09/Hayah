const express = require("express");
const path = require("node:path");
const pagesRouter = require("./routes/pages");
const aiRouter = require("./routes/ai");
const authRouter = require("./routes/auth");

const app = express();
const appRoot = process.env.LAMBDA_TASK_ROOT || path.resolve(__dirname, "..");

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
