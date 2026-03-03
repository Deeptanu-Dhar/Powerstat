import { useEffect, useState } from 'react';

/**
 * LoadingBar
 *
 * A DaisyUI progress bar that animates from 0 → 100 % over `duration` ms.
 * Disappears automatically once it reaches 100 % (after a short hold).
 *
 * Props:
 *   active   {boolean} — mount/show the bar
 *   duration {number}  — fill duration in ms (default 2500)
 */
export default function LoadingBar({ active, duration = 2500 }) {
  const [progress, setProgress] = useState(0);
  const [prevActive, setPrevActive] = useState(active);

  // Reset progress during render whenever `active` changes — covers both
  // false→true (start fresh at 0) and true→false (clear the bar).
  // This is the React-recommended pattern for deriving state from prop changes
  // (avoids calling setState inside an effect body).
  if (active !== prevActive) {
    setPrevActive(active);
    setProgress(0);
  }

  useEffect(() => {
    if (!active) return;

    const steps = 50;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      // Ease towards 95 % quickly; the final jump to 100 happens when the
      // parent signals completion (active becomes false → re-mount at 100).
      const next = Math.min(95, Math.round((current / steps) * 100));
      setProgress(next);

      if (current >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [active, duration]);

  if (!active && progress === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-2">
      <progress
        className="progress progress-accent w-full h-2"
        value={progress}
        max={100}
        aria-label="Uploading and parsing battery report"
      />
      <p className="text-xs text-secondary text-center mt-1 font-body">
        Analysing battery report…
      </p>
    </div>
  );
}
