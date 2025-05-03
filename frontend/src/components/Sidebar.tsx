import { useState } from 'react';

import { ChatHistoryItem } from '@/utils/chatStorage';

import { ChatMessage } from '@/api/chat';

import logo from '@/assets/logo.svg';
import newChatHover from '@/assets/new-chat-hover.svg';
import newChat from '@/assets/new-chat.svg';
import sidebarClose from '@/assets/sidebar-close.svg';
import sidebarOpen from '@/assets/sidebar-open.svg';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  startNewChat: () => void;
  chatHistory: ChatHistoryItem[];
  onChatSelect: (chatId: string, messages: ChatMessage[]) => void;
}

export const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  startNewChat,
  chatHistory,
  onChatSelect,
}: SidebarProps) => {
  const [isNewChatHovered, setIsNewChatHovered] = useState(false);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === yesterday.toDateString()) return '어제';
    if (date > oneWeekAgo) return '최근';

    return '이전 대화';
  };

  const groupChatsByDate = (chats: typeof chatHistory) =>
    chats.reduce(
      (acc, chat) => {
        const label = formatDateLabel(chat.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(chat);
        return acc;
      },
      {} as Record<string, typeof chatHistory>
    );

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-20 h-full w-80 transform bg-[#EAE6E3] transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between transition-opacity duration-300">
          {/* 사이드바 열린 상태 헤더 */}
          <div className="flex items-center justify-between py-10 pl-7 pr-10">
            <img src={logo} alt="KB 국민은행" className="w-auto" />
            <div className="flex items-center">
              <button onClick={toggleSidebar}>
                <img src={sidebarOpen} alt="사이드바 닫기" />
              </button>
              <img
                src={isNewChatHovered ? newChatHover : newChat}
                alt="새로운 대화 시작"
                onClick={startNewChat}
                onMouseEnter={() => setIsNewChatHovered(true)}
                onMouseLeave={() => setIsNewChatHovered(false)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* 채팅 내역 */}
          <div className="flex-1 overflow-auto pl-7 pr-10">
            {chatHistory.length === 0 ? (
              <p className="text-sm text-[#7C7266]">
                새로운 대화를 시작해보세요.
              </p>
            ) : (
              Object.entries(groupChatsByDate([...chatHistory].reverse())).map(
                ([label, chats]) =>
                  chats.length > 0 && (
                    <div key={label} className="mb-6">
                      <h2 className="mb-3 text-xs font-semibold text-[#7C7266]">
                        {label}
                      </h2>
                      {chats.map((chat) => (
                        <p
                          key={chat.id}
                          className="cursor-pointer truncate rounded-[8px] px-3 py-2 font-normal text-[#1B1B1B] hover:bg-[#D4CCC5]"
                          onClick={() => onChatSelect(chat.id, chat.messages)}
                        >
                          {chat.title || '새로운 대화'}
                        </p>
                      ))}
                    </div>
                  )
              )
            )}
          </div>
        </div>
      </div>

      {/* 사이드바 닫힌 상태 상단 헤더 */}
      {!isSidebarOpen && (
        <div className="fixed left-0 top-0 z-10 ml-7 mt-6 flex h-[60px] w-[260px] items-center justify-between rounded-xl bg-white px-3 py-4 shadow-[0px_0px_4px_0px_rgba(99,99,99,0.24)]">
          <img src={logo} alt="KB 국민은행" className="w-auto" />
          <div className="ml-2 flex items-center">
            <button onClick={toggleSidebar}>
              <img src={sidebarClose} alt="사이드바 열기" />
            </button>
            <img
              src={isNewChatHovered ? newChatHover : newChat}
              alt="새로운 대화 시작"
              onClick={startNewChat}
              onMouseEnter={() => setIsNewChatHovered(true)}
              onMouseLeave={() => setIsNewChatHovered(false)}
              className="cursor-pointer"
            />
          </div>
        </div>
      )}
    </>
  );
};
