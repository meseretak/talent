import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';
import { ClientType, PrismaClient, Role } from '../../src/generated/prisma';

// Set a consistent seed for reproducible data
faker.seed(123);

// Update function signature to accept prisma client as first parameter
export async function seedClients(prismaClient: PrismaClient, count = 10) {
  console.log('Seeding clients...');

  // Use the passed prisma client
  const prisma = prismaClient;

  // Clear existing data to avoid unique constraint errors
  console.log('Clearing existing client-related data...');

  // Handle potential dependent tables to avoid foreign key constraint violations
  try {
    // Delete any client-related tables first
    console.log('Deleting dependent records...');

    // Delete AuditLog records first to avoid foreign key constraint
    await prisma.auditLog.deleteMany({}).catch((e) => console.log('Error deleting audit logs:', e));

    // Subscription-related records
    await prisma
      .$transaction([
        prisma.paymentTransaction.deleteMany({}),
        prisma.subscription.deleteMany({}),
        prisma.customPlanRequest.deleteMany({}),
      ])
      .catch((e) => console.log('Error deleting subscription data:', e));

    // Project-related records
    await prisma
      .$transaction([prisma.project.deleteMany({})])
      .catch((e) => console.log('Error deleting project data:', e));

    // Auth-related records
    await prisma.userLoginAudit.deleteMany({});
    await prisma.token.deleteMany({});

    // Delete UserPreferences first since it references User
    await prisma.userPreferences
      .deleteMany({})
      .catch((e) => console.log('Error deleting user preferences:', e));

    // Delete NotificationPreferences first since it references User
    await prisma.notificationPreferences
      .deleteMany({})
      .catch((e) => console.log('Error deleting notification preferences:', e));

    // Delete clients
    await prisma.client.deleteMany({});

    // Delete addresses
    await prisma.address.deleteMany({});

    // Delete contact persons
    await prisma.contactPerson.deleteMany({});

    // Delete freelancers
    await prisma.freelancer
      .deleteMany({})
      .catch((e) => console.log('Error deleting freelancers:', e));

    // Delete statistics information
    await prisma.statisticsInformation.deleteMany({});

    // Finally delete users
    await prisma.user.deleteMany({});

    console.log('Successfully cleared existing data');
  } catch (error) {
    console.log('Error during data cleanup:', error);
    console.log('Continuing with seed process...');
  }

  // Create contact persons
  const contactPersons = await Promise.all(
    Array(count)
      .fill(0)
      .map(async () => {
        return prisma.contactPerson.create({
          data: {
            fullName: faker.person.fullName(),
            email: faker.internet.email(),
            phoneNumber: faker.phone.number(),
            position: faker.person.jobTitle(),
          },
        });
      }),
  );

  // Create statistics information
  const statisticsInfos = await Promise.all(
    Array(count)
      .fill(0)
      .map(async () => {
        return prisma.statisticsInformation.create({
          data: {
            totalProjects: faker.number.int({ min: 0, max: 20 }),
            totalRating: faker.number.float({ min: 3, max: 5 }),
            totalReviews: faker.number.int({ min: 0, max: 30 }),
            // Adding the missing required fields from the schema
            totalEarnings: faker.number.int({ min: 0, max: 100000 }),
            totalTasks: faker.number.int({ min: 0, max: 50 }),
            totalClients: faker.number.int({ min: 1, max: 15 }),
            totalJobsCompleted: faker.number.int({ min: 0, max: 30 }),
            totalJobsOngoing: faker.number.int({ min: 0, max: 5 }),
            totalJobsPending: faker.number.int({ min: 0, max: 10 }),
            totalJobsCancelled: faker.number.int({ min: 0, max: 5 }),
            totalJobsOnHold: faker.number.int({ min: 0, max: 3 }),
            totalStorageUsed: faker.number.int({ min: 0, max: 10000 }),
          },
        });
      }),
  );

  // Create users and clients
  const clients = await Promise.all(
    Array(count)
      .fill(0)
      .map(async (_, index) => {
        // Create user first
        const hashedPassword = await hash('password123', 10);
        const user = await prisma.user.create({
          data: {
            email: `client_${index}_${faker.internet.email()}`,
            password: hashedPassword,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            role: Role.CLIENT,
            isEmailVerified: true,
            avatar: faker.image.avatar(),
          },
        });

        // Create billing address for this user
        const billingAddress = await prisma.address.create({
          data: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.county(),
            postalCode: faker.location.zipCode(),
            userId: user.id, // Connect to the user we just created
          },
        });

        // Create client
        return prisma.client.create({
          data: {
            userId: user.id,
            companyName: faker.company.name(),
            companyWebsite: faker.internet.url(),
            billingAddressId: billingAddress.id,
            contactPersonId: contactPersons[index].id,
            referralCode: faker.string.alphanumeric(8).toUpperCase(),
            // Use a random client type instead of enumValue
            clientType:
              Object.values(ClientType)[
                Math.floor(Math.random() * Object.values(ClientType).length)
              ],
            statisticsInformationId: statisticsInfos[index].id,
            // Use a random array element instead of arrayElement
            defaultPaymentMethod: ['credit_card', 'paypal', 'bank_transfer'][
              Math.floor(Math.random() * 3)
            ],
            taxExempt: faker.datatype.boolean(),
            taxId: faker.string.alphanumeric(10).toUpperCase(),
          },
        });
      }),
  );

  console.log(`Seeded ${clients.length} clients`);
  return clients;
}

// If this file is run directly
if (require.main === module) {
  const standaloneClient = new PrismaClient();
  seedClients(standaloneClient)
    .then(async () => {
      await standaloneClient.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await standaloneClient.$disconnect();
      process.exit(1);
    });
}
