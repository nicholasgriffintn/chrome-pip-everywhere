const test = require("node:test");
const assert = require("node:assert/strict");
const { formatShortcut } = require("../lib/shortcuts.js");

test("formats shortcuts for the current platform", () => {
  assert.equal(formatShortcut("Alt+P", "mac"), "⌥ P");
  assert.equal(formatShortcut("Alt+Shift+P", "win"), "Alt + Shift + P");
});

test("makes an unbound command explicit", () => {
  assert.equal(formatShortcut("", "linux"), "Not set");
});
