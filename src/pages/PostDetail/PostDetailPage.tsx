import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import TagChip from '../../components/common/TagChip';
import Button from '../../components/Button/Button';
import { postApi } from '../../api/post';
import { useAuthStore } from '../../store/authStore';
import type { Post, Participant } from '../../types/post';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { uidx } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        const data = await postApi.getPostById(Number(postId));
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const isAuthor = post?.author.id === uidx;

  const handleJoin = async (roleId: number) => {
    if (!postId) return;
    try {
      await postApi.joinPost(Number(postId), roleId);
      alert('참여 신청이 완료되었습니다.');
      // Refresh data
      const data = await postApi.getPostById(Number(postId));
      setPost(data);
    } catch (error) {
      console.error('Failed to join:', error);
      alert('참여 신청에 실패했습니다.');
    }
  };

  const handleParticipantAction = async (participantId: number, status: 'APPROVED' | 'REJECTED') => {
    if (!postId) return;
    try {
      await postApi.updateParticipantStatus(Number(postId), participantId, status);
      alert(status === 'APPROVED' ? '승인되었습니다.' : '거절되었습니다.');
      const data = await postApi.getPostById(Number(postId));
      setPost(data);
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  if (isLoading) return <div className="p-4 text-center">로딩 중...</div>;
  if (!post) return <div className="p-4 text-center">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="게시글 상세" />
      
      <main className="flex flex-1 flex-col gap-6 p-4">
        <section className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <h1 className="text-[22px] font-bold text-text-primary">{post.title}</h1>
            <StatusBadge status={post.status} />
          </div>
          
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagChip key={tag} name={tag} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">작성자 : {post.author.name}</span>
              <span className="text-error font-medium">마감 기한 : {post.deadline}</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[18px] font-semibold text-text-primary">내용설명</h2>
          <div className="min-h-[150px] rounded-2xl border border-border bg-white p-5 text-[15px] leading-relaxed text-text-primary">
            {post.content}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[18px] font-semibold text-text-primary">모집 역할</h2>
          <div className="flex flex-col gap-3">
            {post.roles.map((role) => {
              const myParticipation = post.participants.find(p => p.role.id === role.id && p.user.id === uidx);
              const isFull = role.currentCount >= role.maxCount;

              return (
                <div key={role.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold text-text-primary">{role.name}</h3>
                      <span className="text-[14px] font-medium text-text-secondary">🪙 {role.coinReward} 코인</span>
                    </div>
                    {isAuthor ? (
                      <div className="text-[12px] text-text-secondary">
                        {role.currentCount} / {role.maxCount} 명 모집됨
                      </div>
                    ) : myParticipation ? (
                      <div className={`rounded-lg px-3 py-1 text-[13px] font-semibold ${
                        myParticipation.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        myParticipation.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {myParticipation.status === 'APPROVED' ? '참가 중' :
                         myParticipation.status === 'REJECTED' ? '반려됨' : '대기 중'}
                      </div>
                    ) : (
                      <Button 
                        size="small" 
                        variant={isFull ? 'outline' : 'primary'}
                        disabled={isFull || post.status === 'COMPLETED'}
                        onClick={() => handleJoin(role.id)}
                      >
                        {isFull ? '모집 완료' : '신청하기'}
                      </Button>
                    )}
                  </div>
                  
                  {isAuthor && post.participants.filter(p => p.role.id === role.id).length > 0 && (
                    <div className="mt-2 border-t border-border pt-3">
                      <h4 className="mb-2 text-[13px] font-semibold text-text-secondary">신청자 목록</h4>
                      <div className="flex flex-col gap-2">
                        {post.participants.filter(p => p.role.id === role.id).map((p) => (
                          <div key={p.id} className="flex items-center justify-between rounded-lg bg-bg-subtle p-2 px-3">
                            <span className="text-[13px] text-text-primary">{p.user.name}</span>
                            {p.status === 'PENDING' ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleParticipantAction(p.id, 'APPROVED')} className="text-[12px] font-bold text-success">승인</button>
                                <button onClick={() => handleParticipantAction(p.id, 'REJECTED')} className="text-[12px] font-bold text-error">거절</button>
                              </div>
                            ) : (
                              <span className={`text-[12px] font-medium ${p.status === 'APPROVED' ? 'text-success' : 'text-error'}`}>
                                {p.status === 'APPROVED' ? '승인됨' : '거절됨'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 pb-10">
          <h2 className="text-[18px] font-semibold text-text-primary">댓글</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="내용을 입력하세요."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-bg-subtle px-4 text-[14px]"
            />
            <button className="h-[44px] rounded-xl bg-neutral-10 text-white px-5 text-[14px] font-semibold active:scale-95">작성</button>
          </div>
          <div className="flex flex-col gap-3">
            {/* Mock comments */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">U</div>
                <span className="text-[13px] font-semibold text-text-primary">user_name</span>
              </div>
              <p className="text-[13px] text-text-secondary pl-10">저도 참여하겠습니다!!!~!!!!</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PostDetailPage;
