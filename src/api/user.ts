import { apiClient } from './client';
import type { User } from '../types/post';

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/users/me');
    return response.data;
  },
  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch('/api/users/me', data);
    return response.data;
  },
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  },
};
