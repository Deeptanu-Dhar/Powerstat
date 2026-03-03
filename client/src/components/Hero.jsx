import { useState } from 'react';

const COMMAND = 'powercfg /batteryreport /output "$HOME\\Downloads\\battery-report.html"';

export default function Hero() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without HTTPS
      const el = document.createElement('textarea');
      el.value = COMMAND;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className="flex flex-col items-center gap-6 px-6 py-16 text-center">
      {/* Wordmark */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-bold tracking-widest uppercase text-secondary">
          on-device
        </span>
        <h1 className="font-heading font-bold text-5xl text-primary leading-tight">
          PowerStat
        </h1>
        <p className="text-xl text-accent font-normal">
          Your System&apos;s Pulse.
        </p>
      </div>

      {/* Description */}
      <p className="max-w-lg text-base text-primary/70 font-normal leading-relaxed">
        Generate your Windows battery report, drag it in, and instantly see
        your battery&apos;s design capacity, current health, and charge-cycle history.
      </p>

      {/* Command block */}
      <div className="w-full max-w-2xl">
        <p className="text-sm text-secondary mb-2 text-left font-bold">
          Step 1 — Run this in PowerShell or CMD:
        </p>
        <div className="relative bg-neutral rounded-lg border border-secondary/40 p-4">
          <code className="block text-accent text-sm font-body break-all pr-24">
            {COMMAND}
          </code>
          <button
            onClick={handleCopy}
            className="btn btn-xs btn-secondary absolute top-3 right-3 transition-all"
            aria-label="Copy command to clipboard"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-sm text-primary/50 mt-2 text-left">
          Then drag the generated{' '}
          <code className="text-accent">battery-report.html</code> file into
          the drop zone below.
        </p>
      </div>
    </section>
  );
}
