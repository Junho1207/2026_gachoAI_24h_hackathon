import { apiClient } from './client';

// 역할별 신청 상태
// 0 = 신청 가능, 1 = 신청 완료, 2 = 포인트 지급 승인, 3 = 포인트 지급 반려
export type AcceptStatus = 0 | 1 | 2 | 3;

export interface AcceptRole {
  aidx: number;
  uidx: number | null; // null = 미신청
  status: AcceptStatus;
  role: string;
  point: number;
}

export interface AcceptDetailResponse {
  res_status: boolean;
  accept?: AcceptRole[];
}

// 명세: POST /api/accept/detail { didx }
export async function getAcceptDetail(didx: number): Promise<AcceptRole[]> {
  const { data } = await apiClient.post<AcceptDetailResponse>(
    '/api/accept/detail',
    { didx },
  );
  console.log('getAcceptDetail response:', data);
  if (!data?.res_status) return [];
  return data.accept ?? [];
}

// 공통 응답 (지원/취소/지급/거절 모두 동일)
export interface AcceptActionResponse {
  res_status: boolean;
}

// POST /api/accept/subscribe { uidx, aidx } — 역할 신청
export async function subscribeRole(
  uidx: number,
  aidx: number,
): Promise<AcceptActionResponse> {
  const { data } = await apiClient.post<AcceptActionResponse>(
    '/api/accept/subscribe',
    { uidx, aidx },
  );
  console.log('subscribeRole response:', data);
  return data;
}

// POST /api/accept/subscribeCancel { aidx } — 역할 신청 취소
export async function cancelSubscribe(
  aidx: number,
): Promise<AcceptActionResponse> {
  const { data } = await apiClient.post<AcceptActionResponse>(
    '/api/accept/subscribeCancel',
    { aidx },
  );
  console.log('cancelSubscribe response:', data);
  return data;
}

// POST /api/accept/approval { aidx } — 작성자가 신청자에게 포인트 지급
export async function approveAccept(
  aidx: number,
): Promise<AcceptActionResponse> {
  const { data } = await apiClient.post<AcceptActionResponse>(
    '/api/accept/approval',
    { aidx },
  );
  console.log('approveAccept response:', data);
  return data;
}

// POST /api/accept/refusal { aidx } — 작성자가 신청자에게 포인트 지급 거절
export async function refuseAccept(
  aidx: number,
): Promise<AcceptActionResponse> {
  const { data } = await apiClient.post<AcceptActionResponse>(
    '/api/accept/refusal',
    { aidx },
  );
  console.log('refuseAccept response:', data);
  return data;
}
