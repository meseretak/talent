// For credit values
export interface CreateCreditValueDto {
  serviceType: string;
  name: string;
  description?: string;
  baseUnit: 'SECOND' | 'MINUTE' | 'HOUR' | 'ITEM';
  creditsPerUnit: number;
  minUnits?: number;
  maxUnits?: number;
  tieredPricing?: {
    thresholds: number[];
    discounts: number[];
    tierNames?: string[];
  };
  category: string;
  isActive?: boolean;
}

export interface UpdateCreditValueDto {
  name?: string;
  description?: string;
  creditsPerUnit?: number;
  minUnits?: number;
  maxUnits?: number;
  tieredPricing?: {
    thresholds: number[];
    discounts: number[];
    tierNames?: string[];
  };
  isActive?: boolean;
}

// For credit consumption
export interface CreditConsumptionDto {
  subscriptionId: string;
  serviceId: string;
  units: number;
  description?: string;
}

// For credit balance
export interface CreditBalanceDto {
  baseCredits: number;
  baseCreditsUsed: number;
  referralCredits: number;
  referralCreditsUsed: number;
  availableCredits: number;
}

// For service cost calculation
export interface ServiceCostCalculationDto {
  serviceType: string;
  units: number;
  applyDiscounts?: boolean;
}

export interface ServiceCostResultDto {
  baseCost: number;
  discountedCost: number;
  discountPercentage: number;
  tierApplied?: string;
  unitType: string;
}
