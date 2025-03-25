import { chatMock } from '@/mock/mock';
import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | string;
  content: string;
}

export interface ChatRequest {
  uuid: string;
  question: string;
  messages: ChatMessage[];
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  cached_prompt_tokens: number;
  total_tokens: number;
}

export interface ChatResponse extends ChatRequest {
  title: string;
  answer: string;
  usage: ChatUsage;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const devMode = import.meta.env.DEV;

export const sendChatMessage = async (
  data: ChatRequest
): Promise<ChatResponse> => {
  if (devMode) return chatMock;

  const response = await axios.post<ChatResponse>(
    `${API_BASE_URL}/api/chat`,
    data
  );

  return response.data;
};
