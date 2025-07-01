import { ChatHistoryItem } from '@/utils/chatStorage';

import { ChatMessage } from '@/api/chat';

import logo from '@/assets/logo.svg';
import newChat from '@/assets/new-chat.svg';
import policyIcon from '@/assets/policy.svg';
import prevIcon from '@/assets/prev.svg';

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
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === yesterday.toDateString()) return '어제';
    if (date > oneWeekAgo) return '지난 7일';

    return '이전';
  };

  const groupChatsByDate = (chats: ChatHistoryItem[]) =>
    chats.reduce(
      (acc, chat) => {
        const label = formatDateLabel(chat.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(chat);
        return acc;
      },
      {} as Record<string, ChatHistoryItem[]>
    );

  return (
    <div>
      {/* 접힌 상태 */}
      <div className="border-gray2 fixed left-0 top-0 z-30 flex h-screen w-[100px] flex-col items-center justify-between border-r bg-[#FBFBFB] pb-[44px] pt-[36px]">
        <div className="flex h-full flex-col items-center">
          <img src={logo} alt="logo" className="w-15" />
          <div
            className="text-gray3 hover:text-gray5 mt-[52px] flex cursor-pointer flex-col items-center"
            onClick={toggleSidebar}
          >
            <img src={prevIcon} alt="이전 기록" className="w-13" />
            <span>이전 기록</span>
          </div>
          <div className="text-gray3 hover:text-gray5 mt-[24px] flex cursor-pointer flex-col items-center">
            <img src={policyIcon} alt="정책" className="w-13" />
            <span>정책</span>
          </div>
        </div>

        <button onClick={startNewChat}>
          <img src={newChat} alt="new" className="w-13" />
        </button>
      </div>

      {/* 펼친 상태 */}
      <div
        className={`border-gray2 absolute left-[100px] top-0 z-20 h-full w-[296px] transform overflow-y-auto border-r bg-[#FBFBFB] px-[24px] pt-[64px] transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {Object.entries(groupChatsByDate([...chatHistory].reverse())).map(
          ([label, chats]) =>
            chats.length > 0 && (
              <div key={label} className="mb-5">
                <h3 className="text-main mb-[12px] text-[12px] font-[600]">
                  {label}
                </h3>
                <ul className="px-[12px]">
                  {chats.map((chat) => (
                    <li
                      key={chat.id}
                      className="mb-1 cursor-pointer truncate py-[8px] text-[16px] font-[400] text-[#242525]"
                      onClick={() => onChatSelect(chat.id, chat.messages)}
                    >
                      {chat.title || '새로운 대화'}
                    </li>
                  ))}
                </ul>
              </div>
            )
        )}
      </div>
    </div>
  );
};
