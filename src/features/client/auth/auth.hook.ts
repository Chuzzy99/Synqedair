'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as authApi from '@/features/client/auth/auth.api';
import { setAccessToken, setRefreshToken } from '../../../client-setup/client';
import { useAuthContext } from '../../../context/authContext';
import type { GoogleLoginPayload } from '@/features/client/auth/auth.type';

export const useAuth = () => {
  const { user, setUser, isInitializing } = useAuthContext();
  const queryClient = useQueryClient();

  const googleLoginMutation = useMutation({
    mutationFn: (payload: GoogleLoginPayload) => authApi.googleLogin(payload),

    onSuccess: (response) => {
      setAccessToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),

    // onSettled, not onSuccess: log out locally even if the request fails
    onSettled: () => {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      queryClient.clear();
    },
  });

  return {
    user,
    isAuthenticated: user !== null,
    isInitializing,

    googleLogin: googleLoginMutation.mutateAsync,
    isLoggingIn: googleLoginMutation.isPending,
    loginError: googleLoginMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};