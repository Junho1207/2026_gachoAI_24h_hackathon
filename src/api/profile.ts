import { apiClient } from './client';

export interface ProfilePointRequest {
  uidx: number;
}

export interface ProfilePointResponse {
  res_status: boolean;
  point?: number;
}

export interface ProfileTagRequest {
  uidx: number;
}

export interface ProfileTagResponse {
  res_status: boolean;
  exercise?: number;
  study?: number;
  music?: number;
  game?: number;
  clean?: number;
}

export interface ProfileInfoRequest {
  uidx: number;
}

export interface ProfileInfoResponse {
  res_status?: boolean; // In case of 400
  name?: string;
  gachon_id?: string;
}

export const getProfilePoint = async (data: ProfilePointRequest): Promise<ProfilePointResponse> => {
  const response = await apiClient.post<ProfilePointResponse>('/api/profile/point', data);
  return response.data;
};

export const getProfileTag = async (data: ProfileTagRequest): Promise<ProfileTagResponse> => {
  const response = await apiClient.post<ProfileTagResponse>('/api/profile/tag', data);
  return response.data;
};

export const getProfileInfo = async (data: ProfileInfoRequest): Promise<ProfileInfoResponse> => {
  const response = await apiClient.post<ProfileInfoResponse>('/api/profile/info', data);
  return response.data;
};
