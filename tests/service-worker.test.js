const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

test("the toolbar gesture reaches page execution before asynchronous storage", () => {
  const source = readFileSync(new URL("../service-worker.js", `file://${__filename}`), "utf8");
  let actionListener;
  const scriptCalls = [];
  const neverResolves = new Promise(() => {});
  const context = {
    URL,
    setTimeout,
    console,
    PipEverywhereSettings: {
      DEFAULT_SETTINGS: {
        playPausedVideos: false,
        includeSiteBlockedVideos: true
      },
      STORAGE_KEY: "settings",
      normaliseSettings: (value) => value
    },
    PipEverywhereActionExecutor: {
      execute: function execute() {}
    },
    importScripts() {},
    chrome: {
      runtime: {
        onInstalled: { addListener() {} }
      },
      storage: {
        sync: {
          get: () => neverResolves,
          set: async () => {}
        },
        onChanged: { addListener() {} }
      },
      action: {
        onClicked: {
          addListener(listener) {
            actionListener = listener;
          }
        },
        setBadgeText: async () => {},
        setBadgeBackgroundColor: async () => {},
        setTitle: async () => {}
      },
      scripting: {
        executeScript(details) {
          scriptCalls.push(details);
          return neverResolves;
        }
      }
    }
  };

  vm.runInNewContext(source, context);
  actionListener({ id: 42, url: "https://example.com/watch" });

  assert.equal(scriptCalls.length, 1);
});
