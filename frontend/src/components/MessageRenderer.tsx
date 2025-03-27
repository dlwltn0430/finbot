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
        <div key={i} className="text-base leading-relaxed text-[#1B1B1B]">
          <p className="mb-2 whitespace-pre-wrap">{block.paragraph}</p>

          {block.urls.map((url, j) => (
            <a
              key={j}
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-[#7C7266] underline"
            >
              <img src={linkIcon} alt="링크 아이콘" className="h-5 w-5" />
              <span className="text-sm font-medium">참고 페이지 바로가기</span>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
};
