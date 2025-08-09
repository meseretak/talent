// For creating discounts
export interface CreateDiscountDto {
  code?: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'CREDIT_BONUS';
  value: number;
  appliesTo: 'PLANS' | 'SERVICES' | 'ALL';
  planIds?: string[];
  serviceTypes?: string[];
  timezone?: string;
  maxDiscount?: number;
  validFrom?: Date;
  validUntil?: Date;
  schedule?: {
    weekdays?: number[];
    hours?: number[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  maxUses?: number;
  userMaxUses?: number;
  minRequirement?: {
    minUnits?: number;
    minAmount?: number;
  };
}

// For applying discounts
export interface ApplyDiscountDto {
  code: string;
  userId: number;
  applyTo: {
    subscriptionId?: string;
    serviceId?: string;
  };
}

// For discount eligibility check
export interface DiscountEligibilityDto {
  userId: string;
  targetType: 'PLANS' | 'SERVICES';
  planId?: string;
  serviceType?: string;
  quantity?: number;
  subtotal?: number;
}

// For holiday rules
export interface HolidayRuleDto {
  holidayName: string;
  date: Date;
  isRecurring?: boolean;
  multiplier?: number;
}
