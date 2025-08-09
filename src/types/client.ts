import { ClientType } from '../generated/prisma';
import { Review, StatisticsInformation } from './freelancer';
import { Project, ProjectRequest, Resource } from './project';
import {
  CreditTransaction,
  CreditUsageAnalytics,
  CustomPlanRequest,
  DiscountRedemption,
  Referral,
  Subscription,
} from './subscription';
import { User } from './user';

// Client interface representing the Client model
export interface Client {
  id: number;
  userId: number;
  user?: User;
  projects?: Project[];
  companyName: string;
  companyWebsite: string;
  billingAddressId: number;
  billingAddress?: Address;
  contactPersonId?: number;
  contactPerson?: ContactPerson;
  subscription?: Subscription;
  referralCode: string;
  contracts?: Contract[];
  reviews?: Review[];
  clientType: ClientType;
  statisticsInformationId: number;
  statisticsInformation?: StatisticsInformation;
  resources?: Resource[];
  reviewOutcomes?: ReviewOutcome[];
  outcomes?: Outcome[];
  projectRequests?: ProjectRequest[];
  referredBy?: Referral[];
  referrals?: Referral[];
  creditTransactions?: CreditTransaction[];
  customPlanRequests?: CustomPlanRequest[];
  createdAt: Date;
  updatedAt: Date;
  discountRedemptions?: DiscountRedemption[];
  billingAddresses?: BillingAddress[];
  paymentTransactions?: PaymentTransaction[];
  billingHistory?: BillingHistory[];
  defaultPaymentMethod?: string;
  taxExempt: boolean;
  taxId?: string;
  creditUsageAnalytics?: CreditUsageAnalytics[];
  hiredFreelancers?: ClientHiredFreelancer[];
}

// Address interface for related data
export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ContactPerson interface for related data
export interface ContactPerson {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
}

// Contract interface for related data
export interface Contract {
  id: number;
  clientId: number;
  projectId: number;
  startDate: Date;
  endDate: Date;
  termsAndConditions: string;
  signedAt: Date;
  signedById: number;
  signedBy?: User;
}

export interface ReviewOutcome {
  id: number;
  // Add relevant review outcome fields
}

export interface Outcome {
  id: number;
  // Add relevant outcome fields
}

export interface BillingAddress {
  id: number;
  // Add relevant billing address fields
}

export interface PaymentTransaction {
  id: number;
  // Add relevant payment transaction fields
}

export interface BillingHistory {
  id: number;
  // Add relevant billing history fields
}

export interface ClientHiredFreelancer {
  clientId: number;
  freelancerId: number;
  hiredAt: Date;
  status: string;
  terminatedAt?: Date;
  terminationReason?: string;
}

// DTOs for client operations
export interface CreateClientDto {
  userId: number;
  companyName: string;
  companyWebsite: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactPerson?: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    position?: string;
  };
  clientType: ClientType;
}

export interface UpdateClientDto {
  companyName?: string;
  companyWebsite?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contactPerson?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    position?: string;
  };
  defaultPaymentMethod?: string;
  taxExempt?: boolean;
  taxId?: string;
}
