import { api } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'sindico' | 'zelador' | 'morador' | 'portaria';
  condo_id: number | null;
  apt_number: string | null;
  sip_user: string | null;
  sip_password: string | null;
  avatar_url?: string | null;
}

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data as { token: string; user: User };
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data as User;
};
