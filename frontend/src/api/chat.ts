// import { chatMock } from '@/mock/mock';
import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | string;
  content: string | ChatContent[];
}

export interface ChatContent {
  paragraph: string;
  urls: string[];
}

export interface ChatRequest {
  uuid: string;
  question: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  title: string;
  question: string;
  answer: ChatContent[];
  messages: ChatMessage[];
}

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const devMode = import.meta.env.DEV;

export const sendChatMessage = async (
  data: ChatRequest
): Promise<ChatResponse> => {
  // if (devMode) return chatMock;

  const response = await axios.post<ChatResponse>(`/api/chat`, data);
  // console.log(response.data);
  return response.data;
};
