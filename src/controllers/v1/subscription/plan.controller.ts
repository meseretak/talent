import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import stripePlanService from '../../../services/subscription/stripe-plan.service';
import ApiError from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/async-handler';

const prisma = new PrismaClient();

export class PlanController {
  static async getAvailablePlans(req: Request, res: Response) {
    try {
      const plans = await prisma.plan.findMany({
        include: {
          features: {
            include: { feature: true },
          },
          prices: true,
          information: true,
        },
        where: {
          isCustom: false,
        },
      });

      res.json(plans);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getPricingPage(req: Request, res: Response) {
    try {
      const plans = await prisma.plan.findMany({
        include: {
          features: {
            include: { feature: true },
          },
          prices: true,
          information: {
            include: { features: true },
          },
        },
        where: {
          isCustom: false,
        },
        orderBy: {
          information: {
            order: 'asc',
          },
        },
      });

      res.json(plans);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getPlanById(req: Request, res: Response) {
    try {
      const { planId } = req.params;

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          features: {
            include: { feature: true },
          },
          prices: true,
          information: true,
        },
      });

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.json(plan);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getPlanFeatures(req: Request, res: Response) {
    try {
      const { planId } = req.params;

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      // Get plan with features explicitly included
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          features: {
            include: { feature: true },
          },
        },
      });

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.json(plan.features || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getPlanPrices(req: Request, res: Response) {
    try {
      const { planId } = req.params;

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      // Get plan with prices explicitly included
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          prices: true,
        },
      });

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.json(plan.prices || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}

/**
 * Create a new plan in the database and sync it with Stripe
 */
export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, features, prices, isCustom = false } = req.body;

  if (!name || !features || !prices || prices.length === 0) {
    throw new ApiError(400, 'Name, features, and at least one price are required');
  }

  // First, create a plan statistics record
  const planStatistics = await prisma.planStatistics.create({
    data: {
      totalProjects: 0,
      totalClients: 0,
      totalEarnings: 0,
    },
  });

  // Create the plan
  const plan = await prisma.plan.create({
    data: {
      name,
      description,
      isCustom,
      planStatisticsId: planStatistics.id,
    },
  });

  // Create plan features
  for (const feature of features) {
    // Check if the feature exists, create it if it doesn't
    let featureRecord = await prisma.feature.findUnique({
      where: { key: feature.key },
    });

    if (!featureRecord) {
      featureRecord = await prisma.feature.create({
        data: {
          name: feature.name,
          description: feature.description || feature.name,
          key: feature.key,
        },
      });
    }

    // Create plan feature
    await prisma.planFeature.create({
      data: {
        planId: plan.id,
        featureId: featureRecord.id,
        value: feature.value.toString(),
        expirationPolicy: feature.expirationPolicy || 'END_OF_BILLING_CYCLE',
      },
    });
  }

  // Create plan prices
  for (const price of prices) {
    await prisma.planPrice.create({
      data: {
        planId: plan.id,
        credits: price.credits || null,
        amount: price.amount,
        billingCycle: price.billingCycle,
        isActive: price.isActive !== false, // Default to true if not specified
      },
    });
  }

  // Create plan information if provided
  if (req.body.information) {
    await prisma.planInformation.create({
      data: {
        planId: plan.id,
        displayName: req.body.information.displayName || plan.name,
        shortDescription: req.body.information.shortDescription || '',
        priceDescription: req.body.information.priceDescription || '',
        highlight: req.body.information.highlight || false,
        mostPopular: req.body.information.mostPopular || false,
        buttonText: req.body.information.buttonText || 'Subscribe',
        order: req.body.information.order || 0,
        monthlyPrice: req.body.information.monthlyPrice,
        annualPrice: req.body.information.annualPrice,
        creditIncluded: req.body.information.creditIncluded,
      },
    });
  }

  // Sync with Stripe
  const stripeData = await stripePlanService.syncPlanWithStripe(plan.id);

  // Return the created plan with features, prices, and Stripe data
  const createdPlan = await prisma.plan.findUnique({
    where: { id: plan.id },
    include: {
      features: {
        include: {
          feature: true,
        },
      },
      prices: true,
      information: true,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      plan: createdPlan,
      stripe: stripeData,
    },
  });
});

/**
 * Get all plans
 */
export const getPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await prisma.plan.findMany({
    include: {
      features: {
        include: {
          feature: true,
        },
      },
      prices: true,
      information: true,
    },
  });

  res.status(200).json({
    success: true,
    data: plans,
  });
});

/**
 * Get a plan by ID
 */
