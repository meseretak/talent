import {
  AvailabilityStatus,
  FreelancerStatus,
  PrismaClient,
  Role,
} from '../../src/generated/prisma';

const prisma = new PrismaClient();

async function debugSeed() {
  try {
    console.log('Starting debug seed...');

    // Test 1: Create a simple user
    console.log('1. Creating user...');
    const user = await prisma.user.create({
      data: {
        email: 'debug@example.com',
        firstName: 'Debug',
        lastName: 'User',
        password: 'password123',
        role: Role.FREELANCER,
      },
    });
    console.log('User created:', user.id);

    // Test 2: Create availability
    console.log('2. Creating availability...');
    const availability = await prisma.availability.create({
      data: {
        status: AvailabilityStatus.AVAILABLE,
        availableHoursPerWeek: 40,
        notes: 'Debug availability',
      },
    });
    console.log('Availability created:', availability.id);

    // Test 3: Create statistics
    console.log('3. Creating statistics...');
    const stats = await prisma.statisticsInformation.create({
      data: {
        totalEarnings: 0,
        totalProjects: 0,
        totalTasks: 0,
        totalReviews: 0,
        totalRating: 0,
        totalClients: 0,
        totalJobsCompleted: 0,
        totalJobsOngoing: 0,
        totalJobsPending: 0,
        totalJobsCancelled: 0,
        totalJobsOnHold: 0,
        totalStorageUsed: 0,
      },
    });
    console.log('Statistics created:', stats.id);

    // Test 4: Create freelancer
    console.log('4. Creating freelancer...');
    const freelancer = await prisma.freelancer.create({
      data: {
        user: { connect: { id: user.id } },
        headline: 'Debug Freelancer',
        bio: 'Debug bio',
        about: 'Debug about',
        status: FreelancerStatus.APPROVED,
        availability: { connect: { id: availability.id } },
        statisticsInformation: { connect: { id: stats.id } },
      },
    });
    console.log('Freelancer created:', freelancer.id);

    // Test 5: Verify the freelancer was created
    console.log('5. Verifying freelancer...');
    const createdFreelancer = await prisma.freelancer.findUnique({
      where: { id: freelancer.id },
      include: {
        user: true,
        availability: true,
        statisticsInformation: true,
      },
    });
    console.log('Created freelancer:', createdFreelancer);

    console.log('Debug seed completed successfully!');
  } catch (error) {
    console.error('Debug seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

debugSeed().catch((e) => {
  console.error('Error in debug seed:', e);
  process.exit(1);
});
