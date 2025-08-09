import { PrismaClient } from '../../src/generated/prisma';

// Function that can be called from main-seed.ts
export async function seedPlans(prisma: PrismaClient) {
  console.log('Starting plan seed...');

  try {
    // Create plan statistics
    console.log('Creating plan statistics...');
    const basicStats = await prisma.planStatistics.upsert({
      where: { id: 1 }, // Assuming we want to use a specific ID for basic stats
      update: {
        totalProjects: 0,
        totalClients: 0,
        totalEarnings: 0,
      },
      create: {
        id: 1,
        totalProjects: 0,
        totalClients: 0,
        totalEarnings: 0,
      },
    });

    const proStats = await prisma.planStatistics.upsert({
      where: { id: 2 }, // Assuming we want to use a specific ID for pro stats
      update: {
        totalProjects: 0,
        totalClients: 0,
        totalEarnings: 0,
      },
      create: {
        id: 2,
        totalProjects: 0,
        totalClients: 0,
        totalEarnings: 0,
      },
    });

    const businessStats = await prisma.planStatistics.upsert({
      where: { id: 3 }, // Assuming we want to use a specific ID for business stats
      update: {
        totalProjects: 0,
        totalClients: 0,
        totalEarnings: 0,
      },
      create: {
        id: 3,
        totalProjects: 0,
        totalClients: 0,
        totalEarnings: 0,
      },
    });

    console.log('Plan statistics created/updated');

    // Create features
    console.log('Creating features...');
    const creditsFeature = await prisma.feature.upsert({
      where: { key: 'credits' },
      update: {},
      create: {
        name: 'Monthly Credits',
        description: 'Number of credits allocated monthly',
        key: 'credits',
      },
    });

    const brandsFeature = await prisma.feature.upsert({
      where: { key: 'brands' },
      update: {},
      create: {
        name: 'Brands',
        description: 'Number of brands that can be managed',
        key: 'brands',
      },
    });

    const projectsFeature = await prisma.feature.upsert({
      where: { key: 'projects' },
      update: {},
      create: {
        name: 'Active Projects',
        description: 'Number of active projects allowed at one time',
        key: 'projects',
      },
    });

    const usersFeature = await prisma.feature.upsert({
      where: { key: 'users' },
      update: {},
      create: {
        name: 'Team Members',
        description: 'Number of team members allowed',
        key: 'users',
      },
    });

    const supportFeature = await prisma.feature.upsert({
      where: { key: 'support' },
      update: {},
      create: {
        name: 'Support Level',
        description: 'Level of customer support',
        key: 'support',
      },
    });

    console.log('Features created/updated');

    // Create Basic plan
    console.log('Creating Basic plan...');
    const basicPlan = await prisma.plan.upsert({
      where: { name: 'Basic' },
      update: {
        description: 'Perfect for individuals and small teams',
        planStatisticsId: basicStats.id,
      },
      create: {
        name: 'Basic',
        description: 'Perfect for individuals and small teams',
        planStatisticsId: basicStats.id,
      },
    });

    // Create or update Basic plan information
    await prisma.planInformation.upsert({
      where: { planId: basicPlan.id },
      update: {
        displayName: 'Basic',
        shortDescription: 'Essential features for individuals',
        priceDescription: 'Get Started',
        highlight: false,
        mostPopular: false,
        buttonText: 'Subscribe',
        order: 1,
        monthlyPrice: 19.99,
        annualPrice: 199.99,
        creditIncluded: 100,
      },
      create: {
        planId: basicPlan.id,
        displayName: 'Basic',
        shortDescription: 'Essential features for individuals',
        priceDescription: 'Get Started',
        highlight: false,
        mostPopular: false,
        buttonText: 'Subscribe',
        order: 1,
        monthlyPrice: 19.99,
        annualPrice: 199.99,
        creditIncluded: 100,
      },
    });

    // Create Pro plan
    console.log('Creating Pro plan...');
    const proPlan = await prisma.plan.upsert({
      where: { name: 'Pro' },
      update: {
        description: 'Ideal for growing businesses',
        planStatisticsId: proStats.id,
      },
      create: {
        name: 'Pro',
        description: 'Ideal for growing businesses',
        planStatisticsId: proStats.id,
      },
    });

    // Create or update Pro plan information
    await prisma.planInformation.upsert({
      where: { planId: proPlan.id },
      update: {
        displayName: 'Pro',
        shortDescription: 'Everything you need to scale',
        priceDescription: 'Most Popular',
        highlight: true,
        mostPopular: true,
        buttonText: 'Get Pro',
        order: 2,
        monthlyPrice: 49.99,
        annualPrice: 499.99,
        creditIncluded: 500,
      },
      create: {
        planId: proPlan.id,
        displayName: 'Pro',
        shortDescription: 'Everything you need to scale',
        priceDescription: 'Most Popular',
        highlight: true,
        mostPopular: true,
        buttonText: 'Get Pro',
        order: 2,
        monthlyPrice: 49.99,
        annualPrice: 499.99,
        creditIncluded: 500,
      },
    });

    // Create Business plan
    console.log('Creating Business plan...');
    const businessPlan = await prisma.plan.upsert({
      where: { name: 'Business' },
      update: {
        description: 'Advanced features for enterprise needs',
        planStatisticsId: businessStats.id,
      },
      create: {
        name: 'Business',
        description: 'Advanced features for enterprise needs',
        planStatisticsId: businessStats.id,
      },
    });

    // Create or update Business plan information
    await prisma.planInformation.upsert({
      where: { planId: businessPlan.id },
      update: {
        displayName: 'Business',
        shortDescription: 'Maximum productivity for teams',
        priceDescription: 'For Teams',
        highlight: false,
        mostPopular: false,
        buttonText: 'Contact Sales',
        order: 3,
        monthlyPrice: 149.99,
        annualPrice: 1499.99,
        creditIncluded: 1500,
      },
      create: {
        planId: businessPlan.id,
        displayName: 'Business',
        shortDescription: 'Maximum productivity for teams',
        priceDescription: 'For Teams',
        highlight: false,
        mostPopular: false,
        buttonText: 'Contact Sales',
        order: 3,
        monthlyPrice: 149.99,
        annualPrice: 1499.99,
        creditIncluded: 1500,
      },
    });

    console.log('Plans and plan information created/updated');

    // Add features to Basic plan
    console.log('Adding features to Basic plan...');
    await prisma.planFeature.deleteMany({ where: { planId: basicPlan.id } });
    await prisma.planFeature.createMany({
      data: [
        {
          planId: basicPlan.id,
          featureId: creditsFeature.id,
          value: '100',
        },
        {
          planId: basicPlan.id,
          featureId: brandsFeature.id,
          value: '1',
        },
        {
          planId: basicPlan.id,
          featureId: projectsFeature.id,
          value: '3',
        },
        {
          planId: basicPlan.id,
          featureId: usersFeature.id,
          value: '1',
        },
        {
          planId: basicPlan.id,
          featureId: supportFeature.id,
          value: 'Email',
        },
      ],
    });

    // Add features to Pro plan
    console.log('Adding features to Pro plan...');
    await prisma.planFeature.deleteMany({ where: { planId: proPlan.id } });
    await prisma.planFeature.createMany({
      data: [
        {
          planId: proPlan.id,
          featureId: creditsFeature.id,
          value: '500',
        },
        {
          planId: proPlan.id,
          featureId: brandsFeature.id,
          value: '3',
        },
        {
          planId: proPlan.id,
          featureId: projectsFeature.id,
          value: '10',
        },
        {
          planId: proPlan.id,
          featureId: usersFeature.id,
          value: '5',
        },
        {
          planId: proPlan.id,
          featureId: supportFeature.id,
          value: 'Priority',
        },
      ],
    });

    // Add features to Business plan
    console.log('Adding features to Business plan...');
    await prisma.planFeature.deleteMany({ where: { planId: businessPlan.id } });
    await prisma.planFeature.createMany({
      data: [
        {
          planId: businessPlan.id,
          featureId: creditsFeature.id,
          value: '1500',
        },
        {
          planId: businessPlan.id,
          featureId: brandsFeature.id,
          value: '10',
        },
        {
          planId: businessPlan.id,
          featureId: projectsFeature.id,
          value: '50',
        },
        {
          planId: businessPlan.id,
          featureId: usersFeature.id,
          value: '15',
        },
        {
          planId: businessPlan.id,
          featureId: supportFeature.id,
          value: 'Dedicated',
        },
      ],
    });

    // Add prices to Basic plan
    console.log('Adding prices to Basic plan...');
    await prisma.planPrice.deleteMany({ where: { planId: basicPlan.id } });
    await prisma.planPrice.createMany({
      data: [
        {
          planId: basicPlan.id,
          amount: 19.99,
          billingCycle: 'MONTHLY',
          credits: 100,
        },
        {
          planId: basicPlan.id,
          amount: 199.99,
          billingCycle: 'ANNUALLY',
          credits: 100,
        },
      ],
    });

    // Add prices to Pro plan
    console.log('Adding prices to Pro plan...');
    await prisma.planPrice.deleteMany({ where: { planId: proPlan.id } });
    await prisma.planPrice.createMany({
      data: [
        {
          planId: proPlan.id,
          amount: 49.99,
          billingCycle: 'MONTHLY',
          credits: 500,
        },
        {
          planId: proPlan.id,
          amount: 499.99,
          billingCycle: 'ANNUALLY',
          credits: 500,
        },
      ],
    });

    // Add prices to Business plan
    console.log('Adding prices to Business plan...');
    await prisma.planPrice.deleteMany({ where: { planId: businessPlan.id } });
    await prisma.planPrice.createMany({
      data: [
        {
          planId: businessPlan.id,
          amount: 149.99,
          billingCycle: 'MONTHLY',
          credits: 1500,
        },
        {
          planId: businessPlan.id,
          amount: 1499.99,
          billingCycle: 'ANNUALLY',
          credits: 1500,
        },
      ],
    });

    console.log('Plan features and prices updated');
    console.log('Plan seed completed successfully!');
  } catch (error) {
    console.error('Error in plan seed:', error);
    throw error;
  }
}

// Run standalone if this file is executed directly
if (require.main === module) {
  const prisma = new PrismaClient();

  seedPlans(prisma)
    .catch((e) => {
      console.error('Error in plan seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
