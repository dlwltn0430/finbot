import { useEffect, useRef, useState } from 'react';
import { useChatListStore } from '@/stores/chatListStore';
import { useChat } from '@/hooks/useChat';
import { ChatInput } from '@/components/ChatInput';
import { MessageItem } from '@/components/MessageItem';
import { Sidebar } from '@/components/Sidebar';
import { useChatList } from '@/hooks/useChatList';
import { useParams } from 'react-router-dom';
import { getChatDetail } from '@/api/chat';

export const HomePage = () => {
  const { data: chatListData } = useChatList();
  const setChatList = useChatListStore((state) => state.setChatList);

  useEffect(() => {
    if (chatListData?.items) {
      setChatList(
        chatListData.items.map((item) => ({
          ...item,
          createdAt: new Date().toISOString(),
        }))
      );
    }
  }, [chatListData, setChatList]);

  const { chatId } = useParams();
  const {
    messages,
    pendingMessage,
    isStreaming,
    input,
    setMessages,
    setInput,
    sendMessage,
    cancelStreamingResponse,
  } = useChat();

  useEffect(() => {
    if (chatId) {
      (async () => {
        const { items } = await getChatDetail(chatId);
        setMessages(items);
        console.log(items);
      })();
    } else {
      setMessages([]);
    }
  }, [chatId, setMessages]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-white">
      <div className="fixed right-[60px] top-[36px] z-50 flex items-center gap-[8px]">
        <div className="h-8 w-8 rounded-full bg-[#D9D9D9]" />
        <span className="text-[16px] font-[700] text-[#333534]">
          이용자 이름
        </span>
      </div>

      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`ml-[76px] flex h-screen flex-1 flex-col items-center transition-all duration-300 ${messages.length === 0 ? 'justify-center' : 'relative pb-[200px] pt-[144px]'}`}
      >
        {messages.length === 0 && (
          <div className="mb-[24px] text-center">
            <h2 className="text-[32px] font-[600] text-[#5D5F62]">
              무엇을 도와드릴까요?
            </h2>
          </div>
        )}

        <div
          className={`w-full max-w-[800px] ${
            messages.length === 0 ? '' : 'flex-1 overflow-y-auto'
          }`}
        >
          {messages.map((m, i) => (
            <MessageItem key={i} chatMessage={m} />
          ))}

          {pendingMessage && (
            <MessageItem
              chatMessage={{
                role: 'assistant',
                content: { message: pendingMessage },
              }}
            />
          )}

          <div ref={bottomRef} />

          <div
            className={`${
              messages.length === 0
                ? 'flex items-center justify-center'
                : 'absolute bottom-0 left-0 w-full py-5'
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
