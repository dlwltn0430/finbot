import { ChatMessage } from '@/api/chat';

import { ChatbotResponseRenderer } from './ChatbotResponseRenderer';
import { Loading } from './Loading';

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
      className={`mb-[52px] w-fit rounded-[32px] font-[500] text-black ${
        message.role === 'user'
          ? 'ml-auto bg-[#FAF8F6] px-[20px] py-[12px]'
          : 'mr-auto'
      }`}
    >
      {Array.isArray(message.content) ? (
        <ChatbotResponseRenderer />
      ) : (
        // <ChatbotResponseRenderer blocks={responseMock} /> // TODO: 챗봇의 답변
        <>
          {/* 사용자의 질문 */}
          {message.content}

          {isStreaming && message.role === 'assistant' && isLastMessage && (
            <div className="relative mx-auto mt-[86px] w-[720px]">
              <Loading />
            </div>
          )}
        </>
      )}
    </div>
  );
};
