export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'VIEWER';
  avatar: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

