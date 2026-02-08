import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@solana-playground/db';
import { userCode } from '@solana-playground/db';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const codeRouter = router({
  getMyCode: protectedProcedure
    .query(async ({ ctx }) => {
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not connected' });
      return db
        .select()
        .from(userCode)
        .where(eq(userCode.userId, ctx.user.id))
        .orderBy(desc(userCode.updatedAt));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not connected' });
      const code = await db
        .select()
        .from(userCode)
        .where(
          and(
            eq(userCode.id, input.id),
            eq(userCode.userId, ctx.user.id)
          )
        )
        .limit(1);
      
      return code[0] || null;
    }),

  save: protectedProcedure
    .input(z.object({
      id: z.string().uuid().optional(),
      templateId: z.string(),
      title: z.string().min(1).max(100),
      code: z.string().min(1),
      language: z.string().default('rust'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not connected' });
      const now = new Date();

      if (input.id) {
        // Update existing
        const [updated] = await db
          .update(userCode)
          .set({
            title: input.title,
            code: input.code,
            updatedAt: now,
            lastOpenedAt: now,
          })
          .where(
            and(
              eq(userCode.id, input.id),
              eq(userCode.userId, ctx.user.id)
            )
          )
          .returning();
        
        return updated;
      } else {
        // Create new
        const [created] = await db
          .insert(userCode)
          .values({
            userId: ctx.user.id,
            templateId: input.templateId,
            title: input.title,
            code: input.code,
            language: input.language,
            lastOpenedAt: now,
          })
          .returning();
        
        return created;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not connected' });
      await db
        .delete(userCode)
        .where(
          and(
            eq(userCode.id, input.id),
            eq(userCode.userId, ctx.user.id)
          )
        );
      
      return { success: true };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      isFavorite: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not connected' });
      const [updated] = await db
        .update(userCode)
        .set({ isFavorite: input.isFavorite })
        .where(
          and(
            eq(userCode.id, input.id),
            eq(userCode.userId, ctx.user.id)
          )
        )
        .returning();
      
      return updated;
    }),
});
