(function initialiseAutoPipAdapter(root) {
  "use strict";

  const stateKey = "__pipEverywhereAutoPip";
  const existing = root[stateKey];
  if (existing) {
    existing.configure({ enabled: true });
    return;
  }

  let enabled = true;
  let settings = {
    playPausedVideos: false,
    includeSiteBlockedVideos: true,
    autoPictureInPicture: true
  };

  const adapter = { configure };
  root[stateKey] = adapter;

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.id !== chrome.runtime.id || message?.type !== "AUTO_PIP_CONFIG_CHANGED") {
      return;
    }
    configure(message);
  });

  void loadSettings();

  try {
    navigator.mediaSession.setActionHandler("enterpictureinpicture", enterPictureInPicture);
  } catch {
    // Chrome versions without the media action keep manual Picture-in-Picture available.
  }

  function configure(config) {
    if (typeof config?.enabled === "boolean") enabled = config.enabled;
    if (config?.settings) {
      settings = {
        playPausedVideos: false,
        includeSiteBlockedVideos: config.settings.includeSiteBlockedVideos !== false,
        autoPictureInPicture: config.settings.autoPictureInPicture === true
      };
    }
  }

  async function loadSettings() {
    try {
      const stored = await chrome.runtime.sendMessage({
        type: "GET_AUTO_PIP_SETTINGS"
      });
      configure({ enabled: stored?.autoPictureInPicture === true, settings: stored });
    } catch {
      enabled = false;
    }
  }

  async function enterPictureInPicture() {
    if (!enabled || document.pictureInPictureElement) return;
    const outcome = await PipEverywhereActionExecutor.execute(settings);
    if (outcome.status !== "entered") return;
    try {
      await chrome.runtime.sendMessage({
        type: "PIP_STATUS_CHANGED",
        active: true
      });
    } catch {
      // The extension may have been reloaded while the page stayed open.
    }
  }
})(globalThis);
