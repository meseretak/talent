import { CreditValue, PrismaClient } from '../../generated/prisma';
import { CreateCreditValueDto, UpdateCreditValueDto } from '../../types/credit';

export class CreditValueService {
  constructor(private prisma: PrismaClient) {}

  async createCreditValue(data: CreateCreditValueDto): Promise<CreditValue> {
    return this.prisma.creditValue.create({
      data: {
        serviceType: data.serviceType,
        name: data.name,
        description: data.description,
        baseUnit: data.baseUnit,
        creditsPerUnit: data.creditsPerUnit,
        minUnits: data.minUnits || 1,
        maxUnits: data.maxUnits,
        tieredPricing: data.tieredPricing,
        category: data.category,
        isActive: data.isActive !== false,
      },
    });
  }

  async updateCreditValue(id: string, data: UpdateCreditValueDto): Promise<CreditValue> {
    return this.prisma.creditValue.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        creditsPerUnit: data.creditsPerUnit,
        minUnits: data.minUnits,
        maxUnits: data.maxUnits,
        tieredPricing: data.tieredPricing,
        isActive: data.isActive,
      },
    });
  }

  // Add the missing getCreditValue method
  async getCreditValue(serviceType: string): Promise<CreditValue | null> {
    return this.prisma.creditValue.findUnique({
      where: { serviceType },
    });
  }

  async getServiceCost(
    serviceType: string,
    units: number,
  ): Promise<{
    baseCost: number;
    discountedCost: number;
    discountPercentage: number;
    tierApplied?: string;
  }> {
    const service = await this.prisma.creditValue.findUnique({
      where: { serviceType },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    if (units < service.minUnits) {
      throw new Error(`Minimum ${service.minUnits} ${service.baseUnit}(s) required`);
    }

    if (service.maxUnits && units > service.maxUnits) {
      throw new Error(`Maximum ${service.maxUnits} ${service.baseUnit}(s) allowed`);
    }

    const baseCost = units * service.creditsPerUnit;
    let discount = 0;
    let tierApplied = '';

    // Apply tiered pricing if available
    if (service.tieredPricing) {
      const tiers = service.tieredPricing as {
        thresholds: number[];
        discounts: number[];
        tierNames?: string[];
      };

      for (let i = tiers.thresholds.length - 1; i >= 0; i--) {
        if (units >= tiers.thresholds[i]) {
          discount = tiers.discounts[i];
          tierApplied = tiers.tierNames?.[i] || `Tier ${i + 1}`;
          break;
        }
      }
    }

    return {
      baseCost,
      discountedCost: Math.ceil(baseCost * (1 - discount / 100)),
      discountPercentage: discount,
      tierApplied: tierApplied || undefined,
    };
  }

  async getAllActiveServices(): Promise<CreditValue[]> {
    return this.prisma.creditValue.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' },
    });
  }

  async getServicesByCategory(category: string): Promise<CreditValue[]> {
    return this.prisma.creditValue.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
