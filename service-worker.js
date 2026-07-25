importScripts(
  "lib/settings.js",
  "lib/action-executor.js",
  "lib/action-feedback.js",
  "lib/auto-pip.js"
);

const { DEFAULT_SETTINGS, STORAGE_KEY, normaliseSettings } = PipEverywhereSettings;
const supportedProtocols = new Set(["file:", "http:", "https:"]);
const feedback = PipEverywhereActionFeedback.createActionFeedback({
  action: chrome.action
});
const autoPip = PipEverywhereAutoPip.createAutoPipRegistration({
  permissions: chrome.permissions,
  scripting: chrome.scripting,
  tabs: chrome.tabs
});
let currentSettings = DEFAULT_SETTINGS;

const settingsReady = hydrateSettings();
settingsReady.catch(console.error);

chrome.permissions.onRemoved.addListener((removed) => {
  const autoPipAccessRemoved = removed.origins?.some((origin) =>
    PipEverywhereAutoPip.AUTO_PIP_ORIGINS.includes(origin)
  );
  if (!autoPipAccessRemoved || !currentSettings.autoPictureInPicture) return;

  currentSettings = normaliseSettings({
    ...currentSettings,
    autoPictureInPicture: false
  });
  void chrome.storage.sync.set({ [STORAGE_KEY]: currentSettings });
  void autoPip.sync(currentSettings).catch(console.error);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes[STORAGE_KEY]) return;
  const previousSettings = currentSettings;
  currentSettings = normaliseSettings(changes[STORAGE_KEY].newValue);
  const operation = previousSettings.autoPictureInPicture === currentSettings.autoPictureInPicture
    ? autoPip.update(currentSettings)
    : autoPip.sync(currentSettings);
  void operation.catch(console.error);
});

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const settings = normaliseSettings(stored[STORAGE_KEY]);
  if (!stored[STORAGE_KEY]) await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
  await autoPip.sync(settings);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;

  const tabId = sender.tab?.id;
  if (message?.type === "GET_AUTO_PIP_SETTINGS" && tabId != null) {
    void settingsReady
      .then(() => sendResponse(currentSettings))
      .catch(() => sendResponse(DEFAULT_SETTINGS));
    return true;
  }

  if (message?.type === "CONFIGURE_AUTO_PIP" && typeof message.enabled === "boolean") {
    const settings = {
      ...currentSettings,
      autoPictureInPicture: message.enabled
    };
    void autoPip.sync(settings)
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => sendResponse({
        ok: false,
        message: error?.message || String(error)
      }));
    return true;
  }

  if (message?.type !== "PIP_STATUS_CHANGED" || typeof message.active !== "boolean" || tabId == null) {
    return;
  }

  const generation = feedback.begin(tabId);
  if (message.active) void feedback.showActive(tabId, generation);
  else void feedback.clear(tabId, generation);
});

chrome.action.onClicked.addListener((tab) => {
  const generation = feedback.begin(tab.id);
  if (tab.id == null || !isSupportedUrl(tab.url)) {
    void feedback.showError(tab.id, "Open a webpage with a video first.", generation);
    return;
  }

  const settings = currentSettings;
  const execution = chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: PipEverywhereActionExecutor.execute,
    args: [settings],
    injectImmediately: true
  });

  void feedback.clear(tab.id, generation);
  void handleExecution(tab.id, execution, settings, generation);
});

async function hydrateSettings() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  currentSettings = normaliseSettings(stored[STORAGE_KEY]);
  await autoPip.sync(currentSettings);
}

async function handleExecution(tabId, execution, settings, generation) {
  try {
    const results = await execution;
    if (!feedback.isCurrent(tabId, generation)) return;
    const outcomes = results.map((entry) => entry.result).filter(Boolean);

    if (outcomes.some((outcome) => outcome.status === "entered")) {
      await feedback.showActive(tabId, generation);
      return;
    }

    if (outcomes.some((outcome) => outcome.status === "exited")) {
      await feedback.clear(tabId, generation);
      return;
    }

    const failure = outcomes.find((outcome) => outcome.status === "error");
    if (failure) {
      await feedback.showError(tabId, readableError(failure), generation);
      return;
    }

    await feedback.showError(
      tabId,
      settings.playPausedVideos
        ? "No ready video was found on this page."
        : "Play a video first, then click PiP Everywhere.",
      generation
    );
  } catch (error) {
    await feedback.showError(tabId, readableError(error), generation);
  }
}

function isSupportedUrl(url) {
  if (!url) return false;
  try {
    return supportedProtocols.has(new URL(url).protocol);
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
