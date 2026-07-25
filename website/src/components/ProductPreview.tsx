export function ProductPreview() {
  return (
    <section className="product-section" id="how-it-works" aria-labelledby="preview-heading">
      <div className="product-stage" aria-hidden="true">
        <div className="browser-window">
          <div className="browser-bar">
            <span className="traffic-lights"><i /><i /><i /></span>
            <span className="address">watch.example.com / the-final-cut</span>
            <span className="toolbar-pip">
              <img src="/icon.svg" alt="" />
            </span>
          </div>
          <div className="page-frame">
            <div className="page-copy">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="video-placeholder">
              <span className="play-mark" />
              <div className="video-line"><i /><b>18:42</b></div>
            </div>
          </div>
        </div>

        <div className="floating-player">
          <div className="scene">
            <span className="moon" />
            <span className="horizon horizon--one" />
            <span className="horizon horizon--two" />
            <span className="person" />
          </div>
          <div className="player-controls">
            <span>Ⅱ</span>
            <div><i /><i /><i /></div>
            <span>↗</span>
          </div>
        </div>

        <div className="click-callout">
          <span>01</span>
          <p>Play your video.<br />Click the toolbar icon.</p>
        </div>
      </div>

      <div className="product-caption">
        <p className="section-number">01 / The disappearing act</p>
        <h2 id="preview-heading">Keep the picture.<br />Lose the tab.</h2>
        <p>
          PiP Everywhere finds the best active video for you. The floating player
          stays visible while you work elsewhere, then returns to its tab when you close it.
        </p>
      </div>
    </section>
  );
}
