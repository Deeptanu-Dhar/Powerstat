import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile, saveReport } from '../api/reports';
import { useSession } from '../hooks/useSession';
import LoadingBar from './LoadingBar';

/**
 * DropZone
 *
 * Accepts a single battery-report.html via drag-and-drop or click.
 * Workflow:
 *   1. User drops the file → show LoadingBar
 *   2. POST /api/upload  → server parses HTML, returns { design, actual, cycles }
 *   3. POST /api/reports → persist to MongoDB
 *   4. Call onResult(report) so the parent can update charts / history
 *
 * Props:
 *   onResult {function} — called with the saved MongoDB report document
 */
export default function DropZone({ onResult }) {
  const sessionId = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        setError('Only .html files are accepted. Please drop your battery-report.html.');
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);

      try {
        // Step 1: parse
        const parsed = await uploadFile(file, sessionId);

        // Step 2: persist
        const saved = await saveReport(parsed, sessionId);

        onResult?.(saved);
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [sessionId, onResult],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/html': ['.html'] },
    multiple: false,
    disabled: loading,
  });

  return (
    <section className="flex flex-col items-center gap-4 px-6 w-full">
      <p className="text-sm font-bold text-secondary tracking-widest uppercase">
        Step 2 — Drop your report
      </p>

      <div
        {...getRootProps()}
        className={[
          'w-full max-w-2xl rounded-xl border-2 border-dashed cursor-pointer',
          'flex flex-col items-center justify-center gap-3 p-12 transition-colors',
          isDragActive
            ? 'border-accent bg-accent/10'
            : 'border-secondary/50 bg-neutral/40 hover:border-accent hover:bg-accent/5',
          loading ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
        aria-label="Drop zone for battery-report.html"
      >
        <input {...getInputProps()} />
        <span className="text-4xl select-none" aria-hidden>
          {isDragActive ? '📂' : '🔋'}
        </span>
        <p className="text-base text-primary font-normal text-center">
          {isDragActive
            ? 'Release to analyse…'
            : 'Drag & drop your battery-report.html here'}
        </p>
        <p className="text-sm text-primary/50">or click to browse</p>
      </div>

      {/* Progress bar appears while uploading */}
      <LoadingBar active={loading} duration={2500} />

      {/* Error feedback */}
      {error && (
        <div className="alert alert-error max-w-2xl w-full text-sm font-body">
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
