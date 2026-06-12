export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    avatar: string | null;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
