import { Brand } from "./Brand.tsx";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Brand />
      <p>Keep watching. Keep moving.</p>
      <p>© {new Date().getFullYear()} PiP Everywhere</p>
    </footer>
  );
}

