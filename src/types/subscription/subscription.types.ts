import { Plan } from './plan.types';

export interface CreateSubscriptionDTO {
  clientId: number;
  planId: string;
  priceId: string;
}

export interface Subscription {
  id: string;
  clientId: number;
  planId: string;
  priceId: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  plan: Plan;
  baseCreditsUsed: number;
  referralCreditsUsed: number;
  brandsUsed: number;
  customCredits?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Example JSON responses
export const exampleSubscription: Subscription = {
  id: 'sub_1234567890',
  clientId: 123,
  planId: 'plan_123',
  priceId: 'price_123',
  status: 'ACTIVE',
  currentPeriodStart: new Date('2024-03-01'),
  currentPeriodEnd: new Date('2024-04-01'),
  cancelAtPeriodEnd: false,
  plan: {
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
  },
  baseCreditsUsed: 250,
  referralCreditsUsed: 50,
  brandsUsed: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};
