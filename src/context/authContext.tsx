'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { isAxiosError } from 'axios';

import {
  getRefreshToken,
  hasFreshAccessToken,
  refreshSession,
  setAccessToken,
  setAuthFailureHandler,
  setRefreshToken,
} from '@/client-setup/client';
import * as authApi from '@/features/client/auth/auth.api';
import type { User } from '@/features/client/auth/auth.type';

const USER_CACHE_KEY = 'synqed_cached_user';

// Profile only (name, email, avatar). Tokens are never stored here.
const readCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const writeCachedUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    // storage unavailable, nothing to do
  }
};

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Every user change also updates the cache, so login/logout stay in sync
  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    writeCachedUser(next);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => setUser(null));

    let active = true;

    const restoreSession = async () => {
      if (!getRefreshToken()) {
        setUser(null);
        setIsInitializing(false);
        return;
      }

      // Show the cached profile immediately, then verify in the background
      const cached = readCachedUser();
      if (cached) {
        setUserState(cached);
        setIsInitializing(false);
      }

      try {
        // Only refresh when the access token is missing or about to expire
        if (!hasFreshAccessToken()) {
          await refreshSession();
        }

        const res = await authApi.getMe();
        if (active) setUser(res.data);
      } catch (error) {
        // Only drop the session if the server rejected it, not on a network blip
        if (isAxiosError(error) && error.response && active) {
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsInitializing(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
      setAuthFailureHandler(null);
    };
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }

  return ctx;
};