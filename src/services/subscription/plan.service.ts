import { Plan, PrismaClient } from '../../generated/prisma';
import {
  PlanComparison,
  PlanInformation,
  PlanResponseDto,
  PricingPageResponseDto,
} from '../../types/plan';

export class PlanService {
  constructor(private prisma: PrismaClient) {}

  async getAvailablePlans(): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      include: {
        prices: true,
        features: {
          include: {
            feature: true,
          },
        },
        information: true,
      },
    });
  }

  // Add caching for plan data
  private planCache: Map<string, {data: Plan, timestamp: number}> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  async getPlanById(planId: string): Promise<Plan | null> {
    // Check cache first
    const cached = this.planCache.get(planId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }
    
    // Fetch from database if not in cache or expired
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        prices: true,
        features: {
          include: {
            feature: true,
          },
        },
      },
    });
    
    // Update cache
    if (plan) {
      this.planCache.set(planId, {data: plan, timestamp: now});
    }
    
    return plan;
  }

  async getFormattedAvailablePlans(): Promise<PlanResponseDto[]> {
    const plans = await this.getAvailablePlans();

    return plans.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      features:
        plan.features?.map((f: any) => ({
          name: f.feature.name,
          value: f.value,
          description: f.feature.description,
        })) || [],
      prices: plan.prices || [],
    }));
  }

  async getPricingPageData(pricingService: any): Promise<PricingPageResponseDto> {
    // Use the passed pricing service instead of accessing services directly
    const planInfosRaw = (await pricingService.getPlanInformation()) as unknown;
    const planInfos = Array.isArray(planInfosRaw)
      ? (planInfosRaw as PlanInformation[])
      : ([planInfosRaw] as PlanInformation[]);

    const comparisonsRaw = (await pricingService.getComparisons()) as unknown;
    const comparisons = Array.isArray(comparisonsRaw)
      ? (comparisonsRaw as PlanComparison[])
      : ([comparisonsRaw] as PlanComparison[]);

    // Process comparisons to match the expected format
    const processedComparisons = comparisons.map((comp: PlanComparison) => {
      // Extract all unique features across plans
      const allFeatures = Array.from(
        new Set(
          comp.plans?.flatMap(
            (p: PlanInformation) => p.features?.map((f: any) => f.featureText) || [],
          ) || [],
        ),
      );

      return {
        id: comp.id,
        title: comp.title,
        description: comp.description || undefined,
        featuredPlanId: comp.featuredPlanId || undefined,
        features: allFeatures.map((feature: string) => ({
          name: feature,
          plans: comp.plans.map((plan: PlanInformation) => ({
            planId: plan.planId,
            available: plan.features.some((f: any) => f.featureText === feature && f.isAvailable),
            highlight:
              plan.features.find((f: any) => f.featureText === feature)?.isHighlight || false,
          })),
        })),
      };
    });

    return {
      plans: planInfos.map((plan: PlanInformation) => ({
        id: plan.planId,
        name: plan.displayName,
        price: plan.priceDescription,
        description: plan.shortDescription,
        isPopular: plan.mostPopular || false,
        features: plan.features.map((f: any) => ({
          text: f.featureText,
          available: f.isAvailable,
          tooltip: f.tooltip || undefined,
        })),
      })),
      comparisons: processedComparisons,
    };
  }

  // Add these methods to your PlanService class

  async getPlanWithFeatures(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });
  }

  async getPlanWithPrices(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        prices: true,
      },
    });
  }
}
