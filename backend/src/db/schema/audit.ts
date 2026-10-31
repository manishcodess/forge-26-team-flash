import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  action: text('action').notNull(),
  targetEntity: text('target_entity').notNull(),
  targetId: text('target_id'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AuditLogRow = typeof auditLogs.$inferSelect;
