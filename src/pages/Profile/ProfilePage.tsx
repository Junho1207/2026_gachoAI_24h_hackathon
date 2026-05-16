import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Button from '../../components/Button/Button';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../api/user';
import type { User } from '../../types/post';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { uidx, clearAuth } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 실제 API 연동 시 uidx를 사용하거나 getMe 호출
        const data = await userApi.getMe();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Mock data if API fails (for demo purposes)
        setUser({
          id: uidx || 1,
          userId: 'gachon_user',
          name: '가천인',
          email: 'user@gachon.ac.kr',
          coin: 1250,
          tags: ['공부', '프로그래밍'],
          expertTitles: [
            { id: 1, tag: '프로그래밍', level: 'Gold', earnedAt: '2026-01-01' }
          ],
          createdAt: '2026-01-01'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (uidx) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [uidx]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (isLoading) return <div className="p-4 text-center">로딩 중...</div>;
  if (!uidx) return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6">
      <p className="text-text-secondary">로그인이 필요합니다.</p>
      <Button onClick={() => navigate('/login')}>로그인하러 가기</Button>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col bg-bg">
      <Header title="내 프로필" />
      
      <main className="flex flex-1 flex-col gap-6 p-4">
        <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-[20px] font-bold text-text-primary">{user?.name}</h2>
            <span className="text-[14px] text-text-secondary">{user?.email}</span>
          </div>
          
          <div className="mt-2 flex w-full flex-col gap-3 rounded-2xl bg-bg-subtle p-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-text-secondary">보유 코인</span>
              <span className="text-[18px] font-bold text-text-primary">🪙 {user?.coin?.toLocaleString()} 코인</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-[16px] font-semibold text-text-primary">내 관심 태그</h3>
          <div className="flex flex-wrap gap-2">
            {user?.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-neutral-94 px-3 py-1.5 text-[13px] text-text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-[16px] font-semibold text-text-primary">전문가 타이틀</h3>
          <div className="flex flex-col gap-2">
            {user?.expertTitles.map((title) => (
              <div key={title.id} className="flex items-center justify-between rounded-xl border border-border bg-bg p-3 px-4">
                <span className="text-[14px] font-medium text-text-primary">{title.tag}</span>
                <span className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                  title.level === 'Gold' ? 'bg-yellow-95 text-yellow-30' :
                  title.level === 'Silver' ? 'bg-neutral-94 text-neutral-42' : 'bg-orange-95 text-orange-34'
                }`}>
                  {title.level}
                </span>
              </div>
            ))}
            {user?.expertTitles.length === 0 && (
              <p className="text-[13px] text-text-disabled py-4 text-center">보유한 타이틀이 없습니다.</p>
            )}
          </div>
        </section>

        <div className="mt-auto pb-10 flex flex-col gap-3">
          <Button variant="outline" fullWidth onClick={() => alert('정보 수정 기능은 준비 중입니다.')}>
            회원 정보 수정
          </Button>
          <Button variant="text" fullWidth onClick={handleLogout} className="text-error hover:no-underline">
            로그아웃
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
