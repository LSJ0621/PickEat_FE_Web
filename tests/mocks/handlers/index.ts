import { authHandlers } from './auth';
import { userHandlers } from './user';
import { menuHandlers } from './menu';
import { bugReportHandlers } from './bug-report';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...menuHandlers,
  ...bugReportHandlers,
];
