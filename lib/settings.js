(function initialiseSettings(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PipEverywhereSettings = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSettingsApi() {
  "use strict";

  const STORAGE_KEY = "pipEverywhereSettings";
  const DEFAULT_SETTINGS = Object.freeze({
    playPausedVideos: false,
    includeSiteBlockedVideos: true,
    autoPictureInPicture: false
  });

  function normaliseSettings(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      playPausedVideos: source.playPausedVideos === true,
      includeSiteBlockedVideos: source.includeSiteBlockedVideos !== false,
      autoPictureInPicture: source.autoPictureInPicture === true
    };
  }

  return {
    DEFAULT_SETTINGS,
    STORAGE_KEY,
    normaliseSettings
  };
});
