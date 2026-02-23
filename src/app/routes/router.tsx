import { createBrowserRouter } from 'react-router-dom';
import { mainRoutes } from './routes/mainRoutes';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { historyRoutes } from './routes/historyRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { miscRoutes } from './routes/miscRoutes';

export const router = createBrowserRouter([
  ...mainRoutes,
  ...authRoutes,
  ...userRoutes,
  ...historyRoutes,
  ...adminRoutes,
  ...miscRoutes,
]);
