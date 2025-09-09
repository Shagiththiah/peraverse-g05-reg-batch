import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import registrationRoutes from '../src/routes/registrationRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// APIs
app.use('/api', registrationRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// ---- Serve React build (optional, controlled by env) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (process.env.SERVE_FRONTEND === 'true') {
  const distPath = path.resolve(__dirname, '../../Frontend/dist');
  app.use(express.static(distPath));
  // send index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).send('Not Found');
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // friendlier root page in dev
  app.get('/', (_req, res) =>
    res.send('RFID Registration API is running. Try <a href="/api/provinces">/api/provinces</a>')
  );
}

const port = +(process.env.PORT || 4000);
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => console.log(`Backend running on http://${host}:${port}`));
