const express = require("express");
const path = require("node:path");

const router = express.Router();
const appRoot = process.env.LAMBDA_TASK_ROOT || path.resolve(__dirname, "../..");
const pagesDirectory = path.resolve(appRoot, "pages");

router.get("/", (_req, res) => {
  res.sendFile(path.join(pagesDirectory, "landing.html"));
});

router.get("/signin", (_req, res) => {
  res.sendFile(path.join(pagesDirectory, "signin.html"));
});

router.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(pagesDirectory, "dashboard.html"));
});

router.get("/settings", (_req, res) => {
  res.sendFile(path.join(pagesDirectory, "settings.html"));
});

router.get("/calendar", (_req, res) => {
  res.sendFile(path.join(pagesDirectory, "calendar.html"));
});

router.get("/finance", (_req, res) => {
  res.sendFile(path.join(pagesDirectory, "finance.html"));
});

router.get("/AI", (_req, res) => {
  res.sendFile(path.join(pagesDirectory, "AI.html"));
});
module.exports = router;
