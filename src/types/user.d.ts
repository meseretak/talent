import { UserRole } from '../generated/prisma';

export enum UserRoles {
  FREELANCER = UserRole.FREELANCER,
  CLIENT = UserRole.CLIENT,
  ADMIN = UserRole.ADMIN,
  PROJECT_MANAGER = UserRole.PROJECT_MANAGER,
  SUPER_ADMIN = UserRole.SUPER_ADMIN,
}

// User interface for related data
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: Role;
  provider?: OAuthProvider;
  providerId?: string;
  isEmailVerified: boolean;
}
