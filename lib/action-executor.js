(function initialiseActionExecutor(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PipEverywhereActionExecutor = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createActionExecutor() {
  "use strict";

  async function execute(storedSettings) {
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

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return { status: "exited" };
      }

      const video = collectVideos()
        .filter(isEligible)
        .map((candidate) => ({ candidate, score: score(candidate) }))
        .sort((left, right) => right.score - left.score)[0]?.candidate;

      if (!video) return { status: "no-video" };
      if (!document.pictureInPictureEnabled) {
        return {
          status: "error",
          message: "Picture-in-Picture is blocked on this page."
        };
      }
      if (video.disablePictureInPicture && settings.includeSiteBlockedVideos) {
        video.disablePictureInPicture = false;
      }
      if (video.paused && settings.playPausedVideos) {
        await video.play();
      }

      await video.requestPictureInPicture();
      return { status: "entered" };
    } catch (error) {
      return {
        status: "error",
        name: error instanceof Error ? error.name : "",
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  return { execute };
});

