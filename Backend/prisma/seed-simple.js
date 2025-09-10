import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding optimized database (500-row limit)...');

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

    // --- Universities & Departments (limit to 200 universities, 300 departments) ---
    console.log('🎓 Seeding universities and departments...');
    const universities = JSON.parse(fs.readFileSync('./server/lookup/universities.json', 'utf-8'));
    const limitedUniversities = universities.slice(0, 200); // Limit to 200 universities
    let universityCount = 0;
    let departmentCount = 0;

    for (const uniName of limitedUniversities) {
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
        const limitedDepartments = departments.slice(0, 2); // Limit to 2 departments per university

        for (const dept of limitedDepartments) {
          if (departmentCount >= 300) break; // Total limit of 300 departments
          
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
      }
    }

    console.log(`🎓 Seeded ${universityCount} universities and ${departmentCount} departments`);

    // --- Schools (limit to 500 total) ---
    console.log('🏫 Seeding schools (limited to 500)...');
    let totalSchoolCount = 0;
    const maxSchoolsPerDistrict = 20; // Limit schools per district

    for (const provinceFolder of provinceDirs) {
      if (totalSchoolCount >= 500) break;
      
      const districtFiles = fs.readdirSync(path.join(schoolsDir, provinceFolder));

      for (const file of districtFiles) {
        if (totalSchoolCount >= 500) break;
        
        if (file.endsWith('.json')) {
          const districtName = path.basename(file, '.json');
          console.log(`📋 Processing schools for ${districtName}...`);
          
          const district = await prisma.district.findUnique({
            where: { name: districtName },
          });

          if (!district) {
            console.log(`⚠️ District not found: ${districtName}`);
            continue;
          }

          const schoolsData = JSON.parse(fs.readFileSync(path.join(schoolsDir, provinceFolder, file), 'utf-8'));
          const limitedSchools = schoolsData.slice(0, maxSchoolsPerDistrict);
          
          for (const schoolName of limitedSchools) {
            if (totalSchoolCount >= 500) break;
            
            try {
              await prisma.school.create({
                data: {
                  name: schoolName,
                  district: districtName,
                  districtId: district.id,
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

    console.log(`🏫 Successfully seeded ${totalSchoolCount} schools!`);
    console.log('✅ All data seeded successfully within 500-row limits!');

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
