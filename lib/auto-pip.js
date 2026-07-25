(function initialiseAutoPip(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PipEverywhereAutoPip = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createAutoPipApi() {
  "use strict";

  const AUTO_PIP_ORIGINS = Object.freeze(["http://*/*", "https://*/*"]);
  const CONTENT_SCRIPT_ID = "pip-everywhere-auto-pip";
  const CONTENT_SCRIPT_FILES = Object.freeze([
    "lib/action-executor.js",
    "content/auto-pip.js"
  ]);

  function createAutoPipRegistration({ permissions, scripting, tabs }) {
    let pending = Promise.resolve();

    function sync(settings) {
      return enqueue(() => apply(settings));
    }

    function update(settings) {
      return enqueue(() => notifyTabs(settings.autoPictureInPicture === true, settings));
    }

    function enqueue(operation) {
      const result = pending.then(operation);
      pending = result.catch(() => {});
      return result;
    }

    async function apply(settings) {
      const enabled = settings.autoPictureInPicture === true;
      const existing = await scripting.getRegisteredContentScripts({
        ids: [CONTENT_SCRIPT_ID]
      });

      if (!enabled) {
        if (existing.length > 0) {
          await scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
        }
        await notifyTabs(false, settings);
        return { active: false, permissionRequired: false };
      }

      const hasAccess = await permissions.contains({ origins: AUTO_PIP_ORIGINS });
      if (!hasAccess) {
        if (existing.length > 0) {
          await scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
        }
        await notifyTabs(false, settings);
        return { active: false, permissionRequired: true };
      }

      const registration = {
        id: CONTENT_SCRIPT_ID,
        matches: AUTO_PIP_ORIGINS,
        js: CONTENT_SCRIPT_FILES,
        allFrames: false,
        persistAcrossSessions: true,
        runAt: "document_start",
        world: "ISOLATED"
      };
      if (existing.length > 0) {
        await scripting.updateContentScripts([registration]);
      } else {
        await scripting.registerContentScripts([registration]);
      }

      await injectExistingTabs();
      await notifyTabs(true, settings);
      return { active: true, permissionRequired: false };
    }

    async function injectExistingTabs() {
      const openTabs = await tabs.query({ url: AUTO_PIP_ORIGINS });
      await Promise.all(openTabs.map(async (tab) => {
        if (tab.id == null) return;
        try {
          await scripting.executeScript({
            target: { tabId: tab.id },
            files: CONTENT_SCRIPT_FILES,
            injectImmediately: true
          });
        } catch {
          // A tab can navigate or close between the query and injection.
        }
      }));
    }

    async function notifyTabs(enabled, settings) {
      const openTabs = await tabs.query({});
      await Promise.all(openTabs.map(async (tab) => {
        if (tab.id == null) return;
        try {
          await tabs.sendMessage(tab.id, {
            type: "AUTO_PIP_CONFIG_CHANGED",
            enabled,
            settings
          });
        } catch {
          // Tabs without the adapter have nothing to update.
        }
      }));
    }

    return { sync, update };
  }

  return {
    AUTO_PIP_ORIGINS,
    CONTENT_SCRIPT_ID,
    createAutoPipRegistration
  };
});
