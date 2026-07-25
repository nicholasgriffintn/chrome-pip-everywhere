const test = require("node:test");
const assert = require("node:assert/strict");
const {
  DEFAULT_SETTINGS,
  isAutoPictureInPictureSupported,
  normaliseSettings
} = require("../lib/settings.js");

test("defaults keep paused and automatic Picture-in-Picture disabled", () => {
  assert.deepEqual(normaliseSettings(), DEFAULT_SETTINGS);
});

test("normalises stored values without accepting truthy non-booleans", () => {
  assert.deepEqual(normaliseSettings({
    playPausedVideos: "yes",
    includeSiteBlockedVideos: false,
    autoPictureInPicture: "yes"
  }), {
    playPausedVideos: false,
    includeSiteBlockedVideos: false,
    autoPictureInPicture: false
  });
});

test("automatic media playback PiP is only offered from Chrome 134", () => {
  assert.equal(isAutoPictureInPictureSupported("Mozilla/5.0 Chrome/133.0.0.0 Safari/537.36"), false);
  assert.equal(isAutoPictureInPictureSupported("Mozilla/5.0 Chrome/134.0.0.0 Safari/537.36"), true);
  assert.equal(isAutoPictureInPictureSupported("Mozilla/5.0 Firefox/140.0"), false);
});
