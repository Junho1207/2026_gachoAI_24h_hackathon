import { apiClient } from './client';
import type { User } from '../types/post';

// 백엔드 컨벤션상 모든 엔드포인트가 POST 메서드 사용
export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.post('/api/users/me', {});
    return response.data;
  },
  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.post('/api/users/me', data);
    return response.data;
  },
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.post(`/api/users/${userId}`, {});
    return response.data;
  },
};
