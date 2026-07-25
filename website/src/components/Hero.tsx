import { DownloadButton } from "./DownloadButton.tsx";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className="eyebrow">
          <span aria-hidden="true" />
          One click Picture-in-Picture
        </p>
        <h1 id="hero-heading">
          Your video.
          <em>Above everything.</em>
        </h1>
        <p className="hero-intro">
          Pop the video you’re watching into a small, always-on-top window.
          Change tabs, answer email, keep watching.
        </p>
        <div className="hero-actions">
          <DownloadButton />
          <a className="text-link" href="#how-it-works">See how it works</a>
        </div>
        <p className="hero-note">Free · No account · No tracking</p>
      </div>
      <div className="hero-mark" aria-hidden="true">
        <span>PICTURE</span>
        <span>IN</span>
        <span>PICTURE</span>
      </div>
    </section>
  );
}
