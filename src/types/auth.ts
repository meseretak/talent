/**
 * OAuth provider types for authentication
 */
export enum OAuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  TWITTER = 'twitter',
}

/**
 * User data returned from OAuth providers
 */
export interface OAuthUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: OAuthProvider;
}

/**
 * Socket user data structure
 */
export interface SocketUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
