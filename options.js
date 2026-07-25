(function initialiseOptions() {
  "use strict";

  const { STORAGE_KEY, normaliseSettings } = PipEverywhereSettings;
  const { formatShortcut } = PipEverywhereShortcuts;
  const { AUTO_PIP_ORIGINS } = PipEverywhereAutoPip;
  const playPausedVideos = document.querySelector("#play-paused-videos");
  const includeSiteBlockedVideos = document.querySelector("#include-site-blocked-videos");
  const autoPictureInPicture = document.querySelector("#auto-picture-in-picture");
  const activeShortcut = document.querySelector("#active-shortcut");
  const saveStatus = document.querySelector("#save-status");
  let statusTimer;

  start().catch((error) => showError(error, "Could not load"));
  loadShortcut().catch(showShortcutError);

  async function start() {
    const [stored, hasAutoPipAccess] = await Promise.all([
      chrome.storage.sync.get(STORAGE_KEY),
      chrome.permissions.contains({ origins: AUTO_PIP_ORIGINS })
    ]);
    const settings = normaliseSettings(stored[STORAGE_KEY]);
    playPausedVideos.checked = settings.playPausedVideos;
    includeSiteBlockedVideos.checked = settings.includeSiteBlockedVideos;
    autoPictureInPicture.checked = settings.autoPictureInPicture && hasAutoPipAccess;
    playPausedVideos.addEventListener("change", handleSave);
    includeSiteBlockedVideos.addEventListener("change", handleSave);
    autoPictureInPicture.addEventListener("change", handleAutoPipChange);
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
    await persistSettings();
    showStatus("Saved");
  }

  async function handleAutoPipChange() {
    const enabling = autoPictureInPicture.checked;
    autoPictureInPicture.disabled = true;
    try {
      if (enabling) {
        const granted = await chrome.permissions.request({ origins: AUTO_PIP_ORIGINS });
        if (!granted) {
          autoPictureInPicture.checked = false;
          showStatus("Access not granted");
          return;
        }
      }

      await persistSettings();
      const configured = await chrome.runtime.sendMessage({
        type: "CONFIGURE_AUTO_PIP",
        enabled: enabling
      });
      if (!configured?.ok) throw new Error(configured?.message || "Auto PiP setup failed");
      if (!enabling) {
        await chrome.permissions.remove({ origins: AUTO_PIP_ORIGINS });
      }
      showStatus("Saved");
    } catch (error) {
      autoPictureInPicture.checked = !enabling;
      await persistSettings().catch(console.error);
      if (enabling) {
        await chrome.permissions.remove({ origins: AUTO_PIP_ORIGINS }).catch(console.error);
      }
      showError(error);
    } finally {
      autoPictureInPicture.disabled = false;
    }
  }

  async function persistSettings() {
    const settings = normaliseSettings({
      playPausedVideos: playPausedVideos.checked,
      includeSiteBlockedVideos: includeSiteBlockedVideos.checked,
      autoPictureInPicture: autoPictureInPicture.checked
    });
    await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
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
