import { pgTable, text, timestamp, uuid, integer, real } from 'drizzle-orm/pg-core';
import { incidents } from './incidents.js';

export const affectedLocations = pgTable('affected_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').notNull().references(() => incidents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  district: text('district').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  populationAffected: integer('population_affected').notNull().default(0),
  requiredFoodPackets: integer('required_food_packets').notNull().default(0),
  requiredDrinkingWaterLiters: integer('required_drinking_water_liters').notNull().default(0),
  requiredMedicalKits: integer('required_medical_kits').notNull().default(0),
  requiredBlankets: integer('required_blankets').notNull().default(0),
  urgencyLevel: text('urgency_level', {
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  }).notNull().default('MEDIUM'),
  deliveryStatus: text('delivery_status', {
    enum: ['UNASSIGNED', 'ALLOCATED', 'IN_TRANSIT', 'DELIVERED'],
  }).notNull().default('UNASSIGNED'),
  accessRoadStatus: text('access_road_status', {
    enum: ['OPEN', 'WATERLOGGED', 'COMPLETELY_FLOODED', 'UNVERIFIED'],
  }).notNull().default('OPEN'),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export type AffectedLocationRow = typeof affectedLocations.$inferSelect;
export type NewAffectedLocationRow = typeof affectedLocations.$inferInsert;
