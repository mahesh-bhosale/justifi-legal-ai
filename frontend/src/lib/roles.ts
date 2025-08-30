import { decodeUser } from './auth';

/**
 * Gets the user role from the JWT token
 * @returns The user role or null if not authenticated
 */
export function getRoleFromToken(): string | null {
  const user = decodeUser();
  return user?.role || null;
}

/**
 * Checks if the current user has one of the allowed roles
 * @param allowed Array of allowed roles
 * @returns Boolean indicating if the user has an allowed role
 */
export function ensureRole(allowed: string[]): boolean {
  const role = getRoleFromToken();
  
  // If no role is found, user is not authenticated
  if (!role) return false;
  
  // Check if the user's role is in the allowed roles array
  return allowed.includes(role);
}