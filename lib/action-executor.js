(function initialiseActionExecutor(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PipEverywhereActionExecutor = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createActionExecutor() {
  "use strict";

  function run(mode, storedSettings) {
    const settings = {
      playPausedVideos: storedSettings?.playPausedVideos === true,
      includeSiteBlockedVideos: storedSettings?.includeSiteBlockedVideos !== false
    };

    function collectVideos() {
      const videos = [];
      const roots = [document];

      for (let index = 0; index < roots.length; index += 1) {
        const currentRoot = roots[index];
        videos.push(...currentRoot.querySelectorAll("video"));
        currentRoot.querySelectorAll("*").forEach((element) => {
          if (element.shadowRoot) roots.push(element.shadowRoot);
        });
      }

      return [...new Set(videos)];
    }

    function visibleArea(video) {
      const rect = video.getBoundingClientRect();
      const width = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
      const height = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
      const style = getComputedStyle(video);

      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0
      ) {
        return 0;
      }

      return width * height;
    }

    function isEligible(video) {
      if (
        video.readyState < 1 ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        return false;
      }
      if (video.ended && !settings.playPausedVideos) return false;
      if (video.disablePictureInPicture && !settings.includeSiteBlockedVideos) return false;
      return !video.paused || settings.playPausedVideos;
    }

    function score(video) {
      const area = visibleArea(video);
      return Math.min(area, 100_000_000) +
        (!video.paused && !video.ended ? 1_000_000_000 : 0) +
        (!video.muted && video.volume > 0 ? 300_000_000 : 0) +
        (area > 0 ? 100_000_000 : 0);
    }

    function findBestVideo() {
      let best;
      for (const video of collectVideos()) {
        if (!isEligible(video)) continue;
        const candidate = { video, score: score(video) };
        if (!best || candidate.score > best.score) best = candidate;
      }
      return best;
    }

    function inspectAction() {
      if (document.pictureInPictureElement) {
        return { status: "active", score: Number.MAX_SAFE_INTEGER };
      }
      if (!document.pictureInPictureEnabled) return { status: "blocked" };
      const selected = findBestVideo();
      return selected ? { status: "candidate", score: selected.score } : { status: "no-video" };
    }

    async function executeAction() {
      function notifyPictureInPictureClosed() {
        if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return;
        try {
          const notification = chrome.runtime.sendMessage({
            type: "PIP_STATUS_CHANGED",
            active: false
          });
          notification?.catch?.(() => {});
        } catch {
          // The extension may have been reloaded while the page stayed open.
        }
      }

      let selectedVideo;
      let restoreSitePreference;
      let leaveListener;

      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          return { status: "exited" };
        }

        selectedVideo = findBestVideo()?.video;

        if (!selectedVideo) return { status: "no-video" };
        if (!document.pictureInPictureEnabled) {
          return {
            status: "error",
            message: "Picture-in-Picture is blocked on this page."
          };
        }

        const siteBlocked = selectedVideo.disablePictureInPicture;
        if (siteBlocked && settings.includeSiteBlockedVideos) {
          selectedVideo.disablePictureInPicture = false;
          restoreSitePreference = () => {
            if (selectedVideo?.isConnected !== false) selectedVideo.disablePictureInPicture = true;
          };
        }

        leaveListener = (event) => {
          if (event?.isTrusted === false || document.pictureInPictureElement) return;
          selectedVideo?.removeEventListener?.("leavepictureinpicture", leaveListener);
          restoreSitePreference?.();
          notifyPictureInPictureClosed();
        };
        selectedVideo.addEventListener?.("leavepictureinpicture", leaveListener);

        if (selectedVideo.paused && settings.playPausedVideos) {
          try {
            void Promise.resolve(selectedVideo.play()).catch(() => {});
          } catch {
            // Opening a paused Picture-in-Picture window is still useful when playback is blocked.
          }
        }

        await selectedVideo.requestPictureInPicture();
        return { status: "entered" };
      } catch (error) {
        selectedVideo?.removeEventListener?.("leavepictureinpicture", leaveListener);
        restoreSitePreference?.();
        return {
          status: "error",
          name: error instanceof Error ? error.name : "",
          message: error instanceof Error ? error.message : String(error)
        };
      }
    }

    if (mode === "inspect") return inspectAction();
    if (mode === "execute") return executeAction();
    return { status: "error", message: "Unknown Picture-in-Picture action." };
  }

  function inspect(storedSettings) {
    return run("inspect", storedSettings);
  }

  function execute(storedSettings) {
    return run("execute", storedSettings);
  }

  return { execute, inspect, run };
});
