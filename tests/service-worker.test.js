const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

const feedbackSource = readFileSync(
  new URL("../lib/action-feedback.js", `file://${__filename}`),
  "utf8"
);

test("the toolbar gesture reaches page execution before asynchronous storage", () => {
  const source = readFileSync(new URL("../service-worker.js", `file://${__filename}`), "utf8");
  let actionListener;
  const scriptCalls = [];
  const neverResolves = new Promise(() => {});
  const context = {
    URL,
    clearTimeout() {},
    setTimeout() {
      return 1;
    },
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
        id: "test-extension",
        onInstalled: { addListener() {} },
        onMessage: { addListener() {} }
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

  evaluateWorker(source, context);
  actionListener({ id: 42, url: "https://example.com/watch" });
  actionListener({ id: 43, url: "chrome-search://local-ntp/local-ntp.html" });

  assert.equal(scriptCalls.length, 1);
});

test("stale error timers cannot clear later Picture-in-Picture feedback", async () => {
  const worker = createWorkerHarness([
    [{ result: { status: "error", message: "First attempt failed" } }],
    [{ result: { status: "entered" } }]
  ]);

  worker.actionListener({ id: 42, url: "https://example.com/watch" });
  await settle();
  assert.equal(worker.timers.length, 1);

  worker.actionListener({ id: 42, url: "https://example.com/watch" });
  await settle();
  if (!worker.timers[0].cancelled) worker.timers[0].callback();
  await settle();

  assert.equal(worker.badgeTexts.at(-1), "PIP");
});

test("native Picture-in-Picture closure clears toolbar feedback", async () => {
  const worker = createWorkerHarness([
    [{ result: { status: "entered" } }]
  ]);

  worker.actionListener({ id: 7, url: "https://example.com/watch" });
  await settle();
  assert.equal(worker.badgeTexts.at(-1), "PIP");
  assert.equal(typeof worker.messageListener, "function");

  worker.messageListener(
    { type: "PIP_STATUS_CHANGED", active: false },
    { id: "another-extension", tab: { id: 7 } }
  );
  await settle();
  assert.equal(worker.badgeTexts.at(-1), "PIP");

  worker.messageListener(
    { type: "PIP_STATUS_CHANGED", active: false },
    { id: "test-extension", tab: { id: 7 } }
  );
  await settle();

  assert.equal(worker.badgeTexts.at(-1), "");
});

test("installation keeps synced settings limited to extension contexts", async () => {
  const worker = createWorkerHarness([]);

  await worker.installedListener();

  assert.equal(worker.storageAccessLevels.at(-1)?.accessLevel, "TRUSTED_CONTEXTS");
});

function createWorkerHarness(executionResults) {
  const source = readFileSync(new URL("../service-worker.js", `file://${__filename}`), "utf8");
  const badgeTexts = [];
  const storageAccessLevels = [];
  const timers = [];
  let actionListener;
  let installedListener;
  let messageListener;
  let executionIndex = 0;
  const context = {
    URL,
    clearTimeout(id) {
      const timer = timers.find((entry) => entry.id === id);
      if (timer) timer.cancelled = true;
    },
    setTimeout(callback) {
      const timer = { id: timers.length + 1, callback, cancelled: false };
      timers.push(timer);
      return timer.id;
    },
    console,
    PipEverywhereSettings: {
      DEFAULT_SETTINGS: {
        playPausedVideos: false,
        includeSiteBlockedVideos: true
      },
      STORAGE_KEY: "settings",
      normaliseSettings: (value) => value || {
        playPausedVideos: false,
        includeSiteBlockedVideos: true
      }
    },
    PipEverywhereActionExecutor: {
      execute: function execute() {}
    },
    importScripts() {},
    chrome: {
      runtime: {
        id: "test-extension",
        onInstalled: {
          addListener(listener) {
            installedListener = listener;
          }
        },
        onMessage: {
          addListener(listener) {
            messageListener = listener;
          }
        }
      },
      storage: {
        sync: {
          async get() {
            return {};
          },
          async set() {},
          async setAccessLevel(details) {
            storageAccessLevels.push(details);
          }
        },
        onChanged: { addListener() {} }
      },
      action: {
        onClicked: {
          addListener(listener) {
            actionListener = listener;
          }
        },
        async setBadgeText({ text }) {
          badgeTexts.push(text);
        },
        async setBadgeBackgroundColor() {},
        async setTitle() {}
      },
      scripting: {
        executeScript() {
          return Promise.resolve(executionResults[executionIndex++]);
        }
      }
    }
  };

  evaluateWorker(source, context);

  return {
    get actionListener() {
      return actionListener;
    },
    badgeTexts,
    get installedListener() {
      return installedListener;
    },
    get messageListener() {
      return messageListener;
    },
    storageAccessLevels,
    timers
  };
}

function evaluateWorker(source, context) {
  const vmContext = vm.createContext(context);
  vm.runInContext(feedbackSource, vmContext);
  vm.runInContext(source, vmContext);
}

async function settle() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}
