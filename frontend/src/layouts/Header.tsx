import { useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { useUserInfoStore } from '@/stores/userStore';

type HeaderDropDownButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

const HeaderDropDownButton = ({
  children,
  onClick,
}: HeaderDropDownButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center rounded-[12px] py-[8px] hover:bg-gray-200"
    >
      {children}
    </button>
  );
};

type HeaderDropDownProps = {
  visible: boolean;
};

const HeaderDropDown = ({ visible }: HeaderDropDownProps) => {
  const { logout: handleLogout } = useUserInfoStore();

  if (!visible) {
    return <></>;
  }

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] flex w-[120px] flex-col items-center justify-center gap-[12px] rounded-[16px] border-[1px] border-gray-300 p-[8px]">
      <HeaderDropDownButton onClick={handleLogout}>
        로그아웃
      </HeaderDropDownButton>
    </div>
  );
};

const Header = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const toggleDropdown = () => setDropdownVisible(!isDropdownVisible);

  const { userInfo, isPending } = useUserInfoStore();
  const { pathname } = useLocation();

  const isHeaderVisible = pathname === '/' || pathname.startsWith('/chat/');

  if (!isHeaderVisible) {
    return <></>;
  }

  return (
    <div className="fixed right-0 top-0 flex w-[calc(100vw-76px)] items-center justify-end pr-[60px] pt-[36px]">
      {isPending && <></>}
      {!isPending &&
        (userInfo === null ? (
          <Link
            to="/login"
            className="py-auto flex h-[44px] w-[100px] items-center justify-center rounded-[32px] bg-[#07dfaf] text-[16px] font-[700] text-white"
          >
            로그인
          </Link>
        ) : (
          <button
            onClick={toggleDropdown}
            className="relative flex items-center justify-center gap-[8px]"
          >
            <HeaderDropDown visible={isDropdownVisible} />
            <img
              src={userInfo?.profile_image_url}
              className="h-8 w-8 rounded-full bg-gray-100"
            />
            <span className="text-[16px] font-[700] text-[#333534]">
              {userInfo.name ?? userInfo.nickname}
            </span>
          </button>
        ))}
    </div>
  );
};

export default Header;
