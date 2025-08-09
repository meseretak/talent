import { PaymentStatusType, TransactionType } from '../../generated/prisma';

export interface CreateCheckoutSessionDTO {
  planId: string;
  clientId: number;
}

export interface CreateCustomPlanCheckoutDTO {
  requestId: string;
}

export interface CreatePortalSessionDTO {
  clientId: number;
}

export interface RefundPaymentDTO {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface UpdatePaymentMethodDTO {
  clientId: number;
  paymentMethodId: string;
}

export interface PaymentTransactionResponse {
  id: number;
  clientId: number;
  amount: number;
  currency: string;
  type: TransactionType;
  status: PaymentStatusType;
  paymentMethod: string;
  paymentReference: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceResponse {
  id: number;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: Date;
  paidAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Example JSON responses
export const examplePaymentTransaction: PaymentTransactionResponse = {
  id: 1,
  clientId: 123,
  amount: 99.99,
  currency: 'USD',
  type: 'SUBSCRIPTION',
  status: 'PAID',
  paymentMethod: 'CREDIT_CARD',
  paymentReference: 'pi_1234567890',
  description: 'Monthly subscription payment',
  metadata: {
    planId: 'plan_123',
    priceId: 'price_456',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const exampleInvoice: InvoiceResponse = {
  id: 1,
  subscriptionId: 'sub_1234567890',
  amount: 99.99,
  currency: 'USD',
  status: 'PAID',
  dueDate: new Date('2024-04-01'),
  paidAt: new Date('2024-03-25'),
  metadata: {
    planId: 'plan_123',
    priceId: 'price_456',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};
