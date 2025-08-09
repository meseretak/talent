import { Decimal } from '@prisma/client/runtime/library';
import {
  BillingCycle,
  CreditType,
  DiscountTarget,
  DiscountType,
  ReferralCreditStatus,
  SubscriptionStatus,
  TransactionType,
} from '../generated/prisma';
import { Client } from './client';

// Subscription interface
export interface Subscription {
  id: string;
  clientId: number;
  planId: string;
  priceId?: string;
  customCredits?: number;
  status: SubscriptionStatus;
  invoiceId?: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  baseCreditsUsed: number;
  referralCreditsUsed: number;
  brandsUsed: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  client?: Client; // Client interface
  plan?: Plan;
  price?: PlanPrice;
  invoice?: Invoice[];
  paymentTransactions?: PaymentTransaction[];
  billingHistory?: BillingHistory[];
  creditConsumptions?: CreditConsumption[];
  referralCredits?: ReferralCredit[];
  brandConsumptions?: BrandConsumption[];
  creditTransactions?: CreditTransaction[];
  discountRedemptions?: DiscountRedemption[];
  subscriptionHistory?: SubscriptionHistory[];
}

// Plan interface
export interface Plan {
  id: string;
  name: string;
  description?: string;
  isCustom: boolean;
  planStatisticsId: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  features?: PlanFeature[];
  prices?: PlanPrice[];
  subscriptions?: Subscription[];
  information?: PlanInformation;
  planStatistics?: PlanStatistics;
}

// PlanFeature interface
export interface PlanFeature {
  id: string;
  planId: string;
  featureId: string;
  value: string;
  expirationPolicy: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  plan?: Plan;
  feature?: Feature;
}

// Feature interface
export interface Feature {
  id: string;
  name: string;
  description: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  planFeatures?: PlanFeature[];
}

// PlanPrice interface
export interface PlanPrice {
  id: string;
  planId: string;
  credits?: number;
  amount: Decimal;
  billingCycle: BillingCycle;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  plan?: Plan;
  subscriptions?: Subscription[];
}

// CreditValue interface
export interface CreditValue {
  id: string;
  serviceType: string;
  name: string;
  description?: string;
  baseUnit: string;
  creditsPerUnit: number;
  minUnits: number;
  maxUnits?: number;
  tieredPricing?: any;
  isActive: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  consumptions?: CreditConsumption[];
  discountRedemptions?: DiscountRedemption[];
}

// CreditConsumption interface
export interface CreditConsumption {
  id: string;
  subscriptionId: string;
  serviceId?: string;
  units: number;
  unitType: string;
  creditRate: number;
  totalCredits: number;
  discountApplied: number;
  creditType: CreditType;
  referralCreditId?: string;
  description?: string;
  createdAt: Date;

  // Relations
  subscription?: Subscription;
  service?: CreditValue;
  referralCredit?: ReferralCredit;
}

// ReferralCredit interface
export interface ReferralCredit {
  id: string;
  subscriptionId: string;
  creditAmount: number;
  referralDate: Date;
  expiresAt: Date;
  referredUserEmail?: string;
  status: ReferralCreditStatus;
  consumedInId?: string;

  // Relations
  subscription?: Subscription;
  consumedIn?: CreditConsumption;
}

// BrandConsumption interface
export interface BrandConsumption {
  id: string;
  subscriptionId: string;
  brandId: string;
  action: string;
  expiresAt: Date;
  createdAt: Date;

  // Relations
  subscription?: Subscription;
}

// Discount interface
export interface Discount {
  id: string;
  code?: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: Decimal;
  maxDiscount?: Decimal;
  minRequirement?: any;
  appliesTo: DiscountTarget;
  planIds: string[];
  serviceTypes: string[];
  validFrom?: Date;
  validUntil?: Date;
  schedule?: any;
  timezone?: string;
  maxUses?: number;
  userMaxUses?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  redemptions?: DiscountRedemption[];
  holidayRules?: HolidayDiscountRule[];
}

// HolidayDiscountRule interface
export interface HolidayDiscountRule {
  id: string;
  discountId: string;
  holidayName: string;
  date: Date;
  isRecurring: boolean;
  multiplier: Decimal;
  createdAt: Date;

  // Relations
  discount?: Discount;
}

// DiscountRedemption interface
export interface DiscountRedemption {
  id: string;
  discountId: string;
  subscriptionId: string;
  clientId: number;
  appliedTo: string;
  appliedAmount: Decimal;
  creditValueId?: string;
  createdAt: Date;

  // Relations
  discount?: Discount;
  subscription?: Subscription;
  client?: Client; // Client interface
  creditValue?: CreditValue;
}

