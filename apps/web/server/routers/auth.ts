import { router, publicProcedure, protectedProcedure } from '../trpc';

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  
  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!';
  }),
});
