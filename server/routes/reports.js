import express from 'express';
import Report from '../models/Report.js';
import { sessionMiddleware } from '../middleware/session.js';

const router = express.Router();

// Apply session validation to all routes in this file
router.use(sessionMiddleware);

// ── POST /api/reports ───────────────────────────────────────────────────────
// Save a newly parsed report for the current session.
router.post('/', async (req, res) => {
  try {
    const { title, capacityData } = req.body;

    if (!capacityData?.design || !capacityData?.actual) {
      return res.status(400).json({ error: 'capacityData.design and capacityData.actual are required.' });
    }

    const report = await Report.create({
      sessionId: req.sessionId,
      title: title || 'Battery Audit',
      capacityData: {
        design: capacityData.design,
        actual: capacityData.actual,
        cycles: capacityData.cycles ?? 0,
      },
    });

    return res.status(201).json(report);
  } catch (err) {
    console.error('POST /api/reports error:', err);
    return res.status(500).json({ error: 'Failed to save report.' });
  }
});

// ── GET /api/reports/:sessionId ─────────────────────────────────────────────
// Return all reports for the given sessionId, newest first.
// The param sessionId is validated against the header sessionId so a session
// can only read its own history.
router.get('/:sessionId', async (req, res) => {
  try {
    if (req.params.sessionId !== req.sessionId) {
      return res.status(403).json({ error: 'Session ID mismatch.' });
    }

    const reports = await Report.find({ sessionId: req.sessionId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(reports);
  } catch (err) {
    console.error('GET /api/reports/:sessionId error:', err);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// ── PATCH /api/reports/:id ──────────────────────────────────────────────────
// Update the title and/or notes of a report.
// Only the owning session may update a report.
router.patch('/:id', async (req, res) => {
  try {
    const allowedFields = ['title', 'notes'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided (title, notes).' });
    }

    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, sessionId: req.sessionId },
      { $set: updates },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found or does not belong to this session.' });
    }

    return res.json(report);
  } catch (err) {
    console.error('PATCH /api/reports/:id error:', err);
    return res.status(500).json({ error: 'Failed to update report.' });
  }
});

// ── DELETE /api/reports/:id ─────────────────────────────────────────────────
// Remove a specific report. Only the owning session may delete it.
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      sessionId: req.sessionId,
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found or does not belong to this session.' });
    }

    return res.json({ message: 'Report deleted.' });
  } catch (err) {
    console.error('DELETE /api/reports/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete report.' });
  }
});

export default router;
