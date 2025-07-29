import { useUserInfoStore } from "@/stores/userStore";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

type HeaderDropDownButtonProps = {
  children: React.ReactNode
  onClick?: () => void
}

const HeaderDropDownButton = ({ children, onClick }: HeaderDropDownButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-center py-[8px] rounded-[12px] hover:bg-gray-200">
      {children}
    </button>
  )
}

type HeaderDropDownProps = {
  visible: boolean
}

const HeaderDropDown = ({ visible }: HeaderDropDownProps) => {

  const { logout: handleLogout } = useUserInfoStore()

  if(!visible) {
    return <></>
  }

  return <div className="absolute p-[8px] top-[calc(100%+12px)] right-0 flex flex-col items-center justify-center w-[120px] gap-[12px] rounded-[16px] border-gray-300 border-[1px] ">
    <HeaderDropDownButton onClick={handleLogout}>로그아웃</HeaderDropDownButton>
  </div>
}

const Header = () => {

  const [isDropdownVisible, setDropdownVisible] = useState(false)
  const toggleDropdown = () => setDropdownVisible(!isDropdownVisible)

  const { userInfo, isPending } = useUserInfoStore()
  const { pathname } = useLocation()

  const isHeaderVisible = pathname === "/" || pathname.startsWith("/chat/")

  if (!isHeaderVisible) {
    return <></>
  }

  return (
    <div className='fixed top-0 right-0 w-[calc(100vw-76px)] pr-[60px] pt-[36px] flex items-center justify-end h-[100px]'>
      {isPending && <></>}
      {!isPending && (userInfo === null ? (
        <Link to="/login" className="flex items-center justify-center text-[16px] font-[700] bg-[#07dfaf] w-[100px] h-[44px] py-auto rounded-[32px] text-white">
          로그인
        </Link>
      ) : (
        <button onClick={toggleDropdown} className="relative flex items-center justify-center gap-[8px]">
          <HeaderDropDown visible={isDropdownVisible} />
          <img src={userInfo?.profile_image_url} className="h-8 w-8 rounded-full bg-gray-100" />
          <span className="text-[16px] font-[700] text-[#333534]">
            {userInfo.name ?? userInfo.nickname}
          </span>
        </button>
      ))}

    </div>
  );
};

export default Header;
