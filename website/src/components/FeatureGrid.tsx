const features = [
  {
    number: "01",
    title: "Finds the right video",
    copy: "Playing, audible and visible videos rise to the top. No hunting through a page full of embeds.",
    mark: "target",
  },
  {
    number: "02",
    title: "Stays above your work",
    copy: "The native Chrome player floats over other tabs and windows until you are finished.",
    mark: "layers",
  },
  {
    number: "03",
    title: "Works your way",
    copy: "Use the toolbar or Alt–P (Option–P on Mac). Include paused videos and site-blocked players from settings.",
    mark: "shortcut",
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="feature-section" aria-labelledby="feature-heading">
      <header className="feature-heading">
        <p className="section-number">02 / Simple on purpose</p>
        <h2 id="feature-heading">Less player.<br />More playing.</h2>
      </header>

      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.number}>
            <span className={`feature-mark feature-mark--${feature.mark}`} aria-hidden="true">
              <i /><i /><i />
            </span>
            <p>{feature.number}</p>
            <h3>{feature.title}</h3>
            <p>{feature.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
