import { useState } from 'react';
import './App.css';

import Hero from './components/Hero';
import DropZone from './components/DropZone';
import CapacityChart from './components/CapacityChart';
import HealthGauge from './components/HealthGauge';
import ReportHistory from './components/ReportHistory';

function App() {
  // Most recent parsed+saved report — drives the chart & gauge
  const [activeReport, setActiveReport] = useState(null);
  // Increment to trigger a ReportHistory re-fetch after each upload
  const [historyKey, setHistoryKey] = useState(0);

  function handleResult(savedReport) {
    setActiveReport(savedReport);
    setHistoryKey((k) => k + 1);
  }

  return (
    <main className="min-h-screen bg-base-100 text-primary font-body flex flex-col items-center">
      {/* ── Header nav ────────────────────────────────────────────────────── */}
      <header className="w-full border-b border-secondary/20 px-6 py-3 flex items-center justify-between">
        <span className="font-heading font-bold text-xl text-accent tracking-wide">
          PowerStat
        </span>
        <span className="text-xs text-primary/40 font-body">Battery Health Analyzer</span>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl border-t border-secondary/20 mx-auto" />

      {/* ── Drop zone (LoadingBar is rendered inside DropZone) ────────────── */}
      <div className="w-full max-w-2xl px-0 py-8">
        <DropZone onResult={handleResult} />
      </div>

      {/* ── Visualisations — only shown after a successful upload ─────────── */}
      {activeReport && (
        <>
          <div className="w-full max-w-2xl border-t border-secondary/20 mx-auto" />
          <section className="w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-12 items-center">
            <HealthGauge
              design={activeReport.capacityData.design}
              actual={activeReport.capacityData.actual}
              cycles={activeReport.capacityData.cycles}
            />
            <CapacityChart
              design={activeReport.capacityData.design}
              actual={activeReport.capacityData.actual}
            />
          </section>
        </>
      )}

      {/* ── Audit history ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl border-t border-secondary/20 mx-auto mt-4" />
      <div className="w-full py-8">
        <ReportHistory refreshTrigger={historyKey} />
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-secondary/20 px-6 py-4 text-center">
        <span className="text-xs text-primary/30 font-body">
          PowerStat MVP · data stays on your device
        </span>
      </footer>
    </main>
  );
}

export default App;
