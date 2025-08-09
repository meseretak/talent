import { PlanComparison, PlanInformation, Prisma, PrismaClient } from '../../generated/prisma';
import { CreateComparisonDto, CreatePlanInformationDto } from '../../types/plan';

export class PricingService {
  constructor(private prisma: PrismaClient) {}

  async getPlanInformation(planId?: string): Promise<PlanInformation | PlanInformation[]> {
    if (planId) {
      const result = await this.prisma.planInformation.findUnique({
        where: { planId },
        include: {
          features: {
            orderBy: { order: 'asc' },
          },
          plan: true, // Include the related plan
        },
      });

      return result as PlanInformation;
    } else {
      // Get all plan information if no planId is provided
      const results = await this.prisma.planInformation.findMany({
        include: {
          features: {
            orderBy: { order: 'asc' },
          },
          plan: true, // Include the related plan
        },
        orderBy: { order: 'asc' },
      });

      return results as PlanInformation[];
    }
  }

  // Get all comparisons
  async getComparisons(): Promise<PlanComparison[]> {
    const results = await this.prisma.planComparison.findMany({
      include: {
        plans: {
          include: {
            features: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return results as PlanComparison[];
  }

  async createPlanInformation(data: CreatePlanInformationDto): Promise<PlanInformation> {
    // Validate that the plan exists before creating plan information
    const planExists = await this.prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!planExists) {
      throw new Error(`Plan with ID ${data.planId} not found`);
    }

    // Check if plan information already exists
    const existingPlanInfo = await this.prisma.planInformation.findUnique({
      where: { planId: data.planId },
    });

    if (existingPlanInfo) {
      // If exists, update it
      return this.prisma.planInformation.update({
        where: { planId: data.planId },
        data: {
          displayName: data.displayName,
          shortDescription: data.shortDescription,
          priceDescription: data.priceDescription,
          monthlyPrice: data.monthlyPrice ? new Prisma.Decimal(data.monthlyPrice.toString()) : null,
          annualPrice: data.annualPrice ? new Prisma.Decimal(data.annualPrice.toString()) : null,
          creditIncluded: data.creditIncluded,
          highlight: data.highlight || false,
          mostPopular: data.mostPopular || false,
          buttonText: data.buttonText || 'Get Started',
          order: data.order || 0,
          features: {
            // Delete existing features
            deleteMany: {},
            // Create new features
            create: data.features.map((f, index) => ({
              featureText: f.text,
              isAvailable: f.available,
              isHighlight: f.highlight || false,
              tooltip: f.tooltip,
              order: index,
            })),
          },
        },
        include: {
          features: true,
          plan: true,
        },
      });
    }

    // If doesn't exist, create new
    return this.prisma.planInformation.create({
      data: {
        planId: data.planId,
        displayName: data.displayName,
        shortDescription: data.shortDescription,
        priceDescription: data.priceDescription,
        monthlyPrice: data.monthlyPrice ? new Prisma.Decimal(data.monthlyPrice.toString()) : null,
        annualPrice: data.annualPrice ? new Prisma.Decimal(data.annualPrice.toString()) : null,
        creditIncluded: data.creditIncluded,
        highlight: data.highlight || false,
        mostPopular: data.mostPopular || false,
        buttonText: data.buttonText || 'Get Started',
        order: data.order || 0,
        features: {
          create: data.features.map((f, index) => ({
            featureText: f.text,
            isAvailable: f.available,
            isHighlight: f.highlight || false,
            tooltip: f.tooltip,
            order: index,
          })),
        },
      },
      include: {
        features: true,
        plan: true,
      },
    });
  }

  async createComparison(data: CreateComparisonDto): Promise<PlanComparison> {
    // Validate that all plan IDs exist
    const planIds = data.planIds;
    const existingPlans = await this.prisma.planInformation.findMany({
      where: {
        id: {
          in: planIds,
        },
      },
    });

    if (existingPlans.length !== planIds.length) {
      const foundIds = existingPlans.map((p) => p.id);
      const missingIds = planIds.filter((id) => !foundIds.includes(id));
      throw new Error(`The following plan IDs were not found: ${missingIds.join(', ')}`);
    }

    // Check if any of these plans are already in a comparison
    const existingComparison = await this.prisma.planComparison.findFirst({
      where: {
        plans: {
          some: {
            id: {
              in: planIds,
            },
          },
        },
      },
      include: {
        plans: true,
      },
    });

    if (existingComparison) {
      // Update existing comparison
      return this.prisma.planComparison.update({
        where: {
          id: existingComparison.id,
        },
        data: {
          title: data.title,
          description: data.description,
          featuredPlanId: data.featuredPlanId,
          plans: {
            set: planIds.map((id) => ({ id })),
          },
        },
        include: {
          plans: {
            include: {
              features: true,
            },
          },
        },
      });
    }

    // Create new comparison if none exists
    return this.prisma.planComparison.create({
      data: {
        title: data.title,
        description: data.description,
        featuredPlanId: data.featuredPlanId,
        plans: {
          connect: planIds.map((id) => ({ id })),
        },
      },
      include: {
        plans: {
          include: {
            features: true,
          },
        },
      },
    });
  }

  async getComparisonTable(comparisonId: string) {
    const comparison = await this.prisma.planComparison.findUnique({
      where: { id: comparisonId },
      include: {
        plans: {
          include: {
            features: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!comparison) return null;

    // Extract all unique features across plans
    const allFeatures = Array.from(
      new Set(comparison.plans.flatMap((p) => p.features.map((f) => f.featureText))),
    );

    return {
      id: comparison.id,
      title: comparison.title,
      description: comparison.description,
      featuredPlanId: comparison.featuredPlanId,
      features: allFeatures.map((feature) => ({
        name: feature,
        plans: comparison.plans.map((plan) => ({
          planId: plan.id,
          planName: plan.displayName,
          available: plan.features.some((f) => f.featureText === feature && f.isAvailable),
          highlight: plan.features.find((f) => f.featureText === feature)?.isHighlight || false,
        })),
      })),
    };
  }
}
