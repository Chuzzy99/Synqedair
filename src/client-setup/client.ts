import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';
import type { RefreshTokenResponseData } from '@/features/client/auth/auth.type';

const REFRESH_KEY = 'synqed_refresh_token';
const ACCESS_KEY = 'synqed_access_token';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/* ---------- Token storage ---------- */

let accessToken: string | null = null;

// Reads the expiry straight from the JWT, so no separate expiry value is needed
const decodeExpiry = (token: string): number | null => {
  try {
    const part = token.split('.')[1] ?? '';
    const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window === 'undefined') return null;

  // Survives a page reload within the same tab, cleared when the tab closes
  accessToken = sessionStorage.getItem(ACCESS_KEY);
  return accessToken;
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window === 'undefined') return;

  if (token) {
    sessionStorage.setItem(ACCESS_KEY, token);
  } else {
    sessionStorage.removeItem(ACCESS_KEY);
  }
};

// True if the stored access token has more than 30s left
export const hasFreshAccessToken = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  const expiresAt = decodeExpiry(token);
  return expiresAt !== null && expiresAt - Date.now() > 30_000;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window === 'undefined') return;

  if (token) {
    localStorage.setItem(REFRESH_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
};

/* ---------- Auth failure hook (the context registers this) ---------- */

let onAuthFailure: (() => void) | null = null;

export const setAuthFailureHandler = (handler: (() => void) | null) => {
  onAuthFailure = handler;
};

/* ---------- Axios instance ---------- */

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------- Refresh (single-flight) ---------- */

let refreshPromise: Promise<string> | null = null;

// Uses plain axios (not `client`) so it can't trigger the interceptor again
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const { data } = await axios.post<ApiResponse<RefreshTokenResponseData>>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken }
  );

  setAccessToken(data.data.accessToken);
  setRefreshToken(data.data.refreshToken);

  return data.data.accessToken;
};

// Parallel callers share one request, because refresh tokens are rotated
export const refreshSession = (): Promise<string> => {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

/* ---------- Retry on 401 ---------- */

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// A 401 from these means "bad credentials", not "expired token"
const NO_REFRESH_PATHS = ['/auth/google', '/auth/refresh', '/auth/logout'];

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    const skip =
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      NO_REFRESH_PATHS.some((path) => original.url?.includes(path));

    if (skip) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await refreshSession();

      original.headers.Authorization = `Bearer ${newToken}`;
      return client(original);
    } catch (refreshError) {
      setAccessToken(null);
      setRefreshToken(null);
      onAuthFailure?.();
      return Promise.reject(refreshError);
    }
  }
);