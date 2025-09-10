import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏷️ Seeding RFID tags...');

  try {
    // Create 100 RFID tags with unique numbers
    const rfidTags = [];
    
    for (let i = 1; i <= 100; i++) {
      const tagNumber = `RFID-${String(i).padStart(4, '0')}`; // RFID-0001, RFID-0002, etc.
      
      rfidTags.push({
        tagNumber: tagNumber,
        status: 'AVAILABLE'
      });
    }

    // Insert all RFID tags
    await prisma.rfidTag.createMany({
      data: rfidTags,
      skipDuplicates: true
    });

    console.log(`✅ Successfully created ${rfidTags.length} RFID tags`);
    console.log('🏷️ RFID tags seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding RFID tags:', error);
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
