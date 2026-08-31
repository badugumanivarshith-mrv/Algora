const TOKEN_KEY = 'algora_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  unverified?: boolean;
}

export const request = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const text = await response.text();
    let json: Record<string, unknown> = {};
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = { error: 'Failed to parse server response' };
      }
    }

    if (!response.ok) {
      return {
        error: typeof json.error === 'string' ? json.error : `HTTP error! status: ${response.status}`,
        unverified: typeof json.unverified === 'boolean' ? json.unverified : false,
      };
    }

    return { 
      data: json as unknown as T, 
      message: typeof json.message === 'string' ? json.message : undefined 
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network request failed',
    };
  }
};
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
