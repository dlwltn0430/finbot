import { useEffect } from 'react';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { RouterPath } from '@/routes/path';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 액세스 토큰 발급에 사용되는 일회용 코드
  const ticket = searchParams.get('ticket');

  useEffect(() => {
    if (ticket === null) {
      return;
    }

    fetch('/api/v1/auth/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ticket }),
    }).then((res) => {
      if (res.ok) {
        navigate('/');
      } else {
        alert('로그인 실패');
        navigate('/');
      }
    });
  }, []);

  const loginUrl = `/api/v1/auth/kakao/login`;

  if (ticket !== null) {
    return <></>;
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center">
      <div>
        <h1 className="mb-[16px] text-center text-[36px] font-[600]">
          금쪽이 시작하기
        </h1>
        <h2 className="mb-[40px] text-center text-[16px] font-[400] text-gray-600">
          금융 어시스턴트 금쪽이와 함께,
          <br />
          스마트한 금융 생활을 시작해 보세요!
        </h2>
        <div className="flex flex-col gap-[12px]">
          <a
            href={loginUrl}
            className="h-[52px] w-[420px] rounded-[8px] bg-[#FEE500] px-[20px] py-[10px] text-center text-[18px] font-[500] text-gray-800"
          >
            카카오로 시작하기
          </a>
          <Link
            to={RouterPath.HOME}
            className="h-[52px] w-[420px] rounded-[8px] bg-gray-100 px-[20px] py-[10px] text-center text-[18px] font-[500] text-gray-800"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};
