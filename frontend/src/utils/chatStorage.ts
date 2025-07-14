// import { v4 as uuidv4 } from 'uuid';

import { ChatMessage } from '@/api/chat';

// TODO:
export interface ChatHistoryItem {
  chat_id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

// TODO: 인터페이스 이름 변경 필요, 추후 로직 수정 필요
export interface ChatSidebarItem {
  chat_id: string; // TODO: 컨벤션대로 chatId로 작성하면 배열 돌면서 다 바꿔줘야 하는 문제 있음 -> chat_id로 임시 사용
  title: string;
  createdAt: string;
}

// export const saveChatToLocal = (
//   id: string,
//   updatedChat: { title: string; messages: ChatMessage[] }
// ) => {
//   const prev = getChatHistory();
//   const next = prev.map((chat) =>
//     chat.id === id ? { ...chat, ...updatedChat } : chat
//   );
//   localStorage.setItem('chatHistory', JSON.stringify(next));
// };

// export const getChatHistory = (): ChatHistoryItem[] => {
//   const raw = JSON.parse(
//     localStorage.getItem('chatHistory') || '[]'
//   ) as Partial<ChatHistoryItem>[];

//   return raw.map((chat) => ({
//     id: chat.id ?? uuidv4(),
//     title: chat.title ?? '',
//     messages: chat.messages ?? [],
//     createdAt: chat.createdAt || new Date().toISOString(),
//   }));
// };