// PlanInformation interface
export interface PlanInformation {
  id: string;
  planId: string;
  displayName: string;
  shortDescription: string;
  priceDescription: string;
  highlight: boolean;
  mostPopular: boolean;
  buttonText: string;
  order: number;
  monthlyPrice?: Decimal;
  annualPrice?: Decimal;
  creditIncluded?: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  plan?: Plan;
  features?: PlanFeatureDisplay[];
  comparisons?: PlanComparison[];
}

// PlanFeatureDisplay interface
export interface PlanFeatureDisplay {
  id: string;
  planInfoId: string;
  featureText: string;
  isAvailable: boolean;
  isHighlight: boolean;
  tooltip?: string;
  order: number;
  createdAt: Date;

  // Relations
  planInformation?: PlanInformation;
}

// PlanComparison interface
export interface PlanComparison {
  id: string;
  title: string;
  description?: string;
  featuredPlanId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  plans?: PlanInformation[];
}

// Referral interface
export interface Referral {
  id: number;
  referringClientId: number;
  referredClientId: number;
  referredIp?: string;
  referredUserAgent?: string;
  referredLocation?: string;
  referralDate: Date;
  status: string;
  discountCredits: number;
  discountApplied: boolean;
  expiryDate: Date;
  notes?: string;
  referralLink: string;
  couponCode: string;
  linkClicks: number;
  signups: number;
  activeUsers: number;
  rewardsEarned: Decimal;
  lastClickedAt?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  referringClient?: any; // Client interface
  referredClient?: any; // Client interface
  clicks?: ReferralClick[];
  creditTransactions?: CreditTransaction[];
  referralAnalytics?: ReferralAnalytics[];
}

// ReferralClick interface
export interface ReferralClick {
  id: number;
  referralId: number;
  clickedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  converted: boolean;

  // Relations
  referral?: Referral;
}

// ReferralAnalytics interface
export interface ReferralAnalytics {
  id: string;
  referralId: number;
  conversionRate?: number;
  averageSpend?: number;
  retentionRate?: number;
  campaignSource?: string;
  deviceBreakdown?: any;
  locationData?: any;
  timeToConversion?: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  referral?: Referral;
}

// PlanStatistics interface
export interface PlanStatistics {
  id: number;
  totalProjects: number;
  totalClients: number;
  totalEarnings: number;

  // Relations
  plans?: Plan[];
}

// CreditTransaction interface
export interface CreditTransaction {
  id: string;
  clientId: number;
  type: TransactionType;
  amount: number;
  remaining: number;
  expirationDate?: Date;
  description?: string;
  subscriptionId?: string;
  referralId?: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  client?: Client; // Client interface
  subscription?: Subscription;
  referral?: Referral;
}

// CreditUsageAnalytics interface
export interface CreditUsageAnalytics {
  id: string;
  clientId: number;
  period: string;
  totalUsed: number;
  byServiceType: any;
  peakUsageDays?: any;
  unusualActivity: boolean;
  createdAt: Date;

  // Relations
  client?: Client; // Client interface
}

// CustomPlanRequest interface
export interface CustomPlanRequest {
  id: string;
  clientId: number;
  requestedCredits: number;
  requestedBrands: number;
  durationMonths: number;
  status: string;
  stripePaymentLink?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  client?: Client; // Client interface
}

// SubscriptionHistory interface
export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  planId: string;
  priceId?: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  reason?: string;
  createdAt: Date;

  // Relations
  subscription?: Subscription;
}

// Placeholder interfaces for related models not defined in the provided schema
export interface Invoice {
  id: number;
  // Add relevant fields
}

export interface PaymentTransaction {
  id: number;
  // Add relevant fields
}

export interface BillingHistory {
  id: number;
  // Add relevant fields
}

// Keep existing DTOs
export interface CreateSubscriptionDto {
  userId: number;
  planId: string;
  priceId?: string;
  customCredits?: number;
  status?: 'ACTIVE' | 'TRIALING';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  billingCycle?: 'MONTHLY' | 'ANNUALLY';
}

export interface UpdateSubscriptionDto {
  status?: 'ACTIVE' | 'CANCELED' | 'PAUSED';
  customCredits?: number;
  currentPeriodEnd?: Date;
}

export interface SubscriptionResponseDto {
  id: string;
  status: string;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  creditUsage: {
    allocated: number;
    used: number;
    remaining: number;
  };
  brandUsage: {
    used: number;
  };
  plan: PlanResponseDto;
}

export interface PlanResponseDto {
  id: string;
  name: string;
  description: string;
  features: PlanFeatureDto[];
  prices: PlanPriceDto[];
}

export interface PlanFeatureDto {
  name: string;
  value: string;
  description: string;
}

export interface PlanPriceDto {
  id: string;
  amount: number;
  credits: number;
  billingCycle: 'MONTHLY' | 'ANNUALLY';
}
