import { ChatMessage } from '@/api/chat';

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export const saveChatToLocal = (
  id: string,
  updatedChat: { title: string; messages: ChatMessage[] }
) => {
  const prev = getChatHistory();
  const next = prev.map((chat) =>
    chat.id === id ? { ...chat, ...updatedChat } : chat
  );
  localStorage.setItem('chatHistory', JSON.stringify(next));
};

export const getChatHistory = (): {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}[] => {
  const raw = JSON.parse(
    localStorage.getItem('chatHistory') || '[]'
  ) as Partial<ChatHistoryItem>[];

  return raw.map((chat) => ({
    id: chat.id ?? crypto.randomUUID(),
    title: chat.title ?? '',
    messages: chat.messages ?? [],
    createdAt: chat.createdAt || new Date().toISOString(),
  }));
};
