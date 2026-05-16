import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getProfilePoint, getProfileInfo, getProfileTag } from '../../api/profile';
import heroImg from '../../assets/hero.png';

const Profile = () => {
  const navigate = useNavigate();
  const { uidx, clearAuth } = useAuthStore();
  
  const [name, setName] = useState<string>('');
  const [gachonId, setGachonId] = useState<string>('');
  const [point, setPoint] = useState<number>(0);
  const [expertTitle, setExpertTitle] = useState<string>('타이틀 없음');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!uidx) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const reqData = { uidx };
        
        const [infoRes, pointRes, tagRes] = await Promise.allSettled([
          getProfileInfo(reqData),
          getProfilePoint(reqData),
          getProfileTag(reqData)
        ]);

        if (infoRes.status === 'fulfilled' && infoRes.value.res_status !== false) {
          setName(infoRes.value.name || '알 수 없음');
          setGachonId(infoRes.value.gachon_id || '-');
        } else {
          setName('알 수 없음');
          setGachonId('-');
        }
        
        if (pointRes.status === 'fulfilled' && pointRes.value.res_status && pointRes.value.point !== undefined) {
          setPoint(pointRes.value.point);
        }

        if (tagRes.status === 'fulfilled' && tagRes.value.res_status) {
          const t = tagRes.value;
          const categories = [
            { key: 'exercise', name: '운동', count: t.exercise || 0 },
            { key: 'study', name: '공부', count: t.study || 0 },
            { key: 'music', name: '음악', count: t.music || 0 },
            { key: 'game', name: '게임', count: t.game || 0 },
            { key: 'clean', name: '청소', count: t.clean || 0 },
          ];
          
          const maxCount = Math.max(...categories.map(c => c.count));

          if (maxCount === 0) {
            setExpertTitle('타이틀 없음');
          } else {
            const maxCategories = categories.filter(c => c.count === maxCount);
            const selectedCategory = maxCategories[Math.floor(Math.random() * maxCategories.length)];
            
            let rank = '뉴비';
            if (maxCount >= 100) rank = '전문가';
            else if (maxCount >= 50) rank = '숙련가';
            else if (maxCount >= 15) rank = '수습자';
            else if (maxCount >= 5) rank = '초보자';
            
            setExpertTitle(`${selectedCategory.name} ${rank}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('일부 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [uidx, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Icon components for the list items
  const ConnectedIcon = () => (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-text-inverse">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
    </div>
  );

  const VersionIcon = () => (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-text-tertiary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    </div>
  );

  const PointIcon = () => (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-text-tertiary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
    </div>
  );

  const LogoutIcon = () => (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-text-tertiary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-subtle">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-bg-subtle pb-10 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary-light">
          <img
            src={heroImg}
            alt="Logo"
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="text-text-primary" aria-label="알림">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-text-inverse" aria-label="프로필">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>
      </header>

      <main className="flex flex-col px-6 pt-4">
        {error && (
          <div className="mb-4 rounded-xl border border-red-90 bg-red-95 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {/* Profile Avatar & Name */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-text-inverse shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <button className="mb-3 rounded-full border border-border bg-bg px-4 py-1 text-sm font-medium text-text-primary shadow-sm">
            {expertTitle}
          </button>
          <h2 className="text-xl font-bold text-text-primary">
            {name === '알 수 없음' ? '홍길동' : name}님
          </h2>
        </div>

        {/* List Menu */}
        <div className="flex flex-col gap-3">
          {/* 연결된 계정 */}
          <div className="flex items-center justify-between rounded-2xl border border-border-light bg-bg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <ConnectedIcon />
              <span className="text-[15px] font-bold text-text-primary">연결된 계정</span>
            </div>
            <span className="text-[14px] font-medium text-text-secondary">
              {gachonId === '-' ? 'gachon_student' : gachonId}
            </span>
          </div>

          {/* 앱 버전 */}
          <div className="flex items-center justify-between rounded-2xl border border-border-light bg-bg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <VersionIcon />
              <span className="text-[15px] font-bold text-text-primary">앱 버전</span>
            </div>
            <span className="text-[14px] font-medium text-text-secondary">ver 1.0</span>
          </div>

          {/* 포인트 */}
          <div className="flex items-center justify-between rounded-2xl border border-border-light bg-bg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <PointIcon />
              <span className="text-[15px] font-bold text-text-primary">포인트</span>
            </div>
            <span className="text-[14px] font-medium text-text-secondary">
              {point.toLocaleString()}
            </span>
          </div>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between rounded-2xl border border-border-light bg-bg p-4 text-left shadow-sm active:bg-bg-subtle"
          >
            <div className="flex items-center gap-4">
              <LogoutIcon />
              <span className="text-[15px] font-bold text-text-primary">로그아웃</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
