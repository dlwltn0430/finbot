import { ChatMessage } from '@/api/chat';

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
}[] => {
  return JSON.parse(localStorage.getItem('chatHistory') || '[]');
};
