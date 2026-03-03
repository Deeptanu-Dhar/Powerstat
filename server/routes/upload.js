import express from 'express';
import multer from 'multer';
import * as cheerio from 'cheerio';

const router = express.Router();

// Store uploaded file in memory — no disk writes needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB ceiling
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('Only .html files are accepted.'));
    }
  },
});

/**
 * parseBatteryReport(htmlBuffer)
 *
 * Pulls three values from the Windows battery-report.html:
 *   - design   : Design Capacity in mWh
 *   - actual   : Full Charge Capacity in mWh
 *   - cycles   : Cycle Count
 *
 * Strategy: iterate every <td>; when its trimmed text matches a known
 * label (case-insensitive), grab the text of the immediately following
 * sibling <td> and strip the " mWh" unit before parsing to int.
 */
function parseBatteryReport(htmlBuffer) {
  const $ = cheerio.load(htmlBuffer.toString('utf-8'));

  const LABELS = {
    design: /design\s+capacity/i,
    actual: /full\s+charge\s+capacity/i,
    cycles: /cycle\s+count/i,
  };

  const result = { design: null, actual: null, cycles: null };

  $('td').each((_i, el) => {
    const text = $(el).text().trim();

    for (const [key, pattern] of Object.entries(LABELS)) {
      if (result[key] === null && pattern.test(text)) {
        // Value is in the next sibling <td>
        const valueText = $(el).next('td').text().trim();
        // Remove units, commas, spaces → parse integer
        const numeric = parseInt(valueText.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numeric)) result[key] = numeric;
      }
    }
  });

  return result;
}

// POST /api/upload
router.post('/', upload.single('report'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const parsed = parseBatteryReport(req.file.buffer);

    const missing = Object.entries(parsed)
      .filter(([k, v]) => k !== 'cycles' && v === null)
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(422).json({
        error: `Could not extract the following fields from the report: ${missing.join(', ')}. Ensure you are uploading a valid Windows battery-report.html.`,
        parsed,
      });
    }

    // Return parsed data; the client then calls POST /api/reports to persist it
    return res.json({
      design: parsed.design,
      actual: parsed.actual,
      cycles: parsed.cycles ?? 0,
    });
  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: 'Failed to parse the HTML file.' });
  }
});

export default router;
