import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { HomePage } from '@/pages/Home';

import { RouterPath } from './path';
import { LoginPage } from '@/pages/Login';
import { SignupPage } from '@/pages/Signup';
import Layout from '@/layouts';

const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      {
        path: RouterPath.HOME,
        element: <HomePage />,
      },
      {
        path: RouterPath.CHAT_DETAIL,
        element: <HomePage />,
      },
      {
        path: RouterPath.LOGIN,
        element: <LoginPage />,
      },
      {
        path: RouterPath.SIGNUP,
        element: <SignupPage />,
      },
      {
        path: RouterPath.NOT_FOUND,
        element: <Navigate to={RouterPath.HOME} />,
      },
    ]
  }
]);

export const AppRouter = () => <RouterProvider router={router} />;
