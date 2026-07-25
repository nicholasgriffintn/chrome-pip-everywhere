(function initialiseOptions() {
  "use strict";

  const { STORAGE_KEY, normaliseSettings } = PipEverywhereSettings;
  const playPausedVideos = document.querySelector("#play-paused-videos");
  const includeSiteBlockedVideos = document.querySelector("#include-site-blocked-videos");
  const saveStatus = document.querySelector("#save-status");
  let statusTimer;

  start().catch(showError);

  async function start() {
    const stored = await chrome.storage.sync.get(STORAGE_KEY);
    const settings = normaliseSettings(stored[STORAGE_KEY]);
    playPausedVideos.checked = settings.playPausedVideos;
    includeSiteBlockedVideos.checked = settings.includeSiteBlockedVideos;
    playPausedVideos.addEventListener("change", save);
    includeSiteBlockedVideos.addEventListener("change", save);
  }

  async function save() {
    const settings = normaliseSettings({
      playPausedVideos: playPausedVideos.checked,
      includeSiteBlockedVideos: includeSiteBlockedVideos.checked
    });
    await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
    showStatus("Saved");
  }

  function showStatus(message) {
    clearTimeout(statusTimer);
    saveStatus.textContent = message;
    saveStatus.classList.add("is-visible");
    statusTimer = setTimeout(() => saveStatus.classList.remove("is-visible"), 1400);
  }

  function showError(error) {
    console.error(error);
    showStatus("Could not save");
  }
})();

