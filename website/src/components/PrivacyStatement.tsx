const privacyPoints = [
  "No analytics, telemetry or advertising",
  "No browsing history permission",
  "No page content stored or transmitted",
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
            when you invoke it. Video selection happens inside that tab.
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
