import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Profile from './pages/Profile/Profile';
import Home from './pages/Home/Home';
import Layout from './components/Layout/Layout';
import PostListPage from './pages/PostList/PostListPage';
import PostDetailPage from './pages/PostDetail/PostDetailPage';
import PostCreatePage from './pages/PostCreate/PostCreatePage';

// Placeholder for missing pages in bottom nav
function EmptyPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-bg-subtle">
      <p className="text-lg font-bold text-text-tertiary">{title} 준비 중입니다.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Layout routes with bottom navigation */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/posts" element={<PostListPage />} />
          <Route path="/posts/create" element={<PostCreatePage />} />
          <Route path="/ranking" element={<EmptyPage title="랭킹" />} />
        </Route>

        {/* Detail pages without bottom navigation */}
        <Route path="/posts/:postId" element={<PostDetailPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
