import { BrowserRouter, Routes, Link, Route, Navigate, useNavigate } from 'react-router-dom';
import Button from './components/Button/Button';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import PostListPage from './pages/PostList/PostListPage';
import PostDetailPage from './pages/PostDetail/PostDetailPage';
import PostCreatePage from './pages/PostCreate/PostCreatePage';
import ProfilePage from './pages/Profile/ProfilePage';
import { useAuthStore } from './store/authStore';

function HomePlaceholder() {
  const { uidx, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 bg-bg">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-text-primary text-3xl font-bold">가천 코인</h1>
        <p className="text-text-secondary">uidx: {uidx ?? "로그인 필요"}</p>
      </div>

      <div className="flex flex-col w-full max-w-[300px] gap-3">
        <Button onClick={() => navigate('/posts')} variant="outline" fullWidth>
          전체 게시글 보기
        </Button>
        <Button onClick={() => navigate('/posts/create')} variant="outline" fullWidth>
          게시글 작성하기
        </Button>
        <Button onClick={() => navigate('/profile')} variant="outline" fullWidth>
          내 프로필
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        {uidx ? (
          <Button variant="text" onClick={clearAuth} className="text-error">
            로그아웃
          </Button>
        ) : (
          <Link to="/login" className="text-primary font-semibold">
            로그인 하러가기
          </Link>
        )}
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/posts" element={<PostListPage />} />
        <Route path="/posts/create" element={<PostCreatePage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
