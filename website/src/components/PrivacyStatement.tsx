const privacyPoints = [
  "No analytics, telemetry, advertising or accounts",
  "No browsing history permission",
  "No video, page content or playback history stored",
  "Automatic mode requests optional site access",
] as const;

export function PrivacyStatement() {
  return (
    <section
      className="privacy-section"
      id="privacy"
      aria-labelledby="privacy-heading"
    >
      <div className="privacy-panel">
        <div className="privacy-copy">
          <p className="section-number">03 / Private by default</p>
          <h2 id="privacy-heading">
            One click.
            <br />
            No trail.
          </h2>
          <div className="privacy-policy">
            <p>
              PiP Everywhere receives temporary access to the active tab when
              you invoke it. It examines video elements, visibility and
              playback state locally only to choose and control a
              Picture-in-Picture video; it does not retain video, page content
              or playback history.
            </p>
            <p>
              Automatic mode is opt-in and requests optional access to HTTP
              and HTTPS pages so the same local adapter can respond to
              Chrome&apos;s media controls. Three preference switches are
              stored in Chrome sync storage until changed, reset or the
              extension is uninstalled; Chrome may sync those settings through
              your signed-in browser profile under Google&apos;s privacy terms.
            </p>
            <p>
              PiP Everywhere does not send page or video data to the developer
              or another party and has no external services. Information
              received through Chrome APIs is used only for its stated purpose
              and in accordance with the Chrome Web Store User Data Policy,
              including the Limited Use requirements. Last updated 26 July
              2026.{" "}
              <a href="https://nicholasgriffin.dev/contact">Contact the developer</a>
              {" "}with privacy questions.
            </p>
          </div>
        </div>
        <ul className="privacy-points">
          {privacyPoints.map((point) => (
            <li key={point}>
              <span aria-hidden="true">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
