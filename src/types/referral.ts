// For creating referral credits
export interface CreateReferralCreditDto {
  referrerId: string;
  referredEmail: string;
  creditAmount?: number;
  expiresInDays?: number;
  locale?: ReferralLocalization;
}

// For referral stats
export interface ReferralStatsDto {
  totalReferrals: number;
  creditEarned: number;
  referralCode: string;
  pendingReferrals?: number;
}

// For referral program settings
export interface ReferralProgramSettingsDto {
  creditPerReferral: number;
  expirationDays: number;
  minPurchaseRequired: boolean;
  bonusOnFirstPurchase: number;
}

export interface ReferralSettingsDto {
  creditPerReferral: number;
  expirationDays: number;
}

// Enhanced interfaces for worldwide implementation
export interface ReferralLocalization {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

export interface ReferralData {
  ipAddress: string;
  userAgent?: string;
  location?: string;
  timestamp: Date;
  referringUserId: string;
}

export interface FraudScore {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  indicators: string[];
}

export interface ComplianceResult {
  isAllowed: boolean;
  restrictions: string[];
  requiredDisclosures: string[];
  maxRewardAmount?: number;
}

export interface ReferralAnalyticsDto {
  referralId: number;
  conversionRate?: number;
  averageSpend?: number;
  retentionRate?: number;
  campaignSource?: string;
  deviceBreakdown?: any;
  locationData?: any;
  timeToConversion?: number;
}

export interface GenerateReferralLinkDto {
  userId: number;
  baseUrl: string;
  locale?: ReferralLocalization;
}

export interface TrackReferralClickDto {
  referralCode: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
}

export interface CompleteReferralDto {
  referralLink: string;
  newClientId: number;
}
