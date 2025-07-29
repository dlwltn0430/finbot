import { useUserInfoStore } from '@/stores/userStore';
import Header from './Header';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Layout = () => {

  const { loadUserInfo } = useUserInfoStore()
  const { pathname } = useLocation()

  useEffect(() => {
    loadUserInfo()
  }, [pathname])

  return (
    <div className="relative flex h-screen bg-white overflow-hidden">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
