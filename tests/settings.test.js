const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_SETTINGS, normaliseSettings } = require("../lib/settings.js");

test("defaults keep paused videos excluded and site hints overridden", () => {
  assert.deepEqual(normaliseSettings(), DEFAULT_SETTINGS);
});

test("normalises stored values without accepting truthy non-booleans", () => {
  assert.deepEqual(normaliseSettings({
    playPausedVideos: "yes",
    includeSiteBlockedVideos: false
  }), {
    playPausedVideos: false,
    includeSiteBlockedVideos: false
  });
});

