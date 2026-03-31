import Cookies from 'js-cookie';

const TOKEN_KEY = 'justifi_token';
const REFRESH_KEY = 'justifi_refresh';

export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 1 });
};

export const setRefreshToken = (token: string): void => {
  Cookies.set(REFRESH_KEY, token, { expires: 30 });
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  setToken(accessToken);
  setRefreshToken(refreshToken);
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_KEY);
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_KEY);
};

const decodeBase64 = (str: string): string => {
  try {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');

    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw new Error('Invalid base64 string');
    }

    const decoded = atob(output);
    try {
      return decodeURIComponent(
        decoded
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } catch {
      return decoded;
    }
  } catch (error) {
    console.error('Error in base64 decoding:', error);
    throw error;
  }
};

export const decodeUser = (): { id: string; role: string; email: string; name?: string } | null => {
  try {
    const token = getToken();
    if (!token) {
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

      if (process.env.NODE_ENV === 'development') {
        console.log('Decoded JWT payload:', userData);
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (typeof userData.exp === 'number' && userData.exp < nowInSeconds) {
        removeToken();
        return null;
      }

      const userId = String(userData.sub || userData.userId || userData.id || '').trim();
      const userRole = String(userData.role || 'citizen').trim();
      const userEmail = String(userData.email || '').trim();
      const userName =
        typeof userData.name === 'string' ? userData.name.trim() : undefined;

      if (!userId) {
        console.error('No user ID found in token');
        return null;
      }

      return {
        id: userId,
        role: userRole,
        email: userEmail,
        name: userName,
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

export const getUserRole = (): string | null => {
  const user = decodeUser();
  return user?.role || null;
};
