export interface PlanFeature {
  id: number;
  key: string;
  name: string;
  description: string;
  value: string;
  expirationPolicy: string;
}

export interface PlanPrice {
  id: string;
  amount: number;
  currency: string;
  billingCycle: string;
  credits: number;
  isActive: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  features: PlanFeature[];
  prices: PlanPrice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingPage {
  plans: Plan[];
  features: {
    id: number;
    name: string;
    description: string;
    plans: {
      planId: string;
      value: string;
    }[];
  }[];
}

// Example JSON responses
export const examplePlan: Plan = {
  id: 'plan_123',
  name: 'Professional Plan',
  description: 'Perfect for growing businesses',
  isCustom: false,
  features: [
    {
      id: 1,
      key: 'brands',
      name: 'Brand Slots',
      description: 'Number of brands you can manage',
      value: '5',
      expirationPolicy: 'END_OF_BILLING_CYCLE',
    },
    {
      id: 2,
      key: 'credits',
      name: 'Monthly Credits',
      description: 'Number of credits per month',
      value: '1000',
      expirationPolicy: 'END_OF_BILLING_CYCLE',
    },
  ],
  prices: [
    {
      id: 'price_123',
      amount: 99.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      credits: 1000,
      isActive: true,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const examplePricingPage: PricingPage = {
  plans: [examplePlan],
  features: [
    {
      id: 1,
      name: 'Brand Management',
      description: 'Manage multiple brands',
      plans: [
        {
          planId: 'plan_123',
          value: '5 brands',
        },
      ],
    },
    {
      id: 2,
      name: 'Monthly Credits',
      description: 'Credits for content creation',
      plans: [
        {
          planId: 'plan_123',
          value: '1000 credits',
        },
      ],
    },
  ],
};
