importScripts("lib/settings.js", "lib/action-executor.js");

const { DEFAULT_SETTINGS, STORAGE_KEY, normaliseSettings } = PipEverywhereSettings;
const BADGE_RESET_DELAY = 3000;
const blockedProtocols = new Set(["chrome:", "chrome-extension:", "edge:", "about:", "view-source:"]);
let currentSettings = DEFAULT_SETTINGS;

hydrateSettings().catch(console.error);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes[STORAGE_KEY]) return;
  currentSettings = normaliseSettings(changes[STORAGE_KEY].newValue);
});

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  if (!stored[STORAGE_KEY]) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_SETTINGS });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id || !isSupportedUrl(tab.url)) {
    void showError(tab.id, "Open a webpage with a video first.");
    return;
  }

  const execution = chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: PipEverywhereActionExecutor.execute,
    args: [currentSettings],
    injectImmediately: true
  });

  clearFeedback(tab.id);
  void handleExecution(tab.id, execution);
});

async function hydrateSettings() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  currentSettings = normaliseSettings(stored[STORAGE_KEY]);
}

async function handleExecution(tabId, execution) {
  try {
    const results = await execution;
    const outcomes = results.map((entry) => entry.result).filter(Boolean);

    if (outcomes.some((outcome) => outcome.status === "entered")) {
      await chrome.action.setTitle({
        tabId,
        title: "Video is playing in Picture-in-Picture"
      });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: "#e4472f" });
      await chrome.action.setBadgeText({ tabId, text: "PIP" });
      return;
    }

    if (outcomes.some((outcome) => outcome.status === "exited")) {
      clearFeedback(tabId);
      return;
    }

    const failure = outcomes.find((outcome) => outcome.status === "error");
    if (failure) {
      await showError(tabId, readableError(failure));
      return;
    }

    await showError(
      tabId,
      currentSettings.playPausedVideos
        ? "No ready video was found on this page."
        : "Play a video first, then click PiP Everywhere."
    );
  } catch (error) {
    await showError(tabId, readableError(error));
  }
}

function isSupportedUrl(url) {
  if (!url) return false;
  try {
    return !blockedProtocols.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

function readableError(error) {
  const message = error?.message || String(error);
  if (message.includes("Cannot access") || message.includes("The extensions gallery")) {
    return "Chrome does not allow extensions to run on this page.";
  }
  if (message.includes("No tab with id")) return "The tab closed before the video could open.";
  if (error?.name === "NotAllowedError" || message.includes("NotAllowedError")) {
    return "Chrome did not accept the Picture-in-Picture request. Try again.";
  }
  return message || "Picture-in-Picture could not be opened.";
}

function clearFeedback(tabId) {
  chrome.action.setBadgeText({ tabId, text: "" });
  chrome.action.setTitle({ tabId, title: "Pop out this video" });
}

async function showError(tabId, message) {
  if (!tabId) return;
  await chrome.action.setBadgeBackgroundColor({ tabId, color: "#6f737d" });
  await chrome.action.setBadgeText({ tabId, text: "!" });
  await chrome.action.setTitle({ tabId, title: message });
  setTimeout(() => clearFeedback(tabId), BADGE_RESET_DELAY);
}

