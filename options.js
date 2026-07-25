(function initialiseOptions() {
  "use strict";

  const { STORAGE_KEY, normaliseSettings } = PipEverywhereSettings;
  const { formatShortcut } = PipEverywhereShortcuts;
  const playPausedVideos = document.querySelector("#play-paused-videos");
  const includeSiteBlockedVideos = document.querySelector("#include-site-blocked-videos");
  const activeShortcut = document.querySelector("#active-shortcut");
  const saveStatus = document.querySelector("#save-status");
  let statusTimer;

  start().catch((error) => showError(error, "Could not load"));
  loadShortcut().catch(showShortcutError);

  async function start() {
    const stored = await chrome.storage.sync.get(STORAGE_KEY);
    const settings = normaliseSettings(stored[STORAGE_KEY]);
    playPausedVideos.checked = settings.playPausedVideos;
    includeSiteBlockedVideos.checked = settings.includeSiteBlockedVideos;
    playPausedVideos.addEventListener("change", handleSave);
    includeSiteBlockedVideos.addEventListener("change", handleSave);
  }

  async function loadShortcut() {
    const [commands, platform] = await Promise.all([
      chrome.commands.getAll(),
      chrome.runtime.getPlatformInfo()
    ]);
    const command = commands.find((entry) => entry.name === "_execute_action");
    activeShortcut.textContent = formatShortcut(command?.shortcut, platform.os);
    activeShortcut.classList.toggle("is-unset", !command?.shortcut);
  }

  function handleSave() {
    save().catch(showError);
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

  function showShortcutError(error) {
    console.error(error);
    activeShortcut.textContent = "Unavailable";
    activeShortcut.classList.add("is-unset");
  }

  function showError(error, message = "Could not save") {
    console.error(error);
    showStatus(message);
  }
})();
