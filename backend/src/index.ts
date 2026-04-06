import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { getDatabaseUrl, initializeDatabase } from './db/index.js';
import { leadIntakeRouter } from './routes/leadIntake.js';
import { leadsRouter } from './routes/leads.js';
import { logsRouter } from './routes/logs.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: frontendOrigin,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/lead-intake', leadIntakeRouter);
app.use('/api/leads', leadsRouter);
app.use('/api', logsRouter);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`[backend] Server listening on http://localhost:${port}`);
      console.log(`[backend] CORS enabled for ${frontendOrigin}`);
      console.log(`[backend] Database connected: ${getDatabaseUrl()}`);
    });
  })
  .catch((error) => {
    console.error('[backend] Failed to initialize database', error);
    process.exit(1);
  });
