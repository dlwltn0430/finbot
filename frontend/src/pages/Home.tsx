import { useEffect, useRef, useState } from 'react';

import { getChatHistory } from '@/utils/chatStorage';

import { useChat } from '@/hooks/useChat';

import { ChatInput } from '@/components/ChatInput';
import { MessageItem } from '@/components/MessageItem';
import { Sidebar } from '@/components/Sidebar';

export const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    selectChat,
    startNewChat,
    isStreaming,
    chatHistory,
    setChatHistory,
    messages,
    input,
    setInput,
    sendMessage,
    cancelStreamingResponse,
  } = useChat();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // typingText 제외

  useEffect(() => {
    const history = getChatHistory();
    setChatHistory(history);
  }, [setChatHistory]); // setChatHistory를 의존성 배열에 추가

  useEffect(() => {
    const history = getChatHistory();
    if (history.length > 0) {
      const last = history[history.length - 1];
      selectChat(last.id, last.messages);
    } else {
      startNewChat();
    }
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        startNewChat={startNewChat}
        chatHistory={chatHistory}
        onChatSelect={selectChat}
      />

      <div
        className={`ml-80 flex h-screen flex-1 flex-col items-center px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 2xl:px-32 ${
          messages.length === 0
            ? 'justify-center'
            : 'relative pb-[200px] pt-[100px]'
        }`}
      >
        {messages.length === 0 && (
          <div className="mb-9 text-center">
            <h2 className="text-3xl font-semibold text-[#7C7266]">
              무엇을 도와드릴까요?
            </h2>
          </div>
        )}

        <div
          className={`w-full max-w-screen-lg ${
            messages.length === 0 ? '' : 'flex-1 overflow-y-auto pb-[36px]'
          }`}
        >
          {messages.map((msg, i) => (
            <MessageItem
              key={i}
              message={msg}
              isStreaming={isStreaming}
              isLastMessage={i === messages.length - 1}
            />
          ))}

          <div ref={bottomRef} />

          <div
            className={`${
              messages.length === 0
                ? 'flex items-center justify-center border-t'
                : 'absolute bottom-0 left-0 w-full border-t bg-white px-20 py-5'
            }`}
          >
            <ChatInput
              input={input}
              setInput={setInput}
              isStreaming={isStreaming}
              onSend={sendMessage}
              onCancel={cancelStreamingResponse}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
