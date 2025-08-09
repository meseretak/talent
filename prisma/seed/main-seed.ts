import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '../../src/generated/prisma';
import { seedClients } from './client-data';
import seedFreelancerData from './freelancer-data';
import { seedPlans } from './plan-seed';
// Import other seed files as needed
// import seedOtherData from './other-data';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running plan seed...');
    await seedPlans(prisma); // Call the function directly

    console.log('Seeding client data...');
    await seedClients(prisma); // Pass the prisma client as the first argument

    console.log('Seeding freelancer data...');
    await seedFreelancerData(prisma);

    // Execute other seed functions
    // console.log('Seeding other data...');
    // await seedOtherData(prisma);

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Error in main seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
