const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const {
  AUTO_PIP_ORIGINS,
  CONTENT_SCRIPT_ID,
  createAutoPipRegistration
} = require("../lib/auto-pip.js");

test("registers automatic Picture-in-Picture only after optional access is granted", async () => {
  const registered = [];
  const injected = [];
  const messages = [];
  const registration = createAutoPipRegistration({
    permissions: {
      async contains() {
        return true;
      }
    },
    scripting: {
      async executeScript(details) {
        injected.push(details);
      },
      async getRegisteredContentScripts() {
        return [];
      },
      async registerContentScripts(details) {
        registered.push(...details);
      },
      async unregisterContentScripts() {},
      async updateContentScripts() {}
    },
    tabs: {
      async query() {
        return [{ id: 7 }];
      },
      async sendMessage(tabId, message) {
        messages.push({ tabId, message });
      }
    }
  });

  assert.deepEqual(await registration.sync({
    autoPictureInPicture: true,
    includeSiteBlockedVideos: false
  }), { active: true, permissionRequired: false });
  assert.equal(registered[0].id, CONTENT_SCRIPT_ID);
  assert.deepEqual(registered[0].matches, AUTO_PIP_ORIGINS);
  assert.deepEqual(registered[0].js, [
    "lib/action-executor.js",
    "content/auto-pip.js"
  ]);
  assert.equal(registered[0].runAt, "document_start");
  assert.equal(injected[0].target.tabId, 7);
  assert.equal(messages.at(-1).message.enabled, true);
  assert.equal(messages.at(-1).message.settings.includeSiteBlockedVideos, false);
});

test("does not register automatic Picture-in-Picture without optional access", async () => {
  let registrationCount = 0;
  const registration = createAutoPipRegistration({
    permissions: {
      async contains() {
        return false;
      }
    },
    scripting: {
      async getRegisteredContentScripts() {
        return [];
      },
      async registerContentScripts() {
        registrationCount += 1;
      },
      async unregisterContentScripts() {}
    },
    tabs: {
      async query() {
        return [];
      }
    }
  });

  assert.deepEqual(await registration.sync({ autoPictureInPicture: true }), {
    active: false,
    permissionRequired: true
  });
  assert.equal(registrationCount, 0);
});

test("unregisters and disables existing page adapters", async () => {
  const messages = [];
  const unregistered = [];
  const registration = createAutoPipRegistration({
    permissions: {
      async contains() {
        return true;
      }
    },
    scripting: {
      async getRegisteredContentScripts() {
        return [{ id: CONTENT_SCRIPT_ID }];
      },
      async unregisterContentScripts(details) {
        unregistered.push(details);
      }
    },
    tabs: {
      async query() {
        return [{ id: 12 }];
      },
      async sendMessage(tabId, message) {
        messages.push({ tabId, message });
      }
    }
  });

  assert.deepEqual(await registration.sync({ autoPictureInPicture: false }), {
    active: false,
    permissionRequired: false
  });
  assert.equal(unregistered[0].ids[0], CONTENT_SCRIPT_ID);
  assert.equal(messages.at(-1).message.enabled, false);
});

test("the page adapter enters Picture-in-Picture only while enabled", async () => {
  const source = readFileSync(
    new URL("../content/auto-pip.js", `file://${__filename}`),
    "utf8"
  );
  const messages = [];
  let actionHandler;
  let registeredActionHandler;
  let configListener;
  let executionCount = 0;
  const context = vm.createContext({
    document: {
      pictureInPictureElement: null
    },
    navigator: {
      mediaSession: {
        setActionHandler(action, handler) {
          if (action === "enterpictureinpicture") {
            actionHandler = handler;
            registeredActionHandler ||= handler;
          }
        }
      }
    },
    PipEverywhereActionExecutor: {
      async execute() {
        executionCount += 1;
        return { status: "entered" };
      }
    },
    chrome: {
      runtime: {
        id: "test-extension",
        onMessage: {
          addListener(listener) {
            configListener = listener;
          }
        },
        async sendMessage(message) {
          messages.push(message);
          if (message.type === "GET_AUTO_PIP_SETTINGS") {
            return {
              autoPictureInPicture: true,
              includeSiteBlockedVideos: true
            };
          }
          return undefined;
        }
      }
    }
  });

  vm.runInContext(source, context);
  await settle();
  assert.equal(typeof actionHandler, "function");

  await actionHandler({ enterPictureInPictureReason: "contentoccluded" });
  assert.equal(executionCount, 1);
  assert.equal(messages.at(-1).type, "PIP_STATUS_CHANGED");
  assert.equal(messages.at(-1).active, true);

  configListener(
    { type: "AUTO_PIP_CONFIG_CHANGED", enabled: false },
    { id: "test-extension" }
  );
  assert.equal(actionHandler, null);
  await registeredActionHandler({ enterPictureInPictureReason: "contentoccluded" });
  assert.equal(executionCount, 1);
});

async function settle() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}
