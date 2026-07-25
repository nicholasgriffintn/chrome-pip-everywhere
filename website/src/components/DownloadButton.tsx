type DownloadButtonProps = {
  compact?: boolean;
};

export function DownloadButton({ compact = false }: DownloadButtonProps) {
  return (
    <a
      className={compact ? "download-button download-button--compact" : "download-button"}
      href="/pip-everywhere.zip"
      download
    >
      <span>Download for Chrome</span>
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15.5h12" />
      </svg>
    </a>
  );
}

