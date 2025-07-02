import { ChatMessage } from '@/api/chat';

import { ChatbotResponseRenderer } from './ChatbotResponseRenderer';

interface MessageItemProps {
  message: ChatMessage;
  isStreaming: boolean;
  isLastMessage: boolean;
}

export const MessageItem = ({
  message,
  isStreaming,
  isLastMessage,
}: MessageItemProps) => {
  return (
    <div
      className={`mb-[52px] w-fit rounded-[32px]  font-[500] text-black ${
        message.role === 'user' ? 'ml-auto bg-[#FAF8F6] px-[20px] py-[12px]' : 'mr-auto'
      }`}
    >
      {Array.isArray(message.content) ? (
        <ChatbotResponseRenderer />
      ) : (
        // <ChatbotResponseRenderer blocks={responseMock} /> // TODO: 챗봇의 답변
        <>
          {/* 사용자의 질문 */}
          {message.content}

          {/* TODO: */}
          {isStreaming && message.role === 'assistant' && isLastMessage && (
            <p className="mt-2 animate-pulse text-sm text-[#7C7266]">
              답변을 생성하는 중입니다
              <span className="animate-bounce">...</span>
            </p>
          )}
        </>
      )}
    </div>
  );
};
