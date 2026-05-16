import { apiClient } from './client';
import type { PostListResponse, Post } from '../types/post';

export const postApi = {
  getPosts: async (params?: {
    page?: number;
    size?: number;
    tag?: string;
    status?: string;
  }): Promise<PostListResponse> => {
    const response = await apiClient.post('/api/donation/list', params);
    console.log('getPosts response:', response.data);
    
    // 백엔드 응답이 배열인 경우
    if (Array.isArray(response.data)) {
      return {
        posts: response.data,
        totalCount: response.data.length,
        hasNext: false,
      };
    }
    
    // 백엔드 응답에 posts 필드가 없고 다른 필드(예: list)가 있는 경우 대응
    if (response.data && !response.data.posts && response.data.list) {
      return {
        ...response.data,
        posts: response.data.list,
      };
    }

    return response.data;
  },
  getPostById: async (postId: number): Promise<Post> => {
    const response = await apiClient.get(`/api/donation/${postId}`);
    console.log('getPostById response:', response.data);
    return response.data;
  },
  createPost: async (data: any): Promise<Post> => {
    const response = await apiClient.post('/api/donation/write', data);
    console.log('createPost response:', response.data);
    return response.data;
  },
  joinPost: async (postId: number, roleId: number): Promise<void> => {
    await apiClient.post(`/api/donation/${postId}/join`, { roleId });
  },
  updateParticipantStatus: async (postId: number, participantId: number, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    await apiClient.patch(`/api/donation/${postId}/participants/${participantId}`, { status });
  },
};
