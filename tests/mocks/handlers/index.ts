import { authHandlers } from './auth';
import { userHandlers } from './user';
import { menuHandlers } from './menu';
import { searchHandlers } from './search';
import { bugReportHandlers } from './bug-report';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...menuHandlers,
  ...searchHandlers,
  ...bugReportHandlers,
];
