import { stripe } from '../../config/stripe';
import { BillingCycle, PlanPrice, PrismaClient } from '../../generated/prisma';
import ApiError from '../../utils/ApiError';

const prisma = new PrismaClient();

export class StripePlanService {
  private prisma: typeof prisma;

  constructor(prismaClient: typeof prisma) {
    this.prisma = prismaClient;
  }

  /**
   * Create a Stripe product for a plan
   * @param planData Plan data from our database
   * @returns The created Stripe product
   */
  async createStripeProduct(planData: any) {
    try {
      // Check if a product with this plan ID already exists
      const existingProducts = await stripe.products.list({
        limit: 100,
        active: true,
      });

      const existingProduct = existingProducts.data.find(
        (product) => product.metadata.planId === planData.id,
      );

      // If product exists, return it
      if (existingProduct) {
        return existingProduct;
      }

      // Create new product
      const product = await stripe.products.create({
        name: planData.name,
        description: planData.description || undefined,
        active: true,
        metadata: {
          planId: planData.id,
        },
      });

      return product;
    } catch (error) {
      console.error('Error creating Stripe product:', error);
      throw new ApiError(
        500,
        `Failed to create Stripe product: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Create a Stripe price for a plan price
   * @param planPrice The plan price from our database
   * @param productId The Stripe product ID
   * @returns The created Stripe price
   */
  async createStripePrice(planPrice: PlanPrice, productId: string) {
    try {
      // Check if price already exists by checking metadata
      const existingPrices = await stripe.prices.list({
        product: productId,
        active: true,
      });

      const existingPrice = existingPrices.data.find(
        (price) => price.metadata.planPriceId === planPrice.id,
      );

      // If price exists, return it
      if (existingPrice) {
        return existingPrice;
      }

      // Convert billing cycle to Stripe interval
      const interval = this.getBillingCycleInterval(planPrice.billingCycle);

      // Create price in Stripe
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(Number(planPrice.amount) * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: interval.interval,
          interval_count: interval.intervalCount,
        },
        metadata: {
          planPriceId: planPrice.id,
        },
      });

      return price;
    } catch (error) {
      console.error('Error creating Stripe price:', error);
      throw new ApiError(
        500,
        `Failed to create Stripe price: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Convert our billing cycle to Stripe interval format
   * @param billingCycle The billing cycle from our system
   * @returns Stripe interval configuration
   */
  private getBillingCycleInterval(billingCycle: BillingCycle): {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
  } {
    switch (billingCycle) {
      case 'MONTHLY':
        return { interval: 'month', intervalCount: 1 };
      case 'ANNUALLY':
        return { interval: 'year', intervalCount: 1 };
      default:
        return { interval: 'month', intervalCount: 1 };
    }
  }

  /**
   * Synchronize a plan with Stripe
   * @param planId The ID of the plan to synchronize
   * @returns The Stripe product and prices
   */
  async syncPlanWithStripe(planId: string) {
    try {
      // Get plan data with prices
      const plan = await this.prisma.plan.findUnique({
        where: { id: planId },
        include: {
          prices: true,
          information: true,
        },
      });

      if (!plan) {
        throw new ApiError(404, `Plan with ID ${planId} not found`);
      }

      // Create or retrieve Stripe product
      const product = await this.createStripeProduct(plan);

      // Create or retrieve Stripe prices for all plan prices
      const stripePrices = await Promise.all(
        plan.prices.map(async (price) => {
          return await this.createStripePrice(price, product.id);
        }),
      );

      // Return synchronized data
      return {
        product,
        prices: stripePrices,
      };
    } catch (error) {
      console.error('Error syncing plan with Stripe:', error);
      throw new ApiError(
        500,
        `Failed to sync plan with Stripe: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Get a list of all Stripe products linked to our plans
   * @returns List of Stripe products
   */
  async listStripeProducts() {
    try {
      const products = await stripe.products.list({
        limit: 100,
        active: true,
      });
      return products.data;
    } catch (error) {
      console.error('Error listing Stripe products:', error);
      throw new ApiError(
        500,
        `Failed to list Stripe products: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Synchronize all active plans with Stripe
   * @returns Number of plans synchronized
   */
  async syncAllPlansWithStripe() {
    try {
      // Get all active plans
      const plans = await this.prisma.plan.findMany({
        include: {
          prices: true,
        },
      });

      // Sync each plan
      const results = await Promise.all(
        plans.map(async (plan) => {
          return await this.syncPlanWithStripe(plan.id);
        }),
      );

      return {
        count: results.length,
        results,
      };
    } catch (error) {
      console.error('Error syncing all plans with Stripe:', error);
      throw new ApiError(
        500,
        `Failed to sync all plans with Stripe: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Retrieve Stripe product by planId from metadata
   * @param planId The plan ID to look for
   * @returns The Stripe product if found
   */
  async getStripeProductByPlanId(planId: string) {
    try {
      const products = await stripe.products.list({
        limit: 100,
        active: true,
      });

      const product = products.data.find((p) => p.metadata.planId === planId);

      if (!product) {
        return null;
      }

      return product;
    } catch (error) {
      console.error('Error getting Stripe product by plan ID:', error);
      throw new ApiError(
        500,
        `Failed to get Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Retrieve a Stripe price by planPriceId from metadata
   * @param planPriceId The plan price ID to look for
   * @returns The Stripe price if found
   */
  async getStripePriceByPlanPriceId(planPriceId: string) {
    try {
      const prices = await stripe.prices.list({
        limit: 100,
        active: true,
      });

      const price = prices.data.find((p) => p.metadata.planPriceId === planPriceId);

      if (!price) {
        return null;
      }

      return price;
    } catch (error) {
      console.error('Error getting Stripe price by plan price ID:', error);
      throw new ApiError(
        500,
        `Failed to get Stripe price: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Update a Stripe product
   * @param productId The Stripe product ID
   * @param updateData The data to update
   * @returns The updated product
   */
  async updateStripeProduct(
    productId: string,
    updateData: { name?: string; description?: string; active?: boolean },
  ) {
    try {
      const product = await stripe.products.update(productId, updateData);
      return product;
    } catch (error) {
      console.error('Error updating Stripe product:', error);
      throw new ApiError(
        500,
        `Failed to update Stripe product: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Archive a price in Stripe
   * @param priceId The Stripe price ID to archive
   * @returns The archived price
   */
  async archiveStripePrice(priceId: string) {
    try {
      const price = await stripe.prices.update(priceId, {
        active: false,
      });
      return price;
    } catch (error) {
      console.error('Error archiving Stripe price:', error);
      throw new ApiError(
        500,
        `Failed to archive Stripe price: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}

export default new StripePlanService(prisma);
