import Cookies from 'js-cookie';

const TOKEN_KEY = 'justifi_token';

// Token management
export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }); // 7 days
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};

// JWT decoding (safe approach without external dependencies)
export const decodeUser = (): { role: string; email: string } | null => {
  try {
    const token = getToken();
    if (!token) return null;

    // Split the JWT and get the payload part
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the base64 payload
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode using atob (safe for client-side)
    const decoded = atob(paddedPayload);
    const userData = JSON.parse(decoded);

    return {
      role: userData.role || 'citizen',
      email: userData.email || '',
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const user = decodeUser();
    return !!user;
  } catch {
    return false;
  }
};

// Get user role
export const getUserRole = (): string | null => {
  const user = decodeUser();
  return user?.role || null;
};

// Logout function
export const logout = (): void => {
  removeToken();
  window.location.href = '/auth/login';
};
