import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Provinces ---
  const provinces = JSON.parse(fs.readFileSync('./server/lookup/provinces.json', 'utf-8'));
  for (const province of provinces) {
    await prisma.province.upsert({
      where: { name: province },
      update: {},
      create: { name: province },
    });
  }

  // --- Districts ---
  const schoolsDir = './server/lookup/schools';
  const provinceDirs = fs.readdirSync(schoolsDir);

  for (const provinceFolder of provinceDirs) {
    const province = await prisma.province.findUnique({
      where: { name: provinceFolder },
    });

    if (!province) continue;

    const districtFiles = fs.readdirSync(path.join(schoolsDir, provinceFolder));

    for (const file of districtFiles) {
      if (file.endsWith('.json')) {
        const districtName = path.basename(file, '.json');

        await prisma.district.upsert({
          where: { name: districtName },
          update: {},
          create: {
            name: districtName,
            provinceId: province.id,
          },
        });
      }
    }
  }

  // --- Universities & Departments ---
  const universities = JSON.parse(fs.readFileSync('./server/lookup/universities.json', 'utf-8'));

  for (const uniName of universities) {
    // Insert university
    const university = await prisma.university.upsert({
      where: { name: uniName },
      update: {},
      create: { name: uniName },
    });

    // Look for department JSON file
    const fileName = `${uniName}.json`;
    const filePath = path.join('./server/lookup/universities', fileName);

    if (fs.existsSync(filePath)) {
      const departments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const dept of departments) {
        await prisma.department.upsert({
          where: {
            name_universityId: {
              name: dept,
              universityId: university.id,
            },
          },
          update: {},
          create: {
            name: dept,
            universityId: university.id,
          },
        });
      }
    }
  }

  console.log('✅ Provinces + Districts + Universities + Departments seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
