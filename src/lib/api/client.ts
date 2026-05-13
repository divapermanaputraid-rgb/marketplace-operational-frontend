export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export class APIError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'APIError';
  }
}

/**
 * Core fetch wrapper with default headers and error handling
 */
export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: APIResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      throw new APIError(
        data.error?.message || 'An unexpected error occurred',
        data.error?.code || 'UNKNOWN_ERROR'
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR'
    );
  }
}

// System API Calls
export const systemApi = {
  getHealth: () => fetchApi<{ status: string; service: string }>('/api/health'),
  login: (data: unknown) => fetchApi<{ admin: unknown; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchApi<unknown>('/api/auth/logout', { method: 'POST' }),
  getMe: () => fetchApi<{ admin: unknown }>('/api/auth/me'),
  changePassword: (data: unknown) => fetchApi<unknown>('/api/auth/change-password', { method: 'PATCH', body: JSON.stringify(data) })
};
