import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import { useAuthStore } from '../../store/authStore';
import { postApi, type PostDetail } from '../../api/post';
import {
  getAcceptDetail,
  subscribeRole,
  cancelSubscribe,
  approveAccept,
  refuseAccept,
  type AcceptRole,
} from '../../api/accept';
import {
  getCommentDetail,
  writeComment,
  writeReply,
  type CommentItem,
} from '../../api/comment';
import { getProfileInfo } from '../../api/profile';

function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { uidx } = useAuthStore();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [accepts, setAccepts] = useState<AcceptRole[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 댓글 작성
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 대댓글 작성 (열려있는 부모 cidx)
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // uidx → name 캐시 (작성자/댓글/대댓글 이름 표시용)
  const [userNames, setUserNames] = useState<Map<number, string>>(new Map());

  // 상태 변경 (작성자 전용)
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // 모집 역할 액션 로딩 (어떤 aidx가 호출 중인지)
  const [actionLoadingAidx, setActionLoadingAidx] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!postId) return;
    const didx = Number(postId);
    if (!Number.isFinite(didx)) return;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [postRes, acceptRes, commentRes] = await Promise.all([
          postApi.getPostDetail(didx),
          getAcceptDetail(didx),
          getCommentDetail(didx),
        ]);
        setPost(postRes);
        setAccepts(acceptRes);
        setComments(commentRes);
      } catch (err) {
        console.error('Failed to fetch post detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [postId]);

  // post/comments 로드되면 등장하는 모든 uidx의 닉네임 병렬 조회
  useEffect(() => {
    const uidxSet = new Set<number>();
    if (post?.writerIdx) uidxSet.add(post.writerIdx);
    comments.forEach((c) => {
      if (c.writeidx) uidxSet.add(c.writeidx);
      c.reply.forEach((r) => {
        if (r.writeidx) uidxSet.add(r.writeidx);
      });
    });

    // 이미 캐시된 건 제외
    const toFetch = [...uidxSet].filter((u) => !userNames.has(u));
    if (toFetch.length === 0) return;

    let cancelled = false;
    Promise.all(
      toFetch.map((uidx) =>
        getProfileInfo({ uidx })
          .then((res) => ({ uidx, name: res.name }))
          .catch(() => ({ uidx, name: undefined as string | undefined })),
      ),
    ).then((results) => {
      if (cancelled) return;
      setUserNames((prev) => {
        const next = new Map(prev);
        results.forEach(({ uidx, name }) => {
          next.set(uidx, name ?? `사용자 #${uidx}`);
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [post?.writerIdx, comments, userNames]);

  function getName(uidx: number | null | undefined): string {
    if (uidx == null) return '익명';
    return userNames.get(uidx) ?? `사용자 #${uidx}`;
  }

  // 로딩 / 에러 처리
  if (isLoading) {
    return (
      <div className="flex min-h-full flex-col bg-bg-subtle">
        <Header title="게시글 상세" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-full flex-col bg-bg-subtle">
        <Header title="게시글 상세" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-text-secondary">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const isRecruiting = post.status === 1;
  const didx = post.didx;
  const isAuthor = uidx != null && post.writerIdx === uidx;

  // 모집 역할 액션 공통 처리
  async function runRoleAction(
    aidx: number,
    action: () => Promise<{ res_status: boolean }>,
    failMessage: string,
  ) {
    if (actionLoadingAidx !== null) return;
    setActionLoadingAidx(aidx);
    try {
      const res = await action();
      if (res.res_status) {
        // 역할 목록 다시 fetch
        const data = await getAcceptDetail(didx);
        setAccepts(data);
      } else {
        alert(failMessage);
      }
    } catch (err) {
      console.error('Role action failed:', err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setActionLoadingAidx(null);
    }
  }

  function handleSubscribe(aidx: number) {
    if (!uidx) {
      alert('로그인이 필요합니다.');
      return;
    }
    void runRoleAction(
      aidx,
      () => subscribeRole(uidx, aidx),
      '지원에 실패했습니다.',
    );
  }

  function handleCancel(aidx: number) {
    void runRoleAction(
      aidx,
      () => cancelSubscribe(aidx),
      '지원 취소에 실패했습니다.',
    );
  }

  function handleApprove(aidx: number) {
    void runRoleAction(
      aidx,
      () => approveAccept(aidx),
      '포인트 지급에 실패했습니다.',
    );
  }

  function handleRefuse(aidx: number) {
    void runRoleAction(
      aidx,
      () => refuseAccept(aidx),
      '거절 처리에 실패했습니다.',
    );
  }

  async function handleToggleStatus() {
    if (isChangingStatus) return;
    const nextStatus = isRecruiting ? 0 : 1; // 1↔0 토글
    setIsChangingStatus(true);
    try {
      const res = await postApi.changePostStatus(didx, nextStatus);
      if (res.res_status) {
        // 로컬 state만 업데이트 (전체 refetch 불필요)
        setPost((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      } else {
        alert('상태 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to change status:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChangingStatus(false);
    }
  }

  // 댓글만 다시 불러오기 (작성 후 새로고침용)
  async function refreshComments() {
    const data = await getCommentDetail(didx);
    setComments(data);
  }

  async function handleSubmitComment() {
    if (!uidx) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentText.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await writeComment({
        uidx,
        didx,
        text: commentText.trim(),
      });
      if (res.res_status) {
        setCommentText('');
        await refreshComments();
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to write comment:', err);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleSubmitReply(parentCidx: number) {
    if (!uidx) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!replyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    try {
      const res = await writeReply({
        uidx,
        cidx: parentCidx,
        text: replyText.trim(),
      });
      if (res.res_status) {
        setReplyText('');
        setReplyingTo(null);
        await refreshComments();
      } else {
        alert('답글 작성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to write reply:', err);
      alert('답글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingReply(false);
    }
  }

  // 모집 역할 버튼 상태 분기
  // role.status: 0=신청 가능, 1=신청 완료, 2=포인트 지급 승인, 3=포인트 지급 반려
  function renderRoleButton(role: AcceptRole) {
    const loading = actionLoadingAidx === role.aidx;

    // 포인트 지급 승인됨
    if (role.status === 2) {
      return (
        <div className="relative z-10 flex h-9 items-center rounded-lg bg-success px-4 text-[13px] font-semibold text-text-inverse">
          지급 완료
        </div>
      );
    }

    // 포인트 지급 거절됨
    if (role.status === 3) {
      return (
        <div className="relative z-10 flex h-9 items-center rounded-lg bg-error px-4 text-[13px] font-semibold text-text-inverse">
          지급 거절
        </div>
      );
    }

    // 게시글 모집 마감 (status === 0)
    if (!isRecruiting) {
      // 작성자 + 신청자 있는 자리 → 지급 / 거절
      if (isAuthor && role.uidx != null) {
        return (
          <div className="relative z-10 flex gap-2">
            <button
              type="button"
              onClick={() => handleApprove(role.aidx)}
              disabled={loading}
              className="h-9 rounded-lg bg-success px-3 text-[13px] font-semibold text-text-inverse active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '...' : '지급'}
            </button>
            <button
              type="button"
              onClick={() => handleRefuse(role.aidx)}
              disabled={loading}
              className="h-9 rounded-lg bg-error px-3 text-[13px] font-semibold text-text-inverse active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '...' : '거절'}
            </button>
          </div>
        );
      }
      // 빈 자리 또는 비작성자 → 비활성
      return (
        <div className="flex h-9 items-center rounded-lg bg-neutral-65 px-4 text-[13px] font-semibold text-text-inverse">
          모집 마감
        </div>
      );
    }

    // 모집중 + 빈 자리
    if (role.uidx === null) {
      if (isAuthor) {
        // 작성자가 자기 글에 지원하면 안 됨 → 비활성 라벨
        return (
          <div className="flex h-9 items-center rounded-lg border border-border bg-bg px-4 text-[13px] font-medium text-text-tertiary">
            신청 대기
          </div>
        );
      }
      return (
        <button
          type="button"
          onClick={() => handleSubscribe(role.aidx)}
          disabled={loading}
          className="h-9 rounded-lg bg-success px-4 text-[13px] font-semibold text-text-inverse active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '...' : '지원하기'}
        </button>
      );
    }

    // 모집중 + 내가 신청한 자리 → 지원취소
    if (role.uidx === uidx) {
      return (
        <button
          type="button"
          onClick={() => handleCancel(role.aidx)}
          disabled={loading}
          className="relative z-10 h-9 rounded-lg bg-error px-4 text-[13px] font-semibold text-text-inverse active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '...' : '지원취소'}
        </button>
      );
    }

    // 모집중 + 다른 사람이 차지한 자리 → 비활성
    return (
      <div className="flex h-9 items-center rounded-lg bg-neutral-65 px-4 text-[13px] font-semibold text-text-inverse">
        모집 마감
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-bg-subtle">
      <Header title="게시글 상세" />

      <main className="flex flex-1 flex-col gap-6 px-5 py-5 pb-10">
        {/* 제목 + 상태 배지 */}
        <section className="flex items-start justify-between gap-2">
          <h1 className="text-[24px] font-bold leading-tight text-text-primary">
            {post.title}
          </h1>
          {isAuthor ? (
            <button
              type="button"
              onClick={() => void handleToggleStatus()}
              disabled={isChangingStatus}
              title={isRecruiting ? '클릭하면 모집 마감' : '클릭하면 다시 모집'}
              className={`mt-1 flex h-7 shrink-0 items-center rounded-full px-3 text-[12px] font-semibold text-text-inverse transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                isRecruiting ? 'bg-success' : 'bg-neutral-65'
              }`}
            >
              {isChangingStatus
                ? '...'
                : isRecruiting
                  ? '모집중'
                  : '모집 마감'}
            </button>
          ) : (
            <span
              className={`mt-1 flex h-7 shrink-0 items-center rounded-full px-3 text-[12px] font-semibold text-text-inverse ${
                isRecruiting ? 'bg-success' : 'bg-neutral-65'
              }`}
            >
              {isRecruiting ? '모집중' : '모집 마감'}
            </span>
          )}
        </section>

        {/* 태그 + 작성자/마감 박스 */}
        <section className="flex flex-col gap-3 rounded-2xl border border-border-light bg-bg p-4 shadow-card">
          <div className="flex flex-wrap gap-2">
            {post.tags.length === 0 ? (
              <span className="text-[13px] text-text-tertiary">태그 없음</span>
            ) : (
              post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[13px] font-medium text-text-secondary"
                >
                  # {tag}
                </span>
              ))
            )}
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-text-secondary">
              작성자 : {getName(post.writerIdx)}
            </span>
            <span className="text-text-secondary">
              마감 기한 : {post.duedate}
            </span>
          </div>

          {/* 작성자 전용 — 모집 상태 토글 */}
          {isAuthor && (
            <button
              type="button"
              onClick={() => void handleToggleStatus()}
              disabled={isChangingStatus}
              className={`mt-1 h-9 self-end rounded-lg px-4 text-[13px] font-semibold text-text-inverse active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                isRecruiting ? 'bg-neutral-42' : 'bg-success'
              }`}
            >
              {isChangingStatus
                ? '변경 중...'
                : isRecruiting
                  ? '모집 마감하기'
                  : '다시 모집하기'}
            </button>
          )}
        </section>

        {/* 내용설명 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-text-primary">내용설명</h2>
          <div className="min-h-30 whitespace-pre-wrap rounded-2xl border border-border-light bg-bg p-4 text-[14px] leading-relaxed text-text-primary shadow-card">
            {post.text}
          </div>
        </section>

        {/* 모집 역할 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-text-primary">모집 역할</h2>
          <div className="flex flex-col gap-3">
            {accepts.length === 0 ? (
              <p className="rounded-2xl border border-border-light bg-bg p-4 text-center text-[13px] text-text-tertiary shadow-card">
                모집 역할이 없습니다.
              </p>
            ) : (
              accepts.map((role) => {
                // 내가 신청한 자리(또는 지급 완료 등)면 "지원 완료" 도장 표시
                const showStamp = role.uidx === uidx && role.uidx !== null;
                return (
                  <div
                    key={role.aidx}
                    className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-border-light bg-bg p-4 shadow-card"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-semibold text-text-primary">
                        {role.role}
                      </span>
                      <span className="text-[13px] font-medium text-text-secondary">
                        🪙 {role.point} 코인
                      </span>
                    </div>

                    {/* 시안 — 내가 신청한 자리에 "지원 완료" 도장 */}
                    {showStamp && (
                      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-md border-2 border-neutral-65 bg-bg-subtle/80 px-3 py-1 text-[14px] font-bold text-neutral-65 opacity-80">
                        지원 완료
                      </div>
                    )}

                    {renderRoleButton(role)}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 댓글 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-text-primary">댓글</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="내용을 입력하세요."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSubmitComment();
                }
              }}
              className="h-11 flex-1 rounded-xl border border-border-light bg-bg px-4 text-[14px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-primary"
            />
            <button
              type="button"
              onClick={() => void handleSubmitComment()}
              disabled={!commentText.trim() || isSubmittingComment}
              className="h-11 rounded-xl bg-neutral-10 px-5 text-[14px] font-semibold text-text-inverse active:scale-95 disabled:bg-border disabled:text-text-tertiary disabled:cursor-not-allowed"
            >
              {isSubmittingComment ? '등록 중...' : '등록'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {comments.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-text-tertiary">
                아직 댓글이 없습니다.
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.cidx}
                  className="flex flex-col gap-2 rounded-2xl border border-border-light bg-bg p-4 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-text-inverse">
                      U
                    </div>
                    <span className="text-[13px] font-semibold text-text-primary">
                      {getName(c.writeidx)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap pl-11 text-[13px] text-text-secondary">
                    {c.text}
                  </p>

                  {/* 답글 토글 버튼 */}
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(replyingTo === c.cidx ? null : c.cidx);
                      setReplyText('');
                    }}
                    className="ml-11 self-start text-[12px] font-semibold text-text-secondary hover:text-primary"
                  >
                    {replyingTo === c.cidx ? '취소' : '답글'}
                  </button>

                  {/* 대댓글 입력창 */}
                  {replyingTo === c.cidx && (
                    <div className="ml-11 mt-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="답글을 입력하세요."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleSubmitReply(c.cidx);
                          }
                        }}
                        autoFocus
                        className="h-10 flex-1 rounded-lg bg-bg px-3 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSubmitReply(c.cidx)}
                        disabled={!replyText.trim() || isSubmittingReply}
                        className="h-10 rounded-lg bg-neutral-10 px-3 text-[13px] font-semibold text-text-inverse active:scale-95 disabled:bg-border disabled:text-text-tertiary disabled:cursor-not-allowed"
                      >
                        {isSubmittingReply ? '...' : '등록'}
                      </button>
                    </div>
                  )}

                  {/* 대댓글 목록 */}
                  {c.reply.length > 0 && (
                    <div className="ml-11 mt-2 flex flex-col gap-2 border-l-2 border-border pl-3">
                      {c.reply.map((r, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-[12px] font-semibold text-text-secondary">
                            {getName(r.writeidx)}
                          </span>
                          <p className="whitespace-pre-wrap text-[12px] text-text-secondary">
                            {r.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PostDetailPage;
