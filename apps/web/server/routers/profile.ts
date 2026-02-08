import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@solana-playground/db';
import { profiles } from '@solana-playground/db';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not connected' });
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, ctx.user.id),
    });
    return profile || null;
  }),

  update: protectedProcedure
    .input(z.object({
      username: z.string().min(3).optional(),
      displayName: z.string().optional(),
      avatarUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not connected' });
      
      const [updated] = await db
        .insert(profiles)
        .values({
          id: ctx.user.id,
          ...input,
          username: input.username || ctx.user.email?.split('@')[0] || 'user',
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: {
            ...input,
            updatedAt: new Date(),
          },
        })
        .returning();
        
      return updated;
    }),
});
