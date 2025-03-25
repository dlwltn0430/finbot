import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
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

export interface ChatResponse {
  uuid: string;
  title: string;
  answer: string;
  question: string;
  messages: ChatMessage[];
  usage: ChatUsage;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendChatMessage = async (
  data: ChatRequest
): Promise<ChatResponse> => {
  const response = await axios.post<ChatResponse>(
    `${API_BASE_URL}/api/chat`,
    data
  );

  return response.data;
};
