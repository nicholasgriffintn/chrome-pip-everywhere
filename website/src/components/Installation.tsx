import { DownloadButton } from "./DownloadButton.tsx";

const steps = [
  ["Download", "Get the extension archive and unzip it."],
  ["Open Chrome", "Visit chrome://extensions and enable Developer mode."],
  ["Load it", "Choose Load unpacked and select the extension folder."],
];

export function Installation() {
  return (
    <section className="installation" aria-labelledby="install-heading">
      <div className="installation-copy">
        <p className="section-number">03 / Ready when you are</p>
        <h2 id="install-heading">Put any video<br />in its place.</h2>
        <p>Install it locally in under a minute. Then play a video and click the icon.</p>
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

