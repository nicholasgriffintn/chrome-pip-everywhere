import { Brand } from "./Brand.tsx";
import { DownloadButton } from "./DownloadButton.tsx";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#privacy">Privacy</a>
        <a href="#install">Install</a>
      </nav>
      <DownloadButton compact />
    </header>
  );
}
