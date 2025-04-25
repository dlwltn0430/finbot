import { ChatMessage } from '@/api/chat';

import { ChatbotResponseRenderer } from './ChatbotResponseRenderer';

interface ChatMessageProps {
  message: ChatMessage;
  isStreaming: boolean;
  isLastMessage: boolean;
}

export const MessageItem = ({
  message,
  isStreaming,
  isLastMessage,
}: ChatMessageProps) => {
  return (
    <div
      className={`mb-8 w-fit max-w-[70%] rounded-[32px] px-7 py-3 font-medium leading-7 text-[#1B1B1B] ${
        message.role === 'user' ? 'ml-auto bg-[#FAF8F6]' : 'mr-auto'
      }`}
    >
      {Array.isArray(message.content) ? (
        <ChatbotResponseRenderer blocks={message.content} /> // 챗봇의 답변
      ) : (
        <>
          {/* 사용자의 질문 */}
          {message.content}

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
