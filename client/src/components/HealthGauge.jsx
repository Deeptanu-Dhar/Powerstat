/**
 * HealthGauge
 *
 * Displays battery health as a percentage using a DaisyUI radial-progress.
 * Colour shifts based on health tier:
 *   ≥ 80 %  → accent  (green)
 *   60–79 % → warning (yellow)
 *   < 60 %  → error   (red)
 *
 * Props:
 *   design {number} — Design Capacity in mWh
 *   actual {number} — Full Charge Capacity in mWh
 *   cycles {number} — Cycle Count
 */
export default function HealthGauge({ design, actual, cycles }) {
  const health = design > 0 ? Math.min(100, (actual / design) * 100) : 0;
  const pct = Math.round(health * 10) / 10; // one decimal place

  // Colour class based on health
  const colorClass =
    pct >= 80
      ? 'text-accent'
      : pct >= 60
        ? 'text-warning'
        : 'text-error';

  // DaisyUI radial-progress uses a CSS custom property for fill amount
  const gaugeStyle = { '--value': Math.round(pct), '--size': '10rem', '--thickness': '10px' };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="font-heading font-bold text-xl text-primary">
        Battery Health
      </h2>

      {/* DaisyUI radial-progress */}
      <div
        className={`radial-progress font-heading font-bold text-2xl ${colorClass}`}
        style={gaugeStyle}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Battery health: ${pct}%`}
      >
        {pct}%
      </div>

      {/* Supporting metrics */}
      <div className="flex flex-col items-center gap-1 text-sm text-primary/70 font-body">
        <span>
          <span className="text-primary font-bold">{actual?.toLocaleString()}</span> mWh full charge
        </span>
        <span>
          out of{' '}
          <span className="text-primary font-bold">{design?.toLocaleString()}</span> mWh design
        </span>
        {cycles > 0 && (
          <span className="mt-1">
            <span className="text-secondary font-bold">{cycles}</span> charge cycles
          </span>
        )}
      </div>

      {/* Health label */}
      <span
        className={`badge badge-outline text-xs font-bold ${colorClass} border-current`}
      >
        {pct >= 80 ? 'Good' : pct >= 60 ? 'Fair' : 'Replace Soon'}
      </span>
    </div>
  );
}
