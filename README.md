# PiP Everywhere

Pop the best video in the active Chrome tab into an always-on-top Picture-in-Picture window.

## Use it

1. Play a video.
2. Click the PiP Everywhere toolbar icon or press `Alt+P`.
3. Click again to return the video to its tab.

Open the extension options to include paused or finished videos, respect a website’s Picture-in-Picture preference, or open PiP automatically when you leave a playing tab. Automatic PiP requires Chrome 134 or later, optional access to video pages and Chrome’s per-site approval.

By default, the extension uses `activeTab` access only after you invoke it. Enabling automatic PiP requests optional access to HTTP and HTTPS pages so its isolated page adapter can register Chrome’s Media Session handler. It does not read browsing history, store or transmit page content, send analytics or make network requests.

## Captions and subtitles

Standard Chrome Picture-in-Picture contains the selected `<video>` element, not the surrounding page. YouTube renders captions as a separate HTML overlay, so they remain in the tab instead of appearing in the native PiP window.

Reliable YouTube captions would require a site-specific Document Picture-in-Picture player that moves or recreates YouTube’s video, caption layer and styles. PiP Everywhere does not currently do this because it would couple playback to YouTube’s private page structure.

## Install locally

1. Run `pnpm run package`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this directory.

## Develop

```sh
pnpm check
pnpm test
pnpm run package
```
