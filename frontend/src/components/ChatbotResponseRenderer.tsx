import ReactMarkdown from 'react-markdown';

import { ChatContent } from '@/api/chat';

import linkIcon from '@/assets/link-icon.svg';

interface ChatbotResponseRendererProps {
  blocks: ChatContent[];
}

export const ChatbotResponseRenderer = ({
  blocks,
}: ChatbotResponseRendererProps) => {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="font-[Pretendard] font-[500] leading-[28px] text-[#1B1B1B]"
        >
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-10 text-[#7C7266] underline"
                >
                  {children}
                </a>
              ),
              p: ({ children }) => (
                <p className="mb-2 whitespace-pre-wrap">{children}</p>
              ),
            }}
          >
            {block.paragraph}
          </ReactMarkdown>

          {block.urls?.map((url, j) => (
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
