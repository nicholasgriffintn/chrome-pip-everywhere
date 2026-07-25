const privacyPoints = [
  "No analytics, telemetry or advertising",
  "No browsing history permission",
  "No page content stored or transmitted",
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
          <p>
            PiP Everywhere receives temporary access to the active tab only
            when you invoke it. Automatic mode is opt-in and requests access
            only so its isolated adapter can recognise playing video.
          </p>
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
