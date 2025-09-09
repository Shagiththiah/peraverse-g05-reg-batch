import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import adminRoutes from "./src/routes/adminRoutes.js";

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'supersecret123';

app.use(cors({ origin: ORIGIN }));
app.use(helmet());
app.use(express.json());
app.use("/api/admin", adminRoutes);
/* ------------------ META ENDPOINTS ------------------ */

app.get('/api/meta/types', (_req, res) => {
  res.json(['School','University','Family','Company','Government','NGO','Club','Other']);
});

app.get('/api/meta/provinces', async (_req, res) => {
  const rows = await prisma.province.findMany({ orderBy: { name: 'asc' }});
  res.json(rows.map(r => r.name));
});

app.get('/api/meta/districts', async (req, res) => {
  const { province } = req.query;
  if (!province) return res.status(400).json({ error: 'province required' });
  const prov = await prisma.province.findUnique({ where: { name: String(province) }});
  if (!prov) return res.json([]);
  const rows = await prisma.district.findMany({
    where: { provinceId: prov.id },
    orderBy: { name: 'asc' }
  });
  res.json(rows.map(r => r.name));
});

app.get('/api/meta/organizations', async (req, res) => {
  const { type, province, district, q } = req.query;
  if (!type) return res.status(400).json({ error: 'type required' });

  const where = {
    type: String(type),
    name: { startsWith: String(q || ''), mode: 'insensitive' }
  };

  if (type === 'School' && province && district) {
    const prov = await prisma.province.findUnique({ where: { name: String(province) }});
    const dist = prov
      ? await prisma.district.findFirst({
          where: { name: String(district), provinceId: prov.id }
        })
      : null;
    if (prov && dist) Object.assign(where, { provinceId: prov.id, districtId: dist.id });
  }

  const rows = await prisma.organization.findMany({
    where,
    take: 20,
    orderBy: { name: 'asc' }
  });
  res.json(rows.map(r => r.name));
});

/* ------------------ REGISTRATION ------------------ */

/**
 * Expected payloads:
 * - School: { type:'School', province, district, organization, group_size, group_meta }
 * - University: { type:'University', organization, group_size }
 * - Family: { type:'Family', group_size, group_meta:{ familyType } }
 * - General/Other: { type:'General', group_size, group_meta:{ ageRange, sex } }
 */
app.post('/api/register', async (req, res) => {
  try {
    const { type, province, district, organization, group_size, group_meta } = req.body || {};

    if (!type || !organization) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const saved = await prisma.registration.create({
      data: {
        type,
        province: province || null,
        district: district || null,
        organization,
        group_size: group_size || 1,
        group_meta: group_meta || {}
      }
    });

    res.status(201).json({ ok: true, id: saved.id, summary: saved });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

/* ------------------ ADMIN PORTAL ------------------ */

// Simple auth middleware (Bearer token)
app.use('/api/admin', (req, res, next) => {
  const auth = req.headers['authorization'];
  if (auth === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
});

// List all registrations
app.get('/api/admin/registrations', async (_req, res) => {
  try {
    const rows = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(rows);
  } catch (err) {
    console.error('Admin fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

/* ------------------ HEALTH ------------------ */
app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
