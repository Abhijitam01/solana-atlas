import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Matches auth.users.id
  username: text('username').unique().notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
