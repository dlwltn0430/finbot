import backArrow from '@/assets/memory/back-arrow.svg';
import trash from '@/assets/memory/trash.svg';

interface MemoryPanelProps {
  onClose: () => void;
}

export const MemoryPanel = ({ onClose }: MemoryPanelProps) => {
  return (
    <div className="fixed bottom-0 left-1/2 right-0 top-[108px] z-50 w-full max-w-[1112px] -translate-x-1/2 bg-white">
      <div className="mb-[28px] flex items-center">
        <img
          src={backArrow}
          alt="뒤로가기"
          onClick={onClose}
          className="h-[32px] w-[32px] cursor-pointer"
        />
        <div className="mx-auto text-center">
          <div className="text-[24px] font-[700] text-[#5D5F62]">
            저장된 메모리 관리
          </div>
          <div className="mt-[4px] text-[12px] font-[400] text-gray5">
            저장된 메모리는 지워지지 않으며, 이후 채팅에 도움을 줄 수 있습니다.
          </div>
        </div>
      </div>

      <div className="relative max-h-[80vh] rounded-[24px] border border-gray2 pb-[36px] pl-[36px] pr-[24px] pt-[36px] shadow-[0_0_12px_0_rgba(27,27,27,0.04)]">
        <div className="custom-scroll max-h-[60vh] overflow-y-auto">
          <div className="min-w-[calc(100%-8px) mr-[8px]">
            {[...Array(10)].map((_, idx, arr) => (
              <div
                key={idx}
                className={`flex items-center justify-between border-b border-gray2 ${idx === 0 ? 'pb-[12px]' : idx === arr.length - 1 ? 'pt-[12px]' : 'py-[12px]'}`}
              >
                <span className="text-[12px] font-[400] leading-[16px] text-black">
                  메모리 내용입니다. 내용은 최대 n줄까지 들어갑니다. <br />
                  메모리 내용입니다. 내용은 최대 n줄까지 들어갑니다.
                </span>
                <img
                  src={trash}
                  alt="삭제"
                  className="h-[24px] w-[24px] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
