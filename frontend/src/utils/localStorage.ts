import { ChatMessage } from '@/api/chat';

export const saveChatToLocal = (chat: {
  title: string;
  messages: ChatMessage[];
}) => {
  const prev = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  localStorage.setItem('chatHistory', JSON.stringify([...prev, chat]));
};

export const getChatHistory = () => {
  return JSON.parse(localStorage.getItem('chatHistory') || '[]');
};
