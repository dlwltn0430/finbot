import { useEffect, useState } from 'react';

import { sendChatMessage } from '@/api/chat';

import logo from '@/assets/logo.svg';
import newChat from '@/assets/new-chat.svg';
import sendIcon from '@/assets/send-icon.svg';
import sidebarClose from '@/assets/sidebar-close.svg';
import sidebarOpen from '@/assets/sidebar-open.svg';
import stopIcon from '@/assets/stop-icon.svg';

import { getChatHistory, saveChatToLocal } from './utils/localStorage';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<{ type: string; text: string }[]>([
    { type: 'bot', text: '' },
  ]); // TODO:
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { title: string; messages: { type: string; text: string }[] }[]
  >([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    setStreamedText('');

    try {
      const response = await sendChatMessage({
        uuid: 'test', // TODO: 사용 안하는 값
        question: input,
        messages: updatedMessages.map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
      });

      // 하나 더 추가해서 보여줄 메시지 자리 확보
      setMessages((prev) => [...prev, { type: 'bot', text: '' }]);

      // 타이핑 효과
      let index = 0;
      const fullText = response.answer
        .map((item) => item.paragraph)
        .join('\n\n');

      const typingInterval = setInterval(() => {
        setStreamedText(() => {
          const next = fullText.slice(0, index + 1);
          index++;
          if (index >= fullText.length) {
            clearInterval(typingInterval);
            setIsStreaming(false);
          }
          return next;
        });
      }, 10);
    } catch (error) {
      console.error('챗봇 응답 실패:', error);
    }
  };

  const handleStop = () => {
    // TODO: 타이핑 중단, 상태 초기화 등 처리
    setIsStreaming(false);
    // TODO: 추가로 타이핑 인터벌 클리어할 수 있다면 그것도 처리
  };

  useEffect(() => {
    if (!isStreaming && streamedText) {
      setMessages((prev) => {
        // 1. 챗봇 메시지를 마지막에 반영
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          type: 'bot',
          text: streamedText,
        };

        // 2. 제목용 메시지
        const title =
          updatedMessages.find((m) => m.type === 'user')?.text || '새로운 대화';

        // 3. ChatMessage 타입에 맞게 변환해서 저장
        const chatMessages = updatedMessages.map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));

        // 4. 저장
        saveChatToLocal({ title, messages: chatMessages });
        setChatHistory(getChatHistory());

        return updatedMessages;
      });
    }
  }, [isStreaming, streamedText]);

  const startNewChat = () => {
    setMessages([{ type: 'bot', text: '무엇을 도와드릴까요?' }]);
    setStreamedText('');
    setInput('');
  };

  // 대화 목록 불러오기
  useEffect(() => {
    const history = getChatHistory();
    setChatHistory(history);
  }, []);

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
              className={`mb-8 w-fit max-w-[70%] rounded-[32px] px-7 py-4 font-medium leading-7 text-[#1B1B1B] ${msg.type === 'user' ? 'ml-auto bg-[#FAF8F6]' : 'mr-auto'}`}
            >
              {msg.text}
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
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="궁금한 내용을 입력해주세요"
              className="placeholder-gray-[#C3C3C3] h-[160px] w-full rounded-[32px] border border-[#EDEDED] bg-white p-6 text-gray-700 shadow-[0px_0px_12px_0px_rgba(98,98,98,0.04)] outline-none"
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
