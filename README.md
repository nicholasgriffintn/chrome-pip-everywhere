# PiP Everywhere

Pop the best video in the active Chrome tab into an always-on-top Picture-in-Picture window.

![A video moving from a browser tab into Picture-in-Picture](promos/marquee-1400x560.png)

## What it does

- Chooses the most relevant playing, audible and visible video in the current tab.
- Toggles Chrome's native Picture-in-Picture player from the toolbar or `Alt+P`.
- Can include paused, finished or site-blocked videos.
- Can automatically open PiP when you leave a playing tab and close it when you return.

![A screenshot of the PIP in action](screenshots/screenshot.png)

## How to use it

1. Play a video.
2. Click the PiP Everywhere toolbar icon or press `Alt+P`.
3. Click again to return the video to its tab.

Open the extension options to change video selection or enable automatic PiP. Automatic PiP requires Chrome 134 or later, optional access to video pages and Chrome's per-site approval.

## Install from source

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose this repository.

## Privacy

By default, PiP Everywhere receives temporary access to the active tab only after it is invoked. It examines video elements, visibility and playback state locally only to choose and control a Picture-in-Picture video. It does not retain video, page content or playback history.

Automatic mode is opt-in and requests optional access to HTTP and HTTPS pages so the same local adapter can respond to Chrome's media controls. Three preference switches remain in `chrome.storage.sync` until changed, reset or the extension is uninstalled. Chrome may sync those settings through the user's signed-in browser profile under Google's privacy terms.

PiP Everywhere does not send page or video data to the developer or another party, read browsing history, send analytics or make network requests. It has no accounts, advertising, remote scripts or external services.

Information received through Chrome APIs is used only for PiP Everywhere's stated purpose and in accordance with the Chrome Web Store User Data Policy, including the Limited Use requirements. The privacy policy was last updated on 26 July 2026. [Contact the developer](https://nicholasgriffin.dev/contact) with privacy questions.

## Limitations

- Chrome and individual websites may prevent Picture-in-Picture for some videos.
- Captions rendered outside the `<video>` element, including YouTube's HTML caption overlay, do not appear in Chrome's native PiP window.
- Automatic PiP depends on Chrome's version, permission and per-site approval.

## Development

```sh
pnpm check
pnpm test
pnpm run package
```
