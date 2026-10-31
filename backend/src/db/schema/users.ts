import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', {
    enum: ['ADMIN', 'DISASTER_MANAGER', 'WAREHOUSE_OPERATOR', 'VIEWER'],
  }).notNull().default('VIEWER'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
