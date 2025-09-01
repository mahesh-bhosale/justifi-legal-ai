import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Server-side redirect utility for Next.js
 * Reads role from cookies and redirects accordingly
 */
export async function redirectBasedOnRole(): Promise<never> {
  const cookieStore = await cookies();
  const token = cookieStore.get('justifi_token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  try {
    // Decode JWT token to get role
    const parts = token.split('.');
    if (parts.length !== 3) {
      redirect('/auth/login');
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = atob(paddedPayload);
    const userData = JSON.parse(decoded);
    const role = userData.role || 'citizen';

    // Role-based redirects
    switch (role) {
      case 'citizen':
        redirect('/dashboard/citizen');
      case 'lawyer':
        redirect('/dashboard/lawyer');
      case 'admin':
        redirect('/dashboard/admin');
      default:
        redirect('/auth/login');
    }
  } catch {
    // If token is invalid, redirect to login
    redirect('/auth/login');
  }
}

/**
 * Check if user has required role and redirect if not
 * @param requiredRoles Array of allowed roles
 * @param redirectTo Where to redirect if role check fails
 */
export async function requireRole(requiredRoles: string[], redirectTo: string = '/auth/login'): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('justifi_token')?.value;

  if (!token) {
    redirect(redirectTo);
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      redirect(redirectTo);
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = atob(paddedPayload);
    const userData = JSON.parse(decoded);
    const role = userData.role || 'citizen';

    if (!requiredRoles.includes(role)) {
      redirect(redirectTo);
    }

    // If we reach here, user has required role, so no redirect needed
    return;
  } catch {
    redirect(redirectTo);
  }
}
