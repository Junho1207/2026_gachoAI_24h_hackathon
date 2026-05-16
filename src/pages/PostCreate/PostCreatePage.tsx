import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import TextArea from '../../components/Input/TextArea';
import { postApi } from '../../api/post';
import { useAuthStore } from '../../store/authStore';

interface RoleInput {
  name: string;
  coinReward: number;
}

const PostCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { uidx } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [roles, setRoles] = useState<RoleInput[]>([{ name: '', coinReward: 0 }]);

  const availableTags = ['운동', '공부', '음악', '게임', '청소'];

  const handleAddRole = () => {
    setRoles([...roles, { name: '', coinReward: 0 }]);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index: number, field: keyof RoleInput, value: string | number) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const totalPoints = roles.reduce((sum, role) => sum + Number(role.coinReward), 0);

  const handleSubmit = async () => {
    if (!uidx) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const res = await postApi.createPost({
        uidx,
        title,
        content,
        deadline,
        tags,
        roles,
      });

      if (res.res_status) {
        navigate('/posts');
      } else {
        alert('게시글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('게시글 등록에 실패했습니다.');
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-bg-subtle">
      <Header title="게시글 작성" />
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="flex flex-1 flex-col gap-6 p-4"
      >
        <section className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-text-primary">제목</label>
          <Input 
            placeholder="제목을 입력하세요." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </section>

        <section className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-text-primary">내용설명</label>
          <TextArea 
            placeholder="예 : 해커톤 같이 참여하실 분들 모집합니다." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-[14px] font-semibold text-text-primary mr-2 self-center">#</span>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`h-8 rounded-full px-4 text-[13px] font-medium transition-colors ${
                  tags.includes(tag)
                    ? 'bg-primary text-text-inverse'
                    : 'border border-border-light bg-bg text-text-secondary'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-text-primary">모집역할 및 포인트 배분</h3>
            <button
              type="button"
              onClick={handleAddRole}
              className="text-[13px] font-medium text-text-secondary underline"
            >
              역할 추가
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {roles.map((role, index) => (
              <div
                key={index}
                className="relative flex flex-col gap-3 rounded-2xl border border-border-light bg-bg p-4 shadow-card"
              >
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(index)}
                    className="absolute right-3 top-3 text-text-disabled hover:text-text-secondary"
                    aria-label="역할 제거"
                  >
                    ✕
                  </button>
                )}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-text-primary">역할명</span>
                  <Input
                    placeholder="예 : 프론트엔드 개발자"
                    value={role.name}
                    onChange={(e) => handleRoleChange(index, 'name', e.target.value)}
                    className="h-10 rounded-lg"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-text-primary">포인트</span>
                  <Input
                    type="number"
                    placeholder="250P"
                    value={role.coinReward || ''}
                    onChange={(e) =>
                      handleRoleChange(index, 'coinReward', parseInt(e.target.value) || 0)
                    }
                    className="h-10 rounded-lg"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex h-13 items-center justify-center rounded-2xl border border-primary-light bg-primary-light/50">
            <span className="text-[15px] font-bold text-primary">
              총 포인트 : {totalPoints}P
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-text-primary">마감 기한 설정</label>
          <Input 
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </section>

        <div className="mt-auto pt-6">
          <Button type="submit" fullWidth size="large">
            게시글 등록
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostCreatePage;
