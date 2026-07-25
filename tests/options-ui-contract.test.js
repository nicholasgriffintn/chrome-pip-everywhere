const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");

const css = readFileSync(new URL("../options.css", `file://${__filename}`), "utf8");
const html = readFileSync(new URL("../options.html", `file://${__filename}`), "utf8");

test("the options background fills the viewport without tiling", () => {
  assert.match(css, /html\s*\{[^}]*min-height:\s*100%/s);
  assert.match(css, /body\s*\{[^}]*min-height:\s*100vh/s);
  assert.match(css, /body\s*\{[^}]*background-repeat:\s*no-repeat/s);
  assert.match(css, /body\s*\{[^}]*background-attachment:\s*fixed/s);
  assert.match(css, /body\s*\{[^}]*background-size:\s*cover/s);
});

test("the shortcut display can reflect the active Chrome command", () => {
  assert.match(html, /<kbd id="active-shortcut">/);
});
