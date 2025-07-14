import { ChatSidebarItem } from '@/utils/chatStorage';
import { create } from 'zustand';

interface ChatListState {
  chatList: ChatSidebarItem[];
  setChatList: (list: ChatSidebarItem[]) => void;
  updateTitle: (chat_id: string, title: string) => void;
}

export const useChatListStore = create<ChatListState>((set) => ({
  chatList: [],
  setChatList: (newList) => {
    set({
      chatList: newList.map((item) => ({
        ...item,
        createdAt: new Date().toISOString(),
      })),
    });
  },
  updateTitle: (chat_id, title) =>
    set((state) => {
      const updated = [...state.chatList];
      const index = updated.findIndex((item) => item.chat_id === chat_id);

      if (index !== -1) {
        updated[index] = { ...updated[index], title };
      } else {
        updated.unshift({
          chat_id,
          title,
          createdAt: new Date().toISOString(),
        });
      }

      return { chatList: updated };
    }),
}));
