import { useEffect, useState } from 'react';
import { fetchReports, updateReport, deleteReport } from '../api/reports';
import { useSession } from '../hooks/useSession';

/**
 * ReportHistory
 *
 * Fetches and displays all saved reports for the current browser session.
 * Each card supports inline title editing and deletion.
 *
 * Props:
 *   refreshTrigger {any} — change this value to force a re-fetch
 *                          (e.g. pass a counter incremented after each upload)
 */
export default function ReportHistory({ refreshTrigger }) {
  const sessionId = useSession();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await fetchReports(sessionId);
        if (!cancelled) setReports(data);
      } catch (err) {
        if (!cancelled) setFetchError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId, refreshTrigger]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await deleteReport(id, sessionId);
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  // ── Inline title edit ──────────────────────────────────────────────────────
  function ReportCard({ report }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(report.title);
    const [saving, setSaving] = useState(false);

    const health = report.capacityData.design > 0
      ? Math.min(100, (report.capacityData.actual / report.capacityData.design) * 100)
      : 0;
    const pct = Math.round(health * 10) / 10;

    const healthColor =
      pct >= 80 ? 'text-accent' : pct >= 60 ? 'text-warning' : 'text-error';

    async function saveTitle() {
      if (title.trim() === report.title) { setEditing(false); return; }
      setSaving(true);
      try {
        const updated = await updateReport(report._id, { title: title.trim() }, sessionId);
        setReports((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r)),
        );
        setEditing(false);
      } catch (err) {
        alert(`Save failed: ${err.message}`);
      } finally {
        setSaving(false);
      }
    }

    return (
      <div className="card bg-neutral border border-secondary/30 shadow-md">
        <div className="card-body gap-3 p-5">
          {/* Title row */}
          <div className="flex items-center gap-2">
            {editing ? (
              <input
                className="input input-sm input-bordered bg-base-100 text-primary font-body flex-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') { setTitle(report.title); setEditing(false); }
                }}
                autoFocus
              />
            ) : (
              <h3 className="font-heading font-bold text-xl text-primary flex-1">
                {title}
              </h3>
            )}

            {editing ? (
              <button
                className="btn btn-xs btn-accent"
                onClick={saveTitle}
                disabled={saving}
              >
                {saving ? '…' : 'Save'}
              </button>
            ) : (
              <button
                className="btn btn-xs btn-ghost text-secondary"
                onClick={() => setEditing(true)}
                aria-label="Edit title"
              >
                ✏
              </button>
            )}

            <button
              className="btn btn-xs btn-ghost text-error"
              onClick={() => handleDelete(report._id)}
              aria-label="Delete report"
            >
              🗑
            </button>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-4 text-sm font-body">
            <span>
              Health:{' '}
              <span className={`font-bold ${healthColor}`}>{pct}%</span>
            </span>
            <span>
              Design:{' '}
              <span className="text-primary font-bold">
                {report.capacityData.design?.toLocaleString()} mWh
              </span>
            </span>
            <span>
              Full charge:{' '}
              <span className="text-primary font-bold">
                {report.capacityData.actual?.toLocaleString()} mWh
              </span>
            </span>
            {report.capacityData.cycles > 0 && (
              <span>
                Cycles:{' '}
                <span className="text-secondary font-bold">
                  {report.capacityData.cycles}
                </span>
              </span>
            )}
          </div>

          {/* Date */}
          <p className="text-xs text-primary/40 font-body mt-1">
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="w-full max-w-2xl mx-auto px-6 pb-16">
      <h2 className="font-heading font-bold text-xl text-primary mb-4">
        Audit History
      </h2>

      {loading && (
        <p className="text-sm text-secondary font-body animate-pulse">
          Loading history…
        </p>
      )}

      {fetchError && (
        <div className="alert alert-error text-sm font-body">
          <span>{fetchError}</span>
        </div>
      )}

      {!loading && !fetchError && reports.length === 0 && (
        <p className="text-sm text-primary/40 font-body">
          No audits yet — drop a battery report above to get started.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {reports.map((r) => (
          <ReportCard key={r._id} report={r} />
        ))}
      </div>
    </section>
  );
}
