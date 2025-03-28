import { useEffect, useRef, useState } from 'react';

import {
  ChatContent,
  ChatMessage,
  ChatResponse,
  sendChatMessage,
} from '@/api/chat';

import logo from '@/assets/logo.svg';
import newChat from '@/assets/new-chat.svg';
import sendIcon from '@/assets/send-icon.svg';
import sidebarClose from '@/assets/sidebar-close.svg';
import sidebarOpen from '@/assets/sidebar-open.svg';
import stopIcon from '@/assets/stop-icon.svg';

import { MessageRenderer } from './components/MessageRenderer';
import { getChatHistory, saveChatToLocal } from './utils/localStorage';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // TODO:
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { title: string; messages: ChatMessage[] }[]
  >([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [streamedTextContent, setStreamedTextContent] = useState<ChatContent[]>(
    []
  );

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    setStreamedText('');
    setStreamedTextContent([]);
    setLastResponse(null);

    try {
      const response = await sendChatMessage({
        uuid: 'test', // TODO: 사용 안하는 값
        question: input,
        messages: updatedMessages,
      });

      setLastResponse(response); // ✅ 저장
      setStreamedTextContent(response.answer); // ✅ 저장

      // streaming UI용 문자열 추출
      // 타이핑 효과
      let index = 0;
      const fullText = response.answer.map((a) => a.paragraph).join('\n\n');
      const typingInterval = setInterval(() => {
        setStreamedText(fullText.slice(0, ++index));
        if (index >= fullText.length) {
          clearInterval(typingInterval);
          setIsStreaming(false);
        }
      }, 10);

      // 미리 placeholder 메시지 추가
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    } catch (error) {
      console.error('챗봇 응답 실패:', error);
    }
  };

  const handleStop = () => {
    // TODO: 타이핑 중단, 상태 초기화 등 처리
    setIsStreaming(false);
    // TODO: 추가로 타이핑 인터벌 클리어할 수 있다면 그것도 처리
  };

  // 입력창 특정 px 전까지는 height 계속 늘어나다가 이후부터는 y축 스크롤
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // height 자동 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`; // 자동 높이 + 최대 높이 220px로 제한
    }
  }, [input]);

  useEffect(() => {
    if (!isStreaming && streamedText) {
      setMessages((prev) => {
        // 1. 챗봇 메시지를 마지막에 반영
        const updatedMessages = [...prev];

        // ✅ 응답에서 온 구조 사용
        const lastBotMessage = {
          role: 'assistant' as const,
          content: streamedTextContent,
        };

        updatedMessages[updatedMessages.length - 1] = lastBotMessage;

        // 2. 제목용 메시지
        const title = lastResponse?.title || '새로운 대화';

        // 4. 저장
        saveChatToLocal({
          title,
          messages: updatedMessages,
        });

        setChatHistory(getChatHistory());

        return updatedMessages;
      });
    }
  }, [isStreaming, streamedText, streamedTextContent, lastResponse]);

  const startNewChat = () => {
    setMessages([]);
    setStreamedText('');
    setInput('');
  };

  // 대화 목록 불러오기
  useEffect(() => {
    const history = getChatHistory();
    setChatHistory(history);
  }, []);

  // TODO: 삭제
  console.log(messages);

  return (
    <div className="flex h-screen bg-white">
      {/* 사이드바 */}
      <div
        className={`flex w-80 flex-col justify-center transition-all duration-300 ${isSidebarOpen ? 'h-screen bg-[#EAE6E3]' : 'ml-7 mt-8 h-[60px] rounded-xl bg-white px-3 py-4 shadow-[0px_0px_4px_0px_rgba(99,99,99,0.24)]'}`}
      >
        <div
          className={`flex items-center justify-between ${isSidebarOpen ? 'py-10 pl-7 pr-10' : ''}`}
        >
          <img
            src={logo}
            alt="KB 국민은행"
            className="w-auto transition-opacity duration-300"
          />

          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar}>
              <img
                src={isSidebarOpen ? sidebarOpen : sidebarClose}
                alt="사이드바 버튼"
              />
            </button>
            <img
              src={newChat}
              alt="새로운 대화 시작하기"
              onClick={startNewChat}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div
          className={`flex-1 overflow-auto pl-7 pr-10 ${isSidebarOpen ? 'block' : 'hidden'}`}
        >
          <h2 className="mb-3 text-xs font-semibold text-[#7C7266]">오늘</h2>
          {chatHistory.length === 0 ? (
            <p className="text-sm text-[#7C7266]">저장된 대화가 없습니다.</p>
          ) : (
            chatHistory.map((chat, i) => (
              <p
                key={i}
                className="cursor-pointer truncate px-3 py-2 font-normal text-[#1B1B1B]"
                onClick={() => setMessages(chat.messages)}
              >
                {chat.title}
              </p>
            ))
          )}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold text-[#7C7266]">
            무엇을 도와드릴까요?
          </h2>
        </div>

        <div className="flex max-h-[60vh] flex-col overflow-y-auto px-20 py-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-8 w-fit max-w-[70%] rounded-[32px] px-7 py-4 font-medium leading-7 text-[#1B1B1B] ${msg.role === 'user' ? 'ml-auto bg-[#FAF8F6]' : 'mr-auto'}`}
            >
              {Array.isArray(msg.content) ? (
                <MessageRenderer blocks={msg.content} />
              ) : (
                msg.content
              )}

              {i === messages.length - 1 && isStreaming && (
                <span className="animate-pulse">|</span> // 커서 느낌
              )}
            </div>
          ))}
        </div>

        {/* 채팅 입력창 */}
        <div className="mt-9 flex items-center justify-center border-t">
          <div className="relative w-full">
            {/* 입력창 */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) return; // 줄바꿈 허용
                  e.preventDefault();
                  if (!isStreaming && input.trim()) {
                    sendMessage();
                  }
                }
              }}
              placeholder="궁금한 내용을 입력해주세요"
              className="placeholder-gray-[#C3C3C3] max-h-[220px] min-h-[160px] w-full resize-none overflow-y-auto rounded-[32px] border border-[#EDEDED] bg-white p-6 text-gray-700 shadow-[0px_0px_12px_0px_rgba(98,98,98,0.04)] outline-none"
              disabled={isStreaming}
            />

            <button
              onClick={isStreaming ? handleStop : sendMessage}
              className="absolute bottom-5 right-4 items-center justify-center"
              disabled={isStreaming}
            >
              <img
                src={isStreaming ? stopIcon : sendIcon}
                alt={isStreaming ? '중단' : '전송'} // TODO:
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
