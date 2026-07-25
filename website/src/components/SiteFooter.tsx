import { Brand } from "./Brand.tsx";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Brand />
      <nav aria-label="Footer navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#privacy">Privacy</a>
        <a href="#install">Install</a>
      </nav>
      <p>© {new Date().getFullYear()} PiP Everywhere</p>
    </footer>
  );
}
