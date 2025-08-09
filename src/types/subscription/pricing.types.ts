export interface PlanInformation {
  id: number;
  planId: string;
  title: string;
  description: string;
  features: {
    id: number;
    name: string;
    description: string;
    value: string;
  }[];
  pricing: {
    id: number;
    amount: number;
    currency: string;
    billingCycle: string;
    credits: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonTable {
  id: number;
  title: string;
  description: string;
  features: {
    id: number;
    name: string;
    description: string;
    plans: {
      planId: string;
      value: string;
      included: boolean;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlanInformationDTO {
  planId: string;
  title: string;
  description: string;
  features: {
    name: string;
    description: string;
    value: string;
  }[];
  pricing: {
    amount: number;
    currency: string;
    billingCycle: string;
    credits: number;
  }[];
}

export interface CreateComparisonDTO {
  title: string;
  description: string;
  features: {
    name: string;
    description: string;
    plans: {
      planId: string;
      value: string;
      included: boolean;
    }[];
  }[];
}

// Example JSON responses
export const examplePlanInformation: PlanInformation = {
  id: 1,
  planId: 'plan_123',
  title: 'Professional Plan Details',
  description: 'Comprehensive plan for professional users',
  features: [
    {
      id: 1,
      name: 'Brand Management',
      description: 'Manage multiple brands',
      value: '5 brands',
    },
    {
      id: 2,
      name: 'Monthly Credits',
      description: 'Credits for content creation',
      value: '1000 credits',
    },
  ],
  pricing: [
    {
      id: 1,
      amount: 99.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      credits: 1000,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const exampleComparisonTable: ComparisonTable = {
  id: 1,
  title: 'Plan Comparison',
  description: 'Compare our different plans',
  features: [
    {
      id: 1,
      name: 'Brand Management',
      description: 'Number of brands you can manage',
      plans: [
        {
          planId: 'plan_123',
          value: '5 brands',
          included: true,
        },
        {
          planId: 'plan_456',
          value: '10 brands',
          included: true,
        },
      ],
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};
