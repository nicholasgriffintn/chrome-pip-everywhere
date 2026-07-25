(function initialiseShortcuts(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PipEverywhereShortcuts = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createShortcutsApi() {
  "use strict";

  const MAC_KEYS = new Map([
    ["Alt", "⌥"],
    ["Command", "⌘"],
    ["Ctrl", "⌃"],
    ["MacCtrl", "⌃"],
    ["Shift", "⇧"]
  ]);

  function formatShortcut(shortcut, platform) {
    if (!shortcut) return "Not set";
    const keys = shortcut.split("+");
    if (platform === "mac") {
      return keys.map((key) => MAC_KEYS.get(key) ?? key).join(" ");
    }
    return keys.join(" + ");
  }

  return { formatShortcut };
});
