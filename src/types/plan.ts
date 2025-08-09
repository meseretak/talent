// For creating plan information
export interface CreatePlanInformationDto {
  planId: string;
  displayName: string;
  shortDescription: string;
  priceDescription: string;
  monthlyPrice?: number;
  annualPrice?: number;
  creditIncluded?: number;
  highlight?: boolean;
  mostPopular?: boolean;
  buttonText?: string;
  order?: number;
  features: PlanFeatureDisplayDto[];
}

export interface PlanFeatureDisplayDto {
  text: string;
  available: boolean;
  highlight?: boolean;
  tooltip?: string;
}

// For creating comparisons
export interface CreateComparisonDto {
  title: string;
  description?: string;
  planIds: string[];
  featuredPlanId?: string;
}

// For pricing page responses
export interface PricingPageResponseDto {
  plans: PricingPlanDto[];
  comparisons: ComparisonTableDto[];
}

export interface PricingPlanDto {
  id: string;
  name: string;
  price: string;
  description: string;
  isPopular: boolean;
  features: {
    text: string;
    available: boolean;
    tooltip?: string;
  }[];
}

export interface ComparisonTableDto {
  id: string;
  title: string;
  description?: string;
  featuredPlanId?: string;
  features: {
    name: string;
    plans: {
      planId: string;
      available: boolean;
      highlight: boolean;
    }[];
  }[];
}

// Extended Plan interface with features and prices
export interface PlanWithDetails {
  id: string;
  name: string;
  description: string | null;
  isCustom: boolean;
  planStatisticsId: number;
  createdAt: Date;
  updatedAt: Date;
  features: {
    feature: {
      name: string;
      description: string;
    };
    value: string;
  }[];
  prices: {
    id: string;
    credits?: number | null;
    amount: any; // Use appropriate type for Decimal
    billingCycle: string;
    isActive: boolean;
  }[];
}

// Define the missing interfaces based on your Prisma schema
export interface PlanResponseDto {
  id: string;
  name: string;
  description: string;
  features: {
    name: string;
    value: string;
    description: string;
  }[];
  prices: any[];
}

// Define interfaces for the plan information and comparison
export interface PlanInformation {
  id: string;
  planId: string;
  displayName: string;
  shortDescription: string;
  priceDescription: string;
  monthlyPrice?: number;
  annualPrice?: number;
  creditIncluded?: number;
  highlight?: boolean;
  mostPopular?: boolean;
  buttonText?: string;
  order?: number;
  features: {
    id: string;
    featureText: string;
    isAvailable: boolean;
    isHighlight?: boolean;
    tooltip?: string;
    order: number;
  }[];
}

export interface PlanComparison {
  id: string;
  title: string;
  description?: string;
  featuredPlanId?: string;
  plans: PlanInformation[];
}
