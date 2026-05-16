import { apiClient } from './client';
import type { PostListResponse, Post, PostStatus } from '../types/post';

// 백엔드 donation 응답 → 프론트 Post 어댑터
// 명세: status 0 = 모집 마감, 1 = 모집 중
//       exercise/study/music/game/clean: 0 = 관련 있음, 1 = 관련 없음
function toPost(d: any): Post {
  const tags: string[] = [];
  if (d.exercise === 0) tags.push('운동');
  if (d.study === 0) tags.push('공부');
  if (d.music === 0) tags.push('음악');
  if (d.game === 0) tags.push('게임');
  if (d.clean === 0) tags.push('청소');

  const status: PostStatus = d.status === 1 ? 'RECRUITING' : 'COMPLETED';

  return {
    id: d.didx,
    title: d.title ?? '',
    content: d.text ?? '',
    author: {
      id: d.writeridx ?? 0,
      userId: '',
      name: '',
      email: '',
      coin: 0,
      tags: [],
      expertTitles: [],
      createdAt: '',
    },
    tags,
    roles: [],
    totalCoinReward: 0,
    status,
    deadline: d.duedate ?? '',
    createdAt: '',
    updatedAt: '',
    participants: [],
    commentCount: 0,
  };
}

// 한글 태그 배열 → 백엔드 0/1 필드 (0 = 관련 있음 / 1 = 관련 없음)
function tagsToFields(tags: string[]) {
  return {
    exercise: tags.includes('운동') ? 0 : 1,
    study: tags.includes('공부') ? 0 : 1,
    music: tags.includes('음악') ? 0 : 1,
    game: tags.includes('게임') ? 0 : 1,
    clean: tags.includes('청소') ? 0 : 1,
  };
}

// 게시글 상세 (프론트 친화 형식)
export interface PostDetail {
  didx: number;
  writerIdx: number;
  status: number; // 0 = 모집 마감, 1 = 모집 중
  title: string;
  duedate: string;
  text: string;
  tags: string[]; // 변환된 한글 태그
}

// 백엔드 detail 응답 → PostDetail 어댑터
// ⚠️ 명세는 'writerIdx'지만 실제 응답은 'writeridx' — 두 키 모두 fallback 처리
function toPostDetail(d: any): PostDetail {
  const tags: string[] = [];
  if (d.exercise === 0) tags.push('운동');
  if (d.study === 0) tags.push('공부');
  if (d.music === 0) tags.push('음악');
  if (d.game === 0) tags.push('게임');
  if (d.clean === 0) tags.push('청소');

  return {
    didx: d.didx,
    writerIdx: d.writeridx ?? d.writerIdx ?? 0,
    status: d.status,
    title: d.title ?? '',
    duedate: d.duedate ?? '',
    text: d.text ?? '',
    tags,
  };
}

// 게시글 작성 입력 (프론트 친화 형식)
export interface CreatePostInput {
  uidx: number;
  title: string;
  content: string;
  deadline: string; // YYYY-MM-DD
  tags: string[]; // ['운동' | '공부' | '음악' | '게임' | '청소']
  roles: Array<{ name: string; coinReward: number }>;
}

// 게시글 작성 응답
export interface CreatePostResponse {
  res_status: boolean;
  didx?: number;
}

// 게시글 상태 변경 응답
export interface ChangePostStatusResponse {
  res_status: boolean;
}

export const postApi = {
  getPosts: async (params?: {
    page?: number;
    size?: number;
    tag?: string;
    status?: string;
  }): Promise<PostListResponse> => {
    // 백엔드는 body 없는 요청에 411 응답 → 빈 객체 보장
    const response = await apiClient.post('/api/donation/list', params ?? {});
    console.log('getPosts response:', response.data);

    const rawList: any[] =
      response.data?.donations ??
      response.data?.posts ??
      response.data?.list ??
      (Array.isArray(response.data) ? response.data : []);

    const posts: Post[] = rawList.map(toPost);

    return {
      posts,
      totalCount: posts.length,
      hasNext: false,
    };
  },
  // 명세: POST /api/donation/detail { didx }
  getPostDetail: async (didx: number): Promise<PostDetail> => {
    const response = await apiClient.post('/api/donation/detail', { didx });
    console.log('getPostDetail response:', response.data);
    if (!response.data?.res_status) {
      throw new Error('Failed to fetch post detail');
    }
    return toPostDetail(response.data);
  },
  createPost: async (input: CreatePostInput): Promise<CreatePostResponse> => {
    // 프론트 입력 → 백엔드 명세 형식으로 변환
    const payload = {
      uidx: input.uidx,
      title: input.title,
      duedate: input.deadline,
      ...tagsToFields(input.tags),
      text: input.content,
      accept: input.roles.map((r) => ({
        role: r.name,
        point: Number(r.coinReward) || 0,
      })),
    };
    const response = await apiClient.post<CreatePostResponse>(
      '/api/donation/write',
      payload,
    );
    console.log('createPost response:', response.data);
    return response.data;
  },
  // POST /api/donation/statusChange { didx, status }
  // status: 0 = 모집 마감, 1 = 모집 중
  changePostStatus: async (
    didx: number,
    status: number,
  ): Promise<ChangePostStatusResponse> => {
    const response = await apiClient.post<ChangePostStatusResponse>(
      '/api/donation/statusChange',
      { didx, status },
    );
    console.log('changePostStatus response:', response.data);
    return response.data;
  },
  joinPost: async (postId: number, roleId: number): Promise<void> => {
    await apiClient.post(`/api/donation/${postId}/join`, { roleId });
  },
  updateParticipantStatus: async (postId: number, participantId: number, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    await apiClient.post(`/api/donation/${postId}/participants/${participantId}`, { status });
  },
};
