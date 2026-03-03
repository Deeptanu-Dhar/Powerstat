/**
 * API client layer — all fetch calls go through here.
 * Each function attaches the `x-session-id` header automatically.
 * The Vite dev proxy forwards `/api/*` to http://localhost:5000.
 */

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';

  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { error: text || `Request failed with status ${res.status}` };
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

// ── Upload & Parse ───────────────────────────────────────────────────────────

/**
 * Upload a battery-report.html file to the server for parsing.
 * Returns { design, actual, cycles } on success.
 */
export async function uploadFile(file, sessionId) {
  const formData = new FormData();
  formData.append('report', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'x-session-id': sessionId },
    body: formData,
  });

  return handleResponse(res);
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Save a parsed report to the database.
 * @param {{ design: number, actual: number, cycles: number }} capacityData
 * @param {string} sessionId
 * @param {string} [title]
 */
export async function saveReport(capacityData, sessionId, title = 'Battery Audit') {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    },
    body: JSON.stringify({ title, capacityData }),
  });

  return handleResponse(res);
}

/**
 * Fetch all reports for the current session, newest first.
 */
export async function fetchReports(sessionId) {
  const res = await fetch(`/api/reports/${sessionId}`, {
    headers: { 'x-session-id': sessionId },
  });

  return handleResponse(res);
}

/**
 * Update a report's title and/or notes.
 * @param {string} id  MongoDB _id of the report
 * @param {{ title?: string, notes?: string }} patch
 * @param {string} sessionId
 */
export async function updateReport(id, patch, sessionId) {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    },
    body: JSON.stringify(patch),
  });

  return handleResponse(res);
}

/**
 * Delete a specific report by its MongoDB _id.
 */
export async function deleteReport(id, sessionId) {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
    headers: { 'x-session-id': sessionId },
  });

  return handleResponse(res);
}
