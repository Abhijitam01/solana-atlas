import { router } from '../trpc';
import { authRouter } from './auth';
import { codeRouter } from './code';
import { profileRouter } from './profile';

export const appRouter = router({
  auth: authRouter,
  code: codeRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