export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      features: {
        include: {
          feature: true,
        },
      },
      prices: true,
      information: true,
    },
  });

  if (!plan) {
    throw new ApiError(404, `Plan with ID ${id} not found`);
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

/**
 * Update a plan
 */
export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, isCustom } = req.body;

  // Check if plan exists
  const existingPlan = await prisma.plan.findUnique({
    where: { id },
  });

  if (!existingPlan) {
    throw new ApiError(404, `Plan with ID ${id} not found`);
  }

  // Update plan
  const updatedPlan = await prisma.plan.update({
    where: { id },
    data: {
      name: name !== undefined ? name : undefined,
      description: description !== undefined ? description : undefined,
      isCustom: isCustom !== undefined ? isCustom : undefined,
    },
  });

  // Update features if provided
  if (req.body.features) {
    // Delete existing features
    await prisma.planFeature.deleteMany({
      where: { planId: id },
    });

    // Create new features
    for (const feature of req.body.features) {
      // Check if feature exists
      let featureRecord = await prisma.feature.findUnique({
        where: { key: feature.key },
      });

      if (!featureRecord) {
        featureRecord = await prisma.feature.create({
          data: {
            name: feature.name,
            description: feature.description || feature.name,
            key: feature.key,
          },
        });
      }

      // Create plan feature
      await prisma.planFeature.create({
        data: {
          planId: id,
          featureId: featureRecord.id,
          value: feature.value.toString(),
          expirationPolicy: feature.expirationPolicy || 'END_OF_BILLING_CYCLE',
        },
      });
    }
  }

  // Update prices if provided
  if (req.body.prices) {
    // Archive existing prices in Stripe
    const existingPrices = await prisma.planPrice.findMany({
      where: { planId: id },
    });

    // Get Stripe product
    const stripeProduct = await stripePlanService.getStripeProductByPlanId(id);

    if (stripeProduct) {
      // Archive each price in Stripe
      for (const price of existingPrices) {
        const stripePrice = await stripePlanService.getStripePriceByPlanPriceId(price.id);
        if (stripePrice) {
          await stripePlanService.archiveStripePrice(stripePrice.id);
        }
      }
    }

    // Delete existing prices from database
    await prisma.planPrice.deleteMany({
      where: { planId: id },
    });

    // Create new prices
    for (const price of req.body.prices) {
      await prisma.planPrice.create({
        data: {
          planId: id,
          credits: price.credits || null,
          amount: price.amount,
          billingCycle: price.billingCycle,
          isActive: price.isActive !== false, // Default to true if not specified
        },
      });
    }
  }

  // Update plan information if provided
  if (req.body.information) {
    // Check if information exists
    const existingInfo = await prisma.planInformation.findFirst({
      where: { planId: id },
    });

    if (existingInfo) {
      // Update existing information
      await prisma.planInformation.update({
        where: { id: existingInfo.id },
        data: {
          displayName:
            req.body.information.displayName !== undefined
              ? req.body.information.displayName
              : undefined,
          shortDescription:
            req.body.information.shortDescription !== undefined
              ? req.body.information.shortDescription
              : undefined,
          priceDescription:
            req.body.information.priceDescription !== undefined
              ? req.body.information.priceDescription
              : undefined,
          highlight:
            req.body.information.highlight !== undefined
              ? req.body.information.highlight
              : undefined,
          mostPopular:
            req.body.information.mostPopular !== undefined
              ? req.body.information.mostPopular
              : undefined,
          buttonText:
            req.body.information.buttonText !== undefined
              ? req.body.information.buttonText
              : undefined,
          order: req.body.information.order !== undefined ? req.body.information.order : undefined,
          monthlyPrice:
            req.body.information.monthlyPrice !== undefined
              ? req.body.information.monthlyPrice
              : undefined,
          annualPrice:
            req.body.information.annualPrice !== undefined
              ? req.body.information.annualPrice
              : undefined,
          creditIncluded:
            req.body.information.creditIncluded !== undefined
              ? req.body.information.creditIncluded
              : undefined,
        },
      });
    } else {
      // Create new information
      await prisma.planInformation.create({
        data: {
          planId: id,
          displayName: req.body.information.displayName || 'Plan',
          shortDescription: req.body.information.shortDescription || '',
          priceDescription: req.body.information.priceDescription || '',
          highlight: req.body.information.highlight || false,
          mostPopular: req.body.information.mostPopular || false,
          buttonText: req.body.information.buttonText || 'Subscribe',
          order: req.body.information.order || 0,
          monthlyPrice: req.body.information.monthlyPrice,
          annualPrice: req.body.information.annualPrice,
          creditIncluded: req.body.information.creditIncluded,
        },
      });
    }
  }

  // Sync with Stripe
  const stripeData = await stripePlanService.syncPlanWithStripe(id);

  // Return the updated plan with features, prices, and Stripe data
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      features: {
        include: {
          feature: true,
        },
      },
      prices: true,
      information: true,
    },
  });

  res.status(200).json({
    success: true,
    data: {
      plan,
      stripe: stripeData,
    },
  });
});

/**
 * Delete a plan
 */
export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if plan exists
  const existingPlan = await prisma.plan.findUnique({
    where: { id },
  });

  if (!existingPlan) {
    throw new ApiError(404, `Plan with ID ${id} not found`);
  }

  // Check if plan is used in any subscriptions
  const subscriptionsWithPlan = await prisma.subscription.findMany({
    where: { planId: id },
  });

  if (subscriptionsWithPlan.length > 0) {
    throw new ApiError(400, 'Cannot delete plan that is used in active subscriptions');
  }

  // Get Stripe product
  const stripeProduct = await stripePlanService.getStripeProductByPlanId(id);

  // Delete associated records
  await prisma.planFeature.deleteMany({
    where: { planId: id },
  });

  await prisma.planPrice.deleteMany({
    where: { planId: id },
  });

  // Delete PlanFeatureDisplay records first
  await prisma.planFeatureDisplay.deleteMany({
    where: {
      planInfoId: {
        in: (
          await prisma.planInformation.findMany({ where: { planId: id }, select: { id: true } })
        ).map((info) => info.id),
      },
    },
  });

  await prisma.planInformation.deleteMany({
    where: { planId: id },
  });

  // Update Stripe product to inactive if it exists
  if (stripeProduct) {
    await stripePlanService.updateStripeProduct(stripeProduct.id, { active: false });
  }

  // Delete the plan
  await prisma.plan.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Plan deleted successfully',
  });
});

/**
 * Sync a plan with Stripe
 */
export const syncPlanWithStripe = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await stripePlanService.syncPlanWithStripe(id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Sync all plans with Stripe
 */
export const syncAllPlansWithStripe = asyncHandler(async (_req: Request, res: Response) => {
  const result = await stripePlanService.syncAllPlansWithStripe();

  res.status(200).json({
    success: true,
    data: result,
  });
});
