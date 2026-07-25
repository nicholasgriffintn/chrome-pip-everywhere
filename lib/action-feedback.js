(function initialiseActionFeedback(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PipEverywhereActionFeedback = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createActionFeedbackApi() {
  "use strict";

  function createActionFeedback({
    action,
    resetDelay = 3000,
    onError = console.error
  }) {
    const generations = new Map();
    const timers = new Map();

    function begin(tabId) {
      if (tabId == null) return 0;
      cancelTimer(tabId);
      const generation = (generations.get(tabId) ?? 0) + 1;
      generations.set(tabId, generation);
      return generation;
    }

    function isCurrent(tabId, generation) {
      return generations.get(tabId) === generation;
    }

    async function clear(tabId, generation) {
      if (tabId == null || !isCurrent(tabId, generation)) return;
      cancelTimer(tabId);
      await update([
        action.setBadgeText({ tabId, text: "" }),
        action.setTitle({ tabId, title: "Pop out this video" })
      ]);
    }

    async function showActive(tabId, generation) {
      if (!isCurrent(tabId, generation)) return;
      cancelTimer(tabId);
      await update([
        action.setTitle({
          tabId,
          title: "Video is playing in Picture-in-Picture"
        }),
        action.setBadgeBackgroundColor({ tabId, color: "#e4472f" }),
        action.setBadgeText({ tabId, text: "PIP" })
      ]);
    }

    async function showError(tabId, message, generation) {
      if (tabId == null || !isCurrent(tabId, generation)) return;
      await update([
        action.setBadgeBackgroundColor({ tabId, color: "#6f737d" }),
        action.setBadgeText({ tabId, text: "!" }),
        action.setTitle({ tabId, title: message })
      ]);
      if (!isCurrent(tabId, generation)) return;

      const timer = setTimeout(() => {
        timers.delete(tabId);
        void clear(tabId, generation);
      }, resetDelay);
      timers.set(tabId, timer);
    }

    function cancelTimer(tabId) {
      const timer = timers.get(tabId);
      if (timer === undefined) return;
      clearTimeout(timer);
      timers.delete(tabId);
    }

    async function update(updates) {
      try {
        await Promise.all(updates);
      } catch (error) {
        if (!String(error?.message ?? error).includes("No tab with id")) onError(error);
      }
    }

    return {
      begin,
      clear,
      isCurrent,
      showActive,
      showError
    };
  }

  return { createActionFeedback };
});
