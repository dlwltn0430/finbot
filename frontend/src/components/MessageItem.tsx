import { ChatContent } from '@/api/chat';

import { ChatbotResponseRenderer } from './ChatbotResponseRenderer';
import { PendingTaskLoader } from './PendingTaskLoader';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: ChatContent;
}

interface MessageItemProps {
  chatMessage: ChatMessage;
}

export const MessageItem = ({ chatMessage }: MessageItemProps) => {
  const isUser = chatMessage.role === 'user';
  const { message: textContent, products } = chatMessage.content || {};

  return (
    <div
      className={`mb-[52px] w-fit rounded-[32px] font-[500] text-black ${
        isUser ? 'ml-auto bg-[#FAF8F6] px-[20px] py-[12px]' : 'mr-auto'
      }`}
    >
      {/* 사용자 메시지 */}
      {isUser && textContent}

      {/* 챗봇 메시지 - status: pending */}
      {!isUser && !products && textContent?.endsWith('하고 있습니다.') && (
        <div className="relative mx-auto mt-[86px] w-[720px]">
          <PendingTaskLoader pendingMessage={textContent} />
        </div>
      )}

      {/* 챗봇 메시지 - status: response */}
      {!isUser && products && <ChatbotResponseRenderer products={products} />}
    </div>
  );
};
