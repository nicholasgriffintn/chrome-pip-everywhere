const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

const settingsSource = readFileSync(
  new URL("../lib/settings.js", `file://${__filename}`),
  "utf8"
);
const shortcutsSource = readFileSync(
  new URL("../lib/shortcuts.js", `file://${__filename}`),
  "utf8"
);
const optionsSource = readFileSync(
  new URL("../options.js", `file://${__filename}`),
  "utf8"
);

test("the options page displays the active shortcut for the current platform", async () => {
  const elements = new Map([
    ["#play-paused-videos", createElement()],
    ["#include-site-blocked-videos", createElement()],
    ["#active-shortcut", createElement()],
    ["#save-status", createElement()]
  ]);
  const context = vm.createContext({
    clearTimeout() {},
    console,
    document: {
      querySelector(selector) {
        return elements.get(selector);
      }
    },
    setTimeout() {
      return 1;
    },
    chrome: {
      commands: {
        async getAll() {
          return [{ name: "_execute_action", shortcut: "Command+Shift+P" }];
        }
      },
      runtime: {
        async getPlatformInfo() {
          return { os: "mac" };
        }
      },
      storage: {
        sync: {
          async get() {
            return {};
          },
          async set() {}
        }
      }
    }
  });

  vm.runInContext(settingsSource, context);
  vm.runInContext(shortcutsSource, context);
  vm.runInContext(optionsSource, context);
  await settle();

  assert.equal(elements.get("#active-shortcut").textContent, "⌘ ⇧ P");
  assert.equal(elements.get("#active-shortcut").classList.has("is-unset"), false);
});

function createElement() {
  const classes = new Set();
  return {
    checked: false,
    classList: {
      add(...names) {
        names.forEach((name) => classes.add(name));
      },
      has(name) {
        return classes.has(name);
      },
      remove(...names) {
        names.forEach((name) => classes.delete(name));
      },
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      }
    },
    addEventListener() {},
    textContent: ""
  };
}

async function settle() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}
