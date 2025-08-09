// Import necessary enums from the generated Prisma client
import {
  AvailabilityStatus,
  DesignType,
  FreelancerStatus,
  MarketingType,
  ProgrammingType,
  Role,
  SkillType,
  TerminationType,
  VideoType,
  WritingType,
} from '../generated/prisma';
import { OAuthProvider } from './auth';
import { Project, ProjectDocument, ProjectTeam, Task, TimeLog } from './project';
import { User } from './user';

// Freelancer interface representing the Freelancer model
export interface Freelancer {
  id: number;
  userId: number;
  user?: User;
  headline: string;
  bio: string;
  about: string;
  skills: Skill[];
  categories: Category[];
  featuredFreelancer: boolean;
  rank: boolean;
  attachments: ProjectDocument[];
  certifications: Certification[];
  workHistory: WorkHistory[];
  availability: Availability;
  availabilityId: number;
  portfolio: PortfolioItem[];
  paymentInformation: PaymentInformation[];
  projects: Project[];
  statisticsInformation: StatisticsInformation;
  statisticsInformationId: number;
  terminationInformation?: TerminationInformation;
  terminationInformationId?: number;
  reviews: Review[];
  status: FreelancerStatus;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
  timeLogs: TimeLog[];
  projectTeams: ProjectTeam[];
  profilePhoto?: string;
  bannerPhoto?: string;
  hiredByClients: ClientHiredFreelancer[];
}

// Skill interface
export interface Skill {
  id: number;
  name: string;
  description?: string;
  type: SkillType;
  videoType?: VideoType;
  programmingType?: ProgrammingType;
  designType?: DesignType;
  writingType?: WritingType;
  marketingType?: MarketingType;
  freelancers?: Freelancer[];
}

// Category interface
export interface Category {
  id: number;
  name: string;
  description?: string;
  freelancers?: Freelancer[];
}

// Certification interface
export interface Certification {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  freelancerId?: number;
}

// WorkHistory interface
export interface WorkHistory {
  id: number;
  companyName: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  freelancerId?: number;
}

// Availability interface
export interface Availability {
  id: number;
  status: AvailabilityStatus;
  availableHoursPerWeek?: number;
  unavailableUntil?: Date;
  notes?: string;
}

// TerminationInformation interface
export interface TerminationInformation {
  id: number;
  terminatedAt?: Date;
  terminatedReason?: string;
  isTerminated: boolean;
  terminationType: TerminationType;
  userId: number;
  terminatedBy?: User;
}

// PortfolioItem interface
export interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  imageURL?: string;
  projectURL?: string;
  freelancerId?: number;
}

// PaymentInformation interface
export interface PaymentInformation {
  id: number;
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
  currency: string;
  bankAccountType: string;
  paymentMethod: string;
  paymentFrequency: string;
  paymentAmount: number;
  paymentDate: Date;
  taxId?: string;
  taxCountry?: string;
  taxState?: string;
  taxAddress?: string;
  taxPercentage?: number;
  freelancerId?: number;
  taxInformationId?: number;
  invoiceId?: number;
}

// StatisticsInformation interface
export interface StatisticsInformation {
  id: number;
  totalEarnings: number;
  totalProjects: number;
  totalTasks: number;
  totalReviews: number;
  totalRating: number;
  totalClients: number;
  totalJobsCompleted: number;
  totalJobsOngoing: number;
  totalJobsPending: number;
  totalJobsCancelled: number;
  totalJobsOnHold: number;
  totalStorageUsed: number;
}

// ClientHiredFreelancer interface
export interface ClientHiredFreelancer {
  clientId: number;
  freelancerId: number;
  client?: any; // Replace with Client interface if available
  hiredAt: Date;
  status: string;
  terminatedAt?: Date;
  terminationReason?: string;
}

// Review interface
export interface Review {
  id: number;
  rating: number;
  reviewText?: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: number;
  reviewerId: number;
  reviewer?: User;
  comment?: string;
  freelancerId?: number;
  clientId: number;
  client?: any; // Replace with Client interface if available
  project?: any; // Replace with Project interface if available
}

// Existing DTOs remain unchanged
export type CreateFreelancerDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role?: Role;
  provider?: OAuthProvider;
  providerId?: string;
  isEmailVerified?: boolean;
  headline: string;
  bio: string;
  about?: string;
  availability: {
    status: AvailabilityStatus;
    availableHoursPerWeek: number;
    unavailableUntil?: Date;
    notes?: string;
  };
  skills: number[];
  categories: number[];
  profilePhoto?: string;
  bannerPhoto?: string;
  workHistory?: {
    companyName: string;
    position: string;
    startDate: Date | string;
    endDate?: Date | string;
    description?: string;
  }[];
  certifications?: {
    name: string;
    issuingOrganization: string;
    issueDate: Date | string;
    expirationDate?: Date | string;
    credentialId?: string;
  }[];
  portfolio?: {
    title: string;
    description?: string;
    imageURL?: string;
    projectURL?: string;
  }[];
};

export type UpdateFreelancerDto = {
  headline?: string;
  bio?: string;
  about?: string;
  availability?: {
    status?: AvailabilityStatus;
    availableHoursPerWeek?: number;
    unavailableUntil?: Date;
    notes?: string;
  };
  skills?: number[];
  categories?: number[];
  profilePhoto?: string;
  workHistory?: {
    companyName: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }[];
  certifications?: {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expirationDate?: Date;
    credentialId?: string;
  }[];
  portfolio?: {
    title: string;
    description?: string;
    imageURL?: string;
    projectURL?: string;
  }[];
};

// --- Work History DTOs ---

export type CreateWorkHistoryDto = {
  companyName: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
};

export type UpdateWorkHistoryDto = {
  companyName?: string;
  position?: string;
  startDate?: Date;
  endDate?: Date | null; // Allow setting to null
  description?: string | null; // Allow setting to null
};

// --- Portfolio Item DTOs ---

export type CreatePortfolioItemDto = {
  title: string;
  description?: string;
  imageURL?: string;
  projectURL?: string;
};

export type UpdatePortfolioItemDto = {
  title?: string;
  description?: string | null; // Allow setting to null
  imageURL?: string | null; // Allow setting to null
  projectURL?: string | null; // Allow setting to null
};

// --- Skill/Category DTOs ---

export type AddSkillDto = {
  name: string;
  description?: string;
  type: SkillType;
  // Optional fields based on SkillType
  videoType?: VideoType;
  programmingType?: ProgrammingType;
  designType?: DesignType;
  writingType?: WritingType;
  marketingType?: MarketingType;
};

export type AddCategoryDto = {
  name: string;
  description?: string;
};

// --- Termination DTO ---

export type TerminationDetailsDto = {
  terminationReason?: string;
  terminationType: TerminationType;
};
