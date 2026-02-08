import { pgTable, text, uuid, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const userCode = pgTable('user_code', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id).notNull(),
  templateId: text('template_id').notNull(), // e.g., "hello-solana"
  title: text('title').notNull(),
  code: text('code').notNull(), // The actual Rust code
  language: text('language').default('rust').notNull(),
  
  // Metadata
  isFavorite: boolean('is_favorite').default(false),
  lastOpenedAt: timestamp('last_opened_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_code_user_id_idx').on(table.userId),
  templateIdIdx: index('user_code_template_id_idx').on(table.templateId),
}));
