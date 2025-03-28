import { ChatContent } from '@/api/chat';

import linkIcon from '@/assets/link-icon.svg';

interface MessageRendererProps {
  blocks: ChatContent[];
}

export const MessageRenderer = ({ blocks }: MessageRendererProps) => {
  console.log({ blocks });
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="font-[Pretendard] font-[500] leading-[28px] text-[#1B1B1B]"
        >
          <p className="mb-2 whitespace-pre-wrap">{block.paragraph}</p>

          {block.urls.map((url, j) => (
            <a
              key={j}
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 text-[#7C7266] underline"
            >
              <img src={linkIcon} alt="링크 아이콘" className="h-4 w-4" />
              <span className="text-[12px] font-[400]">
                참고 페이지 바로가기
              </span>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
};
