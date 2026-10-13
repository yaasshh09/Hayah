const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const publicDirectory = path.join(projectRoot, "public");
const publicAssetsDirectory = path.join(publicDirectory, "assets");

fs.rmSync(publicDirectory, { recursive: true, force: true });
fs.mkdirSync(publicAssetsDirectory, { recursive: true });
fs.cpSync(path.join(projectRoot, "assets"), publicAssetsDirectory, {
  recursive: true,
});
// Service worker is served from the site root so it controls every page.
fs.copyFileSync(
  path.join(projectRoot, "assets", "sw.js"),
  path.join(publicDirectory, "sw.js"),
);
