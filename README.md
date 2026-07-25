# PiP Everywhere

Pop the best video in the active Chrome tab into an always-on-top Picture-in-Picture window.

## Use it

1. Play a video.
2. Click the PiP Everywhere toolbar icon or press `Alt+P`.
3. Click again to return the video to its tab.

Open the extension options to include paused or finished videos, or respect a website’s Picture-in-Picture preference.

The extension uses `activeTab` access only after you invoke it. It does not read browsing history, send analytics or make network requests.

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
