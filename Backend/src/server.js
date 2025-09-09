import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ORIGIN }));
app.use(helmet());
app.use(express.json());

app.get('/api/meta/types', (_req, res) => {
  res.json(['School','University','Company','Government','NGO','Club','Other']);
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
  const rows = await prisma.district.findMany({ where: { provinceId: prov.id }, orderBy: { name: 'asc' }});
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
    const dist = prov ? await prisma.district.findFirst({ where: { name: String(district), provinceId: prov.id }}) : null;
    if (prov && dist) Object.assign(where, { provinceId: prov.id, districtId: dist.id });
  }
  const rows = await prisma.organization.findMany({ where, take: 20, orderBy: { name: 'asc' }});
  res.json(rows.map(r => r.name));
});

app.post('/api/register', async (req, res) => {
  const { type, province, district, organization } = req.body || {};
  if (!type || !organization) return res.status(400).json({ error: 'Missing fields' });
  const saved = await prisma.registration.create({ data: { type, province: province || null, district: district || null, organization }});
  res.status(201).json({ id: saved.id });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
