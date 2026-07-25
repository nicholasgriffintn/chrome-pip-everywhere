const test = require("node:test");
const assert = require("node:assert/strict");
const { execute } = require("../lib/action-executor.js");

function createVideo(overrides = {}) {
  return {
    readyState: 4,
    videoWidth: 1280,
    videoHeight: 720,
    paused: false,
    ended: false,
    disablePictureInPicture: false,
    muted: false,
    volume: 1,
    isConnected: true,
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      right: 800,
      bottom: 450
    }),
    requestPictureInPicture: async () => {},
    play: async () => {},
    ...overrides
  };
}

function installPage(videos, overrides = {}) {
  const elements = [];
  global.innerWidth = 1024;
  global.innerHeight = 768;
  global.getComputedStyle = () => ({
    display: "block",
    visibility: "visible",
    opacity: "1"
  });
  global.document = {
    pictureInPictureElement: null,
    pictureInPictureEnabled: true,
    exitPictureInPicture: async () => {},
    querySelectorAll(selector) {
      return selector === "video" ? videos : elements;
    },
    ...overrides
  };
}

test.afterEach(() => {
  delete global.document;
  delete global.innerWidth;
  delete global.innerHeight;
  delete global.getComputedStyle;
});

test("opens the strongest playing video", async () => {
  let requested;
  const smallMuted = createVideo({
    muted: true,
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 200, bottom: 120 }),
    requestPictureInPicture: async () => { requested = "small"; }
  });
  const programme = createVideo({
    requestPictureInPicture: async () => { requested = "programme"; }
  });
  installPage([smallMuted, programme]);

  assert.deepEqual(await execute({
    playPausedVideos: false,
    includeSiteBlockedVideos: true
  }), { status: "entered" });
  assert.equal(requested, "programme");
});

test("does not open paused video until enabled", async () => {
  let playCount = 0;
  const paused = createVideo({
    paused: true,
    play: async () => { playCount += 1; }
  });
  installPage([paused]);

  assert.deepEqual(await execute({
    playPausedVideos: false,
    includeSiteBlockedVideos: true
  }), { status: "no-video" });
  assert.equal(playCount, 0);

  assert.deepEqual(await execute({
    playPausedVideos: true,
    includeSiteBlockedVideos: true
  }), { status: "entered" });
  assert.equal(playCount, 1);
});

test("exits an active Picture-in-Picture video", async () => {
  let exited = false;
  installPage([], {
    pictureInPictureElement: createVideo(),
    exitPictureInPicture: async () => { exited = true; }
  });

  assert.deepEqual(await execute({}), { status: "exited" });
  assert.equal(exited, true);
});

test("returns page errors without rejecting the whole frame injection", async () => {
  const blocked = new DOMException("Gesture required", "NotAllowedError");
  installPage([
    createVideo({
      requestPictureInPicture: async () => { throw blocked; }
    })
  ]);

  assert.deepEqual(await execute({}), {
    status: "error",
    name: "NotAllowedError",
    message: "Gesture required"
  });
});
