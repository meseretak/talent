import {
  AvailabilityStatus,
  FreelancerStatus,
  PrismaClient,
  Role,
} from '../../src/generated/prisma';

const prisma = new PrismaClient();

async function testSchema() {
  try {
    console.log('Testing database schema...');

    // Test 1: Check if tables exist
    console.log('\n1. Checking if tables exist...');

    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Freelancer', 'Availability', 'StatisticsInformation')
    `;
    console.log('Tables found:', tableCount);

    // Test 2: Check Freelancer table structure
    console.log('\n2. Checking Freelancer table structure...');
    const freelancerColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Freelancer'
      ORDER BY ordinal_position
    `;
    console.log('Freelancer columns:', freelancerColumns);

    // Test 3: Check if there are any existing freelancers
    console.log('\n3. Checking existing data...');
    const existingFreelancers = await prisma.freelancer.count();
    const existingUsers = await prisma.user.count({ where: { role: Role.FREELANCER } });
    console.log(`Existing freelancers: ${existingFreelancers}`);
    console.log(`Existing users with FREELANCER role: ${existingUsers}`);

    // Test 4: Try to create a minimal freelancer
    console.log('\n4. Testing freelancer creation...');

    // Create user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-schema@example.com',
        firstName: 'Test',
        lastName: 'Schema',
        password: 'password123',
        role: Role.FREELANCER,
      },
    });
    console.log('Test user created:', testUser.id);

    // Create availability
    const testAvailability = await prisma.availability.create({
      data: {
        status: AvailabilityStatus.AVAILABLE,
        availableHoursPerWeek: 40,
        notes: 'Test availability',
      },
    });
    console.log('Test availability created:', testAvailability.id);

    // Create statistics
    const testStats = await prisma.statisticsInformation.create({
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
    console.log('Test statistics created:', testStats.id);

    // Create freelancer
    const testFreelancer = await prisma.freelancer.create({
      data: {
        user: { connect: { id: testUser.id } },
        headline: 'Test Freelancer',
        bio: 'Test bio',
        about: 'Test about',
        status: FreelancerStatus.APPROVED,
        availability: { connect: { id: testAvailability.id } },
        statisticsInformation: { connect: { id: testStats.id } },
      },
    });
    console.log('Test freelancer created:', testFreelancer.id);

    // Verify the freelancer was created
    const createdFreelancer = await prisma.freelancer.findUnique({
      where: { id: testFreelancer.id },
      include: {
        user: true,
        availability: true,
        statisticsInformation: true,
      },
    });
    console.log('Created freelancer verified:', {
      id: createdFreelancer?.id,
      userId: createdFreelancer?.userId,
      headline: createdFreelancer?.headline,
      availabilityId: createdFreelancer?.availabilityId,
      statisticsInformationId: createdFreelancer?.statisticsInformationId,
    });

    // Clean up test data
    await prisma.freelancer.delete({ where: { id: testFreelancer.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.availability.delete({ where: { id: testAvailability.id } });
    await prisma.statisticsInformation.delete({ where: { id: testStats.id } });
    console.log('Test data cleaned up');

    console.log('\n✅ Schema test completed successfully!');
  } catch (error) {
    console.error('❌ Schema test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testSchema().catch((e) => {
  console.error('Error in schema test:', e);
  process.exit(1);
});
