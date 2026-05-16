import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import PostCard from '../../components/post/PostCard';
import Button from '../../components/Button/Button';
import type { Post } from '../../types/post';
import { postApi } from '../../api/post';

const PostListPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postApi.getPosts();
        setPosts(response.posts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg relative">
      <Header title="전체 게시글" />
      
      <main className="flex flex-1 flex-col gap-3 p-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-text-secondary">로딩 중...</p>
          </div>
        ) : (posts?.length ?? 0) > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onClick={() => navigate(`/posts/${post.id}`)}
            />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-text-secondary">게시글이 없습니다.</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6">
        <Button 
          size="medium" 
          onClick={() => navigate('/posts/create')}
          className="shadow-lg rounded-full px-6"
        >
          + 글쓰기
        </Button>
      </div>
    </div>
  );
};

export default PostListPage;
