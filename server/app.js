import express from 'express';
import cors from 'cors';

import uploadRouter from './routes/upload.js';
import reportsRouter from './routes/reports.js';

const app = express();

app.use(
  cors({
    origin: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-session-id'],
    credentials: false,
  })
);
app.use(express.json());

app.use('/api/upload', uploadRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

export default app;