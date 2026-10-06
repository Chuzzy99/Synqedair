export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface GoogleLoginPayload {
  idToken: string;
}

export interface GoogleLoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}