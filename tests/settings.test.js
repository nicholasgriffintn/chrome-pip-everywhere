const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_SETTINGS, normaliseSettings } = require("../lib/settings.js");

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
