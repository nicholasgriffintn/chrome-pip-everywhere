import { DownloadButton } from "./DownloadButton.tsx";

const steps = [
  ["Add to Chrome", "Install PiP Everywhere from the Chrome Web Store."],
  ["Start watching", "Play a video, then click the toolbar icon or press Alt–P."],
] as const;

export function Installation() {
  return (
    <section className="installation" id="install" aria-labelledby="install-heading">
      <div className="installation-copy">
        <p className="section-number">04 / Ready when you are</p>
        <h2 id="install-heading">Put any video<br />in its place.</h2>
        <p>Install it from the Chrome Web Store, play a video and click the icon.</p>
        <DownloadButton />
      </div>
      <ol className="install-steps">
        {steps.map(([title, copy], index) => (
          <li key={title}>
            <span>0{index + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
