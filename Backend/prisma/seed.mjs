import { PrismaClient } from '@prisma/client';
import { provinces, districtsByProvince, universities, schoolsByProvinceDistrict } from '../src/seed/data.mjs';
const prisma = new PrismaClient();

async function main() {
  // Provinces
  for (const p of provinces) {
    await prisma.province.upsert({
      where: { name: p },
      update: {},
      create: { name: p }
    });
  }

  // Districts
  for (const [prov, list] of Object.entries(districtsByProvince)) {
    const province = await prisma.province.findUnique({ where: { name: prov }});
    for (const d of list) {
      await prisma.district.upsert({
        where: { provinceId_name: { provinceId: province.id, name: d } },
        update: {},
        create: { name: d, provinceId: province.id }
      });
    }
  }

  // Universities (national)
  for (const name of universities) {
    await prisma.organization.upsert({
      where: { id: 0 }, // force create
      update: {},
      create: { type: 'University', name }
    });
  }

  // Schools by province/district
  for (const [prov, byDist] of Object.entries(schoolsByProvinceDistrict)) {
    const province = await prisma.province.findUnique({ where: { name: prov }});
    for (const [dist, names] of Object.entries(byDist)) {
      const district = await prisma.district.findFirst({ where: { name: dist, provinceId: province.id }});
      for (const s of names) {
        await prisma.organization.create({
          data: { type: 'School', name: s, provinceId: province.id, districtId: district.id }
        });
      }
    }
  }

  console.log('Seed complete');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
