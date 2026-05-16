import { apiClient } from './client';

export interface CommentReply {
  writeidx: number;
  text: string;
}

export interface CommentItem {
  cidx: number;
  writeidx: number;
  text: string;
  reply: CommentReply[];
}

export interface CommentDetailResponse {
  res_status: boolean;
  comment?: CommentItem[];
}

// 백엔드 응답 정규화
// 명세는 'writeidx'지만 실제 댓글은 'writeridx', 대댓글은 'writeidx'로 옴.
// uidx 필드도 같이 오는 경우 있어 모두 fallback 처리.
function toCommentItem(c: any): CommentItem {
  return {
    cidx: c.cidx,
    writeidx: c.writeridx ?? c.writeidx ?? c.uidx ?? 0,
    text: c.text ?? '',
    reply: (c.reply ?? []).map((r: any) => ({
      writeidx: r.writeridx ?? r.writeidx ?? r.uidx ?? 0,
      text: r.text ?? '',
    })),
  };
}

// 명세: POST /api/comment/detail { didx }
export async function getCommentDetail(didx: number): Promise<CommentItem[]> {
  const { data } = await apiClient.post('/api/comment/detail', { didx });
  console.log('getCommentDetail response:', data);
  if (!data?.res_status) return [];
  const raw: any[] = data.comment ?? [];
  return raw.map(toCommentItem);
}

// ── 댓글 / 대댓글 작성 ──

export interface WriteCommentRequest {
  uidx: number;
  didx: number;
  text: string;
}
export interface WriteCommentResponse {
  res_status: boolean;
  cidx?: number;
}

// POST /api/comment/write { uidx, didx, text }
export async function writeComment(
  req: WriteCommentRequest,
): Promise<WriteCommentResponse> {
  const { data } = await apiClient.post<WriteCommentResponse>(
    '/api/comment/write',
    { uidx: req.uidx, didx: req.didx, text: req.text },
  );
  console.log('writeComment response:', data);
  return data;
}

export interface WriteReplyRequest {
  uidx: number;
  cidx: number;
  text: string;
}
export interface WriteReplyResponse {
  res_status: boolean;
}

// POST /api/comment/writeReply { uidx, cidx, text }
export async function writeReply(
  req: WriteReplyRequest,
): Promise<WriteReplyResponse> {
  const { data } = await apiClient.post<WriteReplyResponse>(
    '/api/comment/writeReply',
    { uidx: req.uidx, cidx: req.cidx, text: req.text },
  );
  console.log('writeReply response:', data);
  return data;
}
