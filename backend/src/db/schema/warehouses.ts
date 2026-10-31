import { pgTable, text, uuid, integer, real, boolean } from 'drizzle-orm/pg-core';

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address').notNull(),
  district: text('district').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  totalCapacitySqft: integer('total_capacity_sqft').notNull().default(10000),
  utilizedCapacityPercent: integer('utilized_capacity_percent').notNull().default(0),
  contactPhone: text('contact_phone').notNull(),
  isOperational: boolean('is_operational').notNull().default(true),
  availableVehicles: integer('available_vehicles').notNull().default(0),
  availableRescueBoats: integer('available_rescue_boats').notNull().default(0),
});

export type WarehouseRow = typeof warehouses.$inferSelect;
export type NewWarehouseRow = typeof warehouses.$inferInsert;
