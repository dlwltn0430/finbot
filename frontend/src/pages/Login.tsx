
export const LoginPage = () => {

  const loginUrl = `/api/v1/auth/kakao/login`
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
