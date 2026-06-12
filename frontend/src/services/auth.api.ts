import { api } from './api';
import { LoginInput } from '../types/auth';

export const authApi = {
  login: async (data: LoginInput) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
export type { LoginInput };
