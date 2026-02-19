/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  ".prisma",
  "client",
  "default.js",
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const src = fs.readFileSync(target, "utf8");
const updated = src.replace(
  "module.exports = { ...require('#main-entry-point') }",
  "module.exports = { ...require('./index.js') }",
);

if (updated !== src) {
  fs.writeFileSync(target, updated, "utf8");
}
