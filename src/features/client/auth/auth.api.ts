import { client, getRefreshToken } from '../../../client-setup/client';
import type { ApiResponse } from '@/types/api';
import type {
  GoogleLoginPayload,
  GoogleLoginResponseData,
  RefreshTokenResponseData,
  User,
} from '../../../features/client/auth/auth.type';

export const googleLogin = async (payload: GoogleLoginPayload) => {
  const { data } = await client.post<ApiResponse<GoogleLoginResponseData>>(
    '/auth/google',
    payload
  );
  return data;
};

export const logout = async () => {
  const refreshToken = getRefreshToken();
  const { data } = await client.post<ApiResponse>('/auth/logout', { refreshToken });
  return data;
};

export const getMe = async () => {
  const { data } = await client.get<ApiResponse<User>>('/auth/me');
  return data;
};

export const refreshToken = async () => {
  const { data } = await client.post<ApiResponse<RefreshTokenResponseData>>(
    '/auth/refresh',
    { refreshToken: getRefreshToken() }
  );
  return data;
};