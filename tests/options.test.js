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
const autoPipSource = readFileSync(
  new URL("../lib/auto-pip.js", `file://${__filename}`),
  "utf8"
);
const optionsSource = readFileSync(
  new URL("../options.js", `file://${__filename}`),
  "utf8"
);

test("the options page displays the active shortcut for the current platform", async () => {
  const permissionRequests = [];
  const permissionRemovals = [];
  const runtimeMessages = [];
  const storageWrites = [];
  const elements = new Map([
    ["#play-paused-videos", createElement()],
    ["#include-site-blocked-videos", createElement()],
    ["#auto-picture-in-picture", createElement()],
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
      permissions: {
        async contains() {
          return true;
        },
        async remove() {
          permissionRemovals.push(true);
          return true;
        },
        async request(details) {
          permissionRequests.push(details);
          return true;
        }
      },
      runtime: {
        async getPlatformInfo() {
          return { os: "mac" };
        },
        async sendMessage(message) {
          runtimeMessages.push(message);
          return { ok: true };
        }
      },
      storage: {
        sync: {
          async get() {
            return {};
          },
          async set(value) {
            storageWrites.push(value);
          }
        }
      }
    }
  });

  vm.runInContext(settingsSource, context);
  vm.runInContext(shortcutsSource, context);
  vm.runInContext(autoPipSource, context);
  vm.runInContext(optionsSource, context);
  await settle();

  assert.equal(elements.get("#active-shortcut").textContent, "⌘ ⇧ P");
  assert.equal(elements.get("#active-shortcut").classList.has("is-unset"), false);

  elements.get("#auto-picture-in-picture").checked = true;
  await elements.get("#auto-picture-in-picture").dispatch("change");

  assert.equal(permissionRequests.length, 1);
  assert.equal(storageWrites.at(-1).pipEverywhereSettings.autoPictureInPicture, true);
  assert.equal(runtimeMessages.at(-1).type, "CONFIGURE_AUTO_PIP");
  assert.equal(runtimeMessages.at(-1).enabled, true);

  elements.get("#auto-picture-in-picture").checked = false;
  await elements.get("#auto-picture-in-picture").dispatch("change");

  assert.equal(permissionRemovals.length, 1);
  assert.equal(storageWrites.at(-1).pipEverywhereSettings.autoPictureInPicture, false);
  assert.equal(runtimeMessages.at(-1).enabled, false);
});

function createElement() {
  const classes = new Set();
  const listeners = new Map();
  return {
    checked: false,
    disabled: false,
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
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type) {
      return listeners.get(type)?.();
    },
    textContent: ""
  };
}

async function settle() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}
