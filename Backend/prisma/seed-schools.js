import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🏫 Seeding schools...');

  try {
    const schoolsDir = './server/lookup/schools';
    const provinceDirs = fs.readdirSync(schoolsDir);
    let schoolCount = 0;

    for (const provinceFolder of provinceDirs) {
      console.log(`📁 Processing province: ${provinceFolder}`);
      
      const province = await prisma.province.findUnique({
        where: { name: provinceFolder },
      });

      if (!province) {
        console.log(`⚠️ Province not found: ${provinceFolder}`);
        continue;
      }

      const districtFiles = fs.readdirSync(path.join(schoolsDir, provinceFolder));

      for (const file of districtFiles) {
        if (file.endsWith('.json')) {
          const districtName = path.basename(file, '.json');
          console.log(`  📋 Processing district: ${districtName}`);

          const district = await prisma.district.findUnique({
            where: { name: districtName },
          });

          if (!district) {
            console.log(`    ⚠️ District not found: ${districtName}`);
            continue;
          }

          const schoolsData = JSON.parse(fs.readFileSync(path.join(schoolsDir, provinceFolder, file), 'utf-8'));
          
          for (const schoolName of schoolsData) {
            try {
              await prisma.school.create({
                data: {
                  name: schoolName,
                  districtId: district.id,
                },
              });
              schoolCount++;
              
              if (schoolCount % 100 === 0) {
                console.log(`    📊 Processed ${schoolCount} schools so far...`);
              }
            } catch (error) {
              if (error.code === 'P2002') {
                // Duplicate school name in same district - skip
                continue;
              }
              console.error(`    ❌ Error creating school "${schoolName}":`, error.message);
            }
          }
          
          console.log(`    ✅ Processed ${schoolsData.length} schools in ${districtName}`);
        }
      }
    }

    console.log(`🏫 Successfully seeded ${schoolCount} schools!`);

  } catch (error) {
    console.error('❌ Error seeding schools:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
