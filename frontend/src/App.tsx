import { useState } from 'react';

import add from '@/assets/add.svg';
import arrow from '@/assets/input.svg';
import logo from '@/assets/logo.svg';
import sideBar from '@/assets/sideBar.svg';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '무엇을 도와드릴까요?' },
  ]);
  const [input, setInput] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 사이드바 */}
      <div
        className={`flex w-80 flex-col justify-center transition-all duration-300 ${isSidebarOpen ? 'h-screen bg-[#EAE6E3]' : 'ml-7 mt-8 h-[60px] rounded-xl bg-white px-3 py-4 shadow-[0px_0px_4px_0px_rgba(99,99,99,0.24)]'} `}
      >
        <div
          className={`flex items-center justify-between ${isSidebarOpen ? 'py-10 pl-7 pr-10' : ''}`}
        >
          <img
            src={logo}
            alt="KB 국민은행"
            className={`w-auto transition-opacity duration-300`}
          />

          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar}>
              <img src={sideBar} alt="사이드바 버튼" />
            </button>

            <img src={add} alt="새로운 대화 시작하기" />
          </div>
        </div>

        <div
          className={`flex-1 overflow-auto pl-7 pr-10 ${isSidebarOpen ? 'block' : 'hidden'}`}
        >
          <h2 className="mb-3 text-xs font-semibold text-[#7C7266]">오늘</h2>
          {Array(5)
            .fill('디폴트는 내용 요약되어 들어감')
            .map((msg, i) => (
              <p
                key={i}
                className="truncate px-3 py-2 font-normal text-[#1B1B1B]"
              >
                {msg}
              </p>
            ))}
          <h2
            className="mb-3 mt-7 text-xs font-semibold text-[#7C7266]"
            text-xs
          >
            어제
          </h2>
          {Array(5)
            .fill('디폴트는 내용 요약되어 들어감')
            .map((msg, i) => (
              <p
                key={i}
                className="truncate px-3 py-2 font-normal text-[#1B1B1B]"
              >
                {msg}
              </p>
            ))}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold text-[#7C7266]">
            무엇을 도와드릴까요?
          </h2>
        </div>

        {/* 채팅 입력창 */}
        <div className="mt-9 flex items-center justify-center border-t">
          <div className="relative w-full max-w-2xl">
            {/* 입력창 */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="궁금한 내용을 입력해주세요"
              className="placeholder-gray-[#C3C3C3] h-[160px] w-full rounded-[32px] border border-[#EDEDED] bg-white p-6 text-gray-700 shadow-[0px_0px_12px_0px_rgba(98,98,98,0.04)] outline-none"
            />

            <button
              onClick={sendMessage}
              className="absolute bottom-5 right-4 items-center justify-center"
            >
              <img src={arrow} alt="전송 버튼" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
