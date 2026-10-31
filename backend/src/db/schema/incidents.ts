import { pgTable, text, timestamp, uuid, integer, real } from 'drizzle-orm/pg-core';

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  disasterType: text('disaster_type', {
    enum: ['FLOOD', 'CYCLONE', 'HEAVY_RAINFALL', 'HEATWAVE'],
  }).notNull(),
  severity: text('severity', {
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
  }).notNull().default('MODERATE'),
  state: text('state').notNull().default('Bihar'),
  region: text('region').notNull(),
  status: text('status', {
    enum: ['ACTIVE', 'CONTAINED', 'RESOLVED'],
  }).notNull().default('ACTIVE'),
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
  affectedPopulationTotal: integer('affected_population_total').notNull().default(0),
  activeVillagesCount: integer('active_villages_count').notNull().default(0),
  riverBasin: text('river_basin'),
  rainfallPast24hMm: real('rainfall_past_24h_mm').notNull().default(0),
  description: text('description').notNull(),
});

export type IncidentRow = typeof incidents.$inferSelect;
export type NewIncidentRow = typeof incidents.$inferInsert;
