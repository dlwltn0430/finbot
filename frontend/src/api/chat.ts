import { fetchInstance } from './fetchInstance';

// 대화 요청
export interface ChatRequestBody {
  chat_id?: string | null;
  message: string;
}

type ChatStatus = 'pending' | 'response' | 'stop' | 'failed';

export interface ChatProduct {
  product_type: string | null;
  description: string | null;
  institution: string | null;
  details: string | null;
  tags: string[] | null;
  options: { category: string; value: string }[] | null;
}

export interface ChatContent {
  message?: string;
  products?: ChatProduct[];
}

export interface SSEChatResponse {
  chat_id: string;
  status: ChatStatus;
  content: ChatContent | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: ChatContent;
}

export const createChatStream = (
  body: ChatRequestBody,
  onMessage: (data: SSEChatResponse) => void
) => {
  const controller = new AbortController();

  fetch(`/api/v1/chats`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
    },
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    if (!reader) return;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      chunk.split('\n').forEach((line) => {
        if (line.startsWith('data: ')) {
          const jsonString = line.replace('data: ', '').trim();
          if (jsonString === '[DONE]') {
            controller.abort();
            return;
          }

          try {
            const parsed: SSEChatResponse = JSON.parse(jsonString);
            onMessage(parsed);
          } catch (err) {
            console.error('파싱 오류', err);
          }
        }
      });
    }
  });

  return () => {
    controller.abort();
  };
};

// 전체 대화 목록
export interface ChatListItem {
  title: string;
  chat_id: string;
}

export interface ChatListResponse {
  size: number;
  offset: number;
  items: ChatListItem[];
}

export const getChatList = async (
  offset = 0,
  size = 20
): Promise<ChatListResponse> => {
  return await fetchInstance.get('/api/v1/chats', {
    params: { offset, size },
  });
};

// 상세 대화 내역
