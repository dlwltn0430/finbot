import { RouterPath } from "@/routes/path";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export const LoginPage = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate()

  // 액세스 토큰 발급에 사용되는 일회용 코드
  const ticket = searchParams.get('ticket'); 

  useEffect(() => {
    if (ticket === null) {
      return
    }

    fetch("/api/v1/auth/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ ticket })
    }).then(res => {
      if (res.ok) {
        navigate("/")
      } else {
        alert("로그인 실패")
        navigate("/")
      }
    })
  }, [])

  const loginUrl = `/api/v1/auth/kakao/login`

  if (ticket !== null) {
    return <></>
  }

  return (
    <div className="relative h-screen w-screen flex items-center justify-center">
      <div>
        <h1 className="text-[36px] font-[600] text-center mb-[16px]">금쪽이 시작하기</h1>
        <h2 className="text-[16px] font-[400] text-center mb-[40px] text-gray-600">
          금융 어시스턴트 금쪽이와 함께,<br/>
          스마트한 금융 생활을 시작해 보세요!
        </h2>
        <div className="flex flex-col gap-[12px]">
          <a
            href={loginUrl}
            className="text-center rounded-[8px] py-[10px] px-[20px] w-[420px] h-[52px] bg-[#FEE500] font-[500] text-[18px] text-gray-800"
          >
            카카오로 시작하기
          </a>
          <Link
            to={RouterPath.HOME}
            className="text-center rounded-[8px] py-[10px] px-[20px] w-[420px] h-[52px] bg-gray-100 font-[500] text-[18px] text-gray-800"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};
