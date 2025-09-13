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

// Helper function to safely decode base64 URL-safe strings
const decodeBase64 = (str: string): string => {
  try {
    // Convert URL-safe base64 to regular base64
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding with '=' if needed
    switch (output.length % 4) {
      case 0: break;
      case 2: output += '=='; break;
      case 3: output += '='; break;
      default: throw new Error('Invalid base64 string');
    }
    
    // Decode and handle potential URI component encoding
    const decoded = atob(output);
    try {
      // Try to decode URI components if present
      return decodeURIComponent(decoded.split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch {
      // If URI component decoding fails, return the original decoded string
      return decoded;
    }
  } catch (error) {
    console.error('Error in base64 decoding:', error);
    throw error;
  }
};

// JWT decoding with improved error handling
export const decodeUser = (): { id: string; role: string; email: string } | null => {
  try {
    const token = getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: expected 3 parts');
      return null;
    }
    
    try {
      const decodedPayload = decodeBase64(parts[1]);
      const userData = JSON.parse(decodedPayload);
      
      // Debug log the decoded payload
      if (process.env.NODE_ENV === 'development') {
        console.log('Decoded JWT payload:', userData);
      }
      
      // Extract user data with fallbacks
      const userId = String(userData.sub || userData.userId || userData.id || '').trim();
      const userRole = String(userData.role || 'citizen').trim();
      const userEmail = String(userData.email || '').trim();
      
      if (!userId) {
        console.error('No user ID found in token');
        return null;
      }
      
      return {
        id: userId,
        role: userRole,
        email: userEmail,
      };
    } catch (error) {
      console.error('Error parsing JWT payload:', error);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error in decodeUser:', error);
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
