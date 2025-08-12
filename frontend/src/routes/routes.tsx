import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';

import { FeedPage } from '@/pages/Feed';
import { HomePage } from '@/pages/Home';

import { RouterPath } from './path';

const router = createBrowserRouter([
  {
    path: RouterPath.ROOT,
    element: <AppLayout />,
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
        path: RouterPath.FEED,
        element: <FeedPage />,
      },
    ],
  },
  {
    path: RouterPath.NOT_FOUND,
    element: <Navigate to={RouterPath.HOME} />,
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
