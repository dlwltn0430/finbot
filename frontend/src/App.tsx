import { useEffect, useRef, useState } from 'react';

import {
  ChatContent,
  ChatMessage,
  ChatResponse,
  sendChatMessage,
} from '@/api/chat';

import logo from '@/assets/logo.svg';
import newChatHover from '@/assets/new-chat-hover.svg';
import newChat from '@/assets/new-chat.svg';
import sendIconHover from '@/assets/send-icon-hover.svg';
import sendIcon from '@/assets/send-icon.svg';
import sidebarClose from '@/assets/sidebar-close.svg';
import sidebarOpen from '@/assets/sidebar-open.svg';
import stopIconHover from '@/assets/stop-icon-hover.svg';
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
    { id: string; title: string; messages: ChatMessage[]; createdAt: string }[]
  >([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [streamedTextContent, setStreamedTextContent] = useState<ChatContent[]>(
    []
  );
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // const [isError, setIsError] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !currentChatId) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    setStreamedText('');
    setStreamedTextContent([]);
    setLastResponse(null);

    // 새 채팅방일 경우에만 저장
    if (chatHistory.every((chat) => chat.id !== currentChatId)) {
      const newChat = {
        id: currentChatId,
        title: '',
        messages: updatedMessages,
        createdAt: new Date().toISOString(),
      };
      const updatedHistory = [newChat, ...chatHistory]; // 최근 대화를 최상단으로
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      setChatHistory(updatedHistory);
    }

    // 미리 placeholder 메시지 추가
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      console.log(updatedMessages);

      const response = await sendChatMessage({
        uuid: 'test', // TODO: 사용 안하는 값
        question: input,
        messages: updatedMessages.slice(0, -1), // TODO: 이것도 사용 안하는 값?
      });

      setLastResponse(response); // ✅ 저장
      setStreamedTextContent(response.answer); // ✅ 저장

      // streaming UI용 문자열 추출
      // 타이핑 효과
      let index = 0;
      const fullText = response.answer.map((a) => a.paragraph).join('\n\n');

      typingIntervalRef.current = setInterval(() => {
        setStreamedText(fullText.slice(0, ++index));
        if (index >= fullText.length) {
          clearInterval(typingIntervalRef.current!);
          typingIntervalRef.current = null;
          setIsStreaming(false);
        }
      }, 10);
    } catch (error) {
      console.error('챗봇 응답 실패:', error);
      setIsStreaming(false);
      // setIsError(true);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '답변 생성 중 오류가 발생하였습니다.',
        };
        return updated;
      });
    }
  };

  const cancelStreamingResponse = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setIsStreaming(false);

    // 마지막 bot 메시지를 즉시 완성된 메시지로 치환
    setMessages((prev) => {
      const updated = [...prev];

      const completedBotMessage = {
        role: 'assistant' as const,
        content: streamedTextContent, // 전체 답변 block 형태
      };

      updated[updated.length - 1] = completedBotMessage;
      return updated;
    });
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
    if (!isStreaming && streamedText && currentChatId) {
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
        saveChatToLocal(currentChatId, { title, messages: updatedMessages });

        setChatHistory(getChatHistory());

        return updatedMessages;
      });
    }
  }, [
    isStreaming,
    streamedText,
    streamedTextContent,
    lastResponse,
    currentChatId,
  ]);

  useEffect(() => {
    const history = getChatHistory();
    if (history.length > 0) {
      const last = history[history.length - 1];
      setCurrentChatId(last.id);
      setMessages(last.messages);
    } else {
      startNewChat();
    }
  }, []);

  const startNewChat = () => {
    const newChatId = crypto.randomUUID();
    setCurrentChatId(newChatId);
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
  // console.log(messages);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamedText]); // 메시지가 생기거나 streamedText 업데이트 될 때마다 스크롤

  // 호버 효과
  const [isSendOrStopHovered, setIsSendOrStopHovered] = useState(false);
  const [isNewChatHovered, setIsNewChatHovered] = useState(false);

  // 날짜 -> 오늘, 어제, 최근, 이전 대화
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === yesterday.toDateString()) return '어제';
    if (date > oneWeekAgo) return '최근';
    return '이전 대화';
  };

  const groupChatsByDate = (chats: typeof chatHistory) =>
    chats.reduce(
      (acc, chat) => {
        const label = formatDateLabel(chat.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(chat);
        return acc;
      },
      {} as Record<string, typeof chatHistory>
    );

  return (
    <div className="flex h-screen bg-white">
      {/* 사이드바 */}
      <div
        className={`fixed left-0 top-0 z-20 h-full w-80 transform bg-[#EAE6E3] transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 사이드바 콘텐츠는 항상 렌더링 */}
        <div
          className={`flex h-full flex-col justify-between transition-opacity duration-300`}
        >
          {/* 사이드바 상단 */}
          <div className="flex items-center justify-between py-10 pl-7 pr-10">
            <img src={logo} alt="KB 국민은행" className="w-auto" />
            <div className="flex items-center">
              <button onClick={toggleSidebar}>
                <img src={sidebarOpen} alt="사이드바 닫기" />
              </button>
              <img
                src={isNewChatHovered ? newChatHover : newChat}
                alt="새로운 대화 시작"
                onClick={startNewChat}
                onMouseEnter={() => setIsNewChatHovered(true)}
                onMouseLeave={() => setIsNewChatHovered(false)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* 채팅 목록 */}
          <div className="flex-1 overflow-auto pl-7 pr-10">
            {chatHistory.length === 0 ? (
              <p className="text-sm text-[#7C7266]">
                새로운 대화를 시작해보세요.
              </p>
            ) : (
              Object.entries(groupChatsByDate([...chatHistory].reverse())).map(
                ([label, chats]) =>
                  chats.length > 0 && (
                    <div key={label} className="mb-6">
                      <h2 className="mb-3 text-xs font-semibold text-[#7C7266]">
                        {label}
                      </h2>
                      {chats.map((chat) => (
                        <p
                          key={chat.id}
                          className="cursor-pointer truncate rounded-[8px] px-3 py-2 font-normal text-[#1B1B1B] hover:bg-[#D4CCC5]"
                          onClick={() => {
                            setCurrentChatId(chat.id);
                            setMessages(chat.messages);

                            setIsStreaming(false);
                            setStreamedText('');
                            setStreamedTextContent([]);
                            setLastResponse(null);
                          }}
                        >
                          {chat.title || '새로운 대화'}
                        </p>
                      ))}
                    </div>
                  )
              )
            )}
          </div>
        </div>
      </div>
      {/* 사이드바 닫힌 상태 상단 헤더 */}
      {!isSidebarOpen && (
        <div className="fixed left-0 top-0 z-10 ml-7 mt-6 flex h-[60px] w-[260px] items-center justify-between rounded-xl bg-white px-3 py-4 shadow-[0px_0px_4px_0px_rgba(99,99,99,0.24)]">
          <img src={logo} alt="KB 국민은행" className="w-auto" />
          <div className="ml-2 flex items-center">
            <button onClick={toggleSidebar}>
              <img src={sidebarClose} alt="사이드바 열기" />
            </button>
            <img
              src={isNewChatHovered ? newChatHover : newChat}
              alt="새로운 대화 시작"
              onClick={startNewChat}
              onMouseEnter={() => setIsNewChatHovered(true)}
              onMouseLeave={() => setIsNewChatHovered(false)}
              className="cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 메인 채팅 영역 */}
      <div
        className={`ml-80 flex h-screen flex-1 flex-col items-center px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 2xl:px-32 ${
          messages.length === 0
            ? 'justify-center'
            : 'relative pb-[200px] pt-[100px]'
        }`}
      >
        {messages.length === 0 && (
          <div className="mb-9 text-center">
            <h2 className="text-3xl font-semibold text-[#7C7266]">
              무엇을 도와드릴까요?
            </h2>
          </div>
        )}

        <div
          className={`w-full max-w-screen-lg ${
            messages.length === 0 ? '' : 'flex-1 overflow-y-auto pb-[36px]'
          }`}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-8 w-fit max-w-[70%] rounded-[32px] px-7 py-3 font-medium leading-7 text-[#1B1B1B] ${msg.role === 'user' ? 'ml-auto bg-[#FAF8F6]' : 'mr-auto'}`}
            >
              {Array.isArray(msg.content) ? (
                <MessageRenderer blocks={msg.content} />
              ) : (
                <>
                  {msg.content}

                  {isStreaming &&
                    msg.role === 'assistant' &&
                    i === messages.length - 1 && (
                      <p className="mt-2 animate-pulse text-sm text-[#7C7266]">
                        답변을 생성하는 중입니다
                        <span className="animate-bounce">...</span>
                      </p>
                    )}

                  {/* {isError && (
                    <p className="mt-2 text-sm text-red-500">
                      답변 생성 중 오류가 발생하였습니다.
                    </p>
                  )} */}
                </>
              )}
            </div>
          ))}

          <div ref={bottomRef} />

          {/* 채팅 입력창 */}
          <div
            className={`${
              messages.length === 0
                ? 'flex items-center justify-center border-t'
                : 'absolute bottom-0 left-0 w-full border-t bg-white px-20 py-5'
            }`}
          >
            <div className="relative mx-auto w-full max-w-screen-lg">
              {/* 입력창 */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) return; // 줄바꿈 허용
                    e.preventDefault();
                    if (isStreaming) return;

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
                onClick={isStreaming ? cancelStreamingResponse : sendMessage}
                onMouseEnter={() => setIsSendOrStopHovered(true)}
                onMouseLeave={() => setIsSendOrStopHovered(false)}
                className="absolute bottom-8 right-6 items-center justify-center"
              >
                <img
                  src={
                    isStreaming
                      ? isSendOrStopHovered
                        ? stopIconHover
                        : stopIcon
                      : isSendOrStopHovered
                        ? sendIconHover
                        : sendIcon
                  }
                  alt={isStreaming ? '중단' : '전송'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
