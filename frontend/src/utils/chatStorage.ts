import { ChatDetailItem } from '@/api/chat';

// TODO:
export interface ChatHistoryItem {
  chat_id: string;
  title: string;
  messages: ChatDetailItem[];
  createdAt: string;
}

// TODO: 인터페이스 이름 변경 필요, 추후 로직 수정 필요
export interface ChatSidebarItem {
  chat_id: string; // TODO: 컨벤션대로 chatId로 작성하면 배열 돌면서 다 바꿔줘야 하는 문제 있음 -> chat_id로 임시 사용
  title: string;
  createdAt: string;
}
