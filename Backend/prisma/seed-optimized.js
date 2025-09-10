import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// District mapping to school table names
const districtSchoolTables = {
  'Colombo': 'schoolColombo',
  'Gampaha': 'schoolGampaha', 
  'Kalutara': 'schoolKalutara',
  'Kandy': 'schoolKandy',
  'Matale': 'schoolMatale',
  'Nuwara Eliya': 'schoolNuwaraEliya',
  'Galle': 'schoolGalle',
  'Matara': 'schoolMatara',
  'Hambantota': 'schoolHambantota',
  'Jaffna': 'schoolJaffna',
  'Kilinochchi': 'schoolKilinochchi',
  'Mannar': 'schoolMannar',
  'Mullaitivu': 'schoolMullaitivu',
  'Vavuniya': 'schoolVavuniya',
  'Batticaloa': 'schoolBatticaloa',
  'Ampara': 'schoolAmpara',
  'Trincomalee': 'schoolTrincomalee',
  'Kurunegala': 'schoolKurunegala',
  'Puttalam': 'schoolPuttalam',
  'Anuradhapura': 'schoolAnuradhapura',
  'Polonnaruwa': 'schoolPolonnaruwa',
  'Badulla': 'schoolBadulla',
  'Monaragala': 'schoolMonaragala',
  'Ratnapura': 'schoolRatnapura',
  'Kegalle': 'schoolKegalle'
};

async function main() {
  console.log('🌱 Seeding optimized database...');

  try {
    // --- Provinces ---
    console.log('📋 Seeding provinces...');
    const provinces = JSON.parse(fs.readFileSync('./server/lookup/provinces.json', 'utf-8'));
    for (const province of provinces) {
      const result = await prisma.province.upsert({
        where: { name: province },
        update: {},
        create: { name: province },
      });
      console.log(`✅ Province: ${result.name}`);
    }
    console.log(`📋 Seeded ${provinces.length} provinces`);

    // --- Districts ---
    console.log('🏘️ Seeding districts...');
    const schoolsDir = './server/lookup/schools';
    const provinceDirs = fs.readdirSync(schoolsDir);
    let districtCount = 0;

    for (const provinceFolder of provinceDirs) {
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

          const result = await prisma.district.upsert({
            where: { name: districtName },
            update: {},
            create: {
              name: districtName,
              provinceId: province.id,
            },
          });
          console.log(`✅ District: ${result.name} (${provinceFolder})`);
          districtCount++;
        }
      }
    }
    console.log(`🏘️ Seeded ${districtCount} districts`);

    // --- Universities & Departments ---
    console.log('🎓 Seeding universities and departments...');
    const universities = JSON.parse(fs.readFileSync('./server/lookup/universities.json', 'utf-8'));
    let universityCount = 0;
    let departmentCount = 0;

    for (const uniName of universities) {
      const university = await prisma.university.upsert({
        where: { name: uniName },
        update: {},
        create: { name: uniName },
      });
      console.log(`✅ University: ${university.name}`);
      universityCount++;

      const fileName = `${uniName}.json`;
      const filePath = path.join('./server/lookup/universities', fileName);

      if (fs.existsSync(filePath)) {
        const departments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const dept of departments) {
          const result = await prisma.department.upsert({
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
          console.log(`  ✅ Department: ${result.name}`);
          departmentCount++;
        }
      } else {
        console.log(`  ⚠️ No departments file found for: ${uniName}`);
      }
    }

    console.log(`🎓 Seeded ${universityCount} universities and ${departmentCount} departments`);

    // --- Schools by District ---
    console.log('🏫 Seeding schools by district...');
    let totalSchoolCount = 0;

    for (const provinceFolder of provinceDirs) {
      const districtFiles = fs.readdirSync(path.join(schoolsDir, provinceFolder));

      for (const file of districtFiles) {
        if (file.endsWith('.json')) {
          const districtName = path.basename(file, '.json');
          const tableName = districtSchoolTables[districtName];
          
          if (!tableName) {
            console.log(`⚠️ No table mapping for district: ${districtName}`);
            continue;
          }

          console.log(`📋 Processing schools for ${districtName}...`);
          const schoolsData = JSON.parse(fs.readFileSync(path.join(schoolsDir, provinceFolder, file), 'utf-8'));
          
          // Limit to 500 schools per district
          const limitedSchools = schoolsData.slice(0, 500);
          
          for (const schoolName of limitedSchools) {
            try {
              await prisma[tableName].create({
                data: {
                  name: schoolName,
                },
              });
              totalSchoolCount++;
            } catch (error) {
              if (error.code === 'P2002') {
                // Duplicate school name - skip
                continue;
              }
              console.error(`❌ Error creating school "${schoolName}" in ${districtName}:`, error.message);
            }
          }
          
          console.log(`  ✅ Processed ${limitedSchools.length} schools in ${districtName}`);
        }
      }
    }

    console.log(`🏫 Successfully seeded ${totalSchoolCount} schools across all districts!`);
    console.log('✅ All data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
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
