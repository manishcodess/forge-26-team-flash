import { pgTable, text, timestamp, uuid, integer, real } from 'drizzle-orm/pg-core';
import { incidents } from './incidents.js';
import { warehouses } from './warehouses.js';
import { affectedLocations } from './locations.js';

export const reliefOrders = pgTable('relief_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  incidentId: uuid('incident_id').notNull().references(() => incidents.id, { onDelete: 'cascade' }),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id, { onDelete: 'cascade' }),
  warehouseName: text('warehouse_name').notNull(),
  destinationLocationId: uuid('destination_location_id').notNull().references(() => affectedLocations.id, { onDelete: 'cascade' }),
  destinationLocationName: text('destination_location_name').notNull(),
  status: text('status', {
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  }).notNull().default('DRAFT'),
  assignedVehicleType: text('assigned_vehicle_type', {
    enum: ['TRUCK_4x4', 'RESCUE_BOAT', 'TRACTOR', 'LIGHT_VAN'],
  }).notNull().default('TRUCK_4x4'),
  assignedVehicleReg: text('assigned_vehicle_reg'),
  estimatedDistanceKm: real('estimated_distance_km').notNull().default(0),
  estimatedTravelMinutes: integer('estimated_travel_minutes').notNull().default(0),
  roadHazardWarning: text('road_hazard_warning'),
  routeConfidence: text('route_confidence', {
    enum: ['VERIFIED_SAFE', 'POTENTIALLY_INUNDATED', 'OFFLINE_ESTIMATE'],
  }).notNull().default('OFFLINE_ESTIMATE'),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at'),
  dispatchedAt: timestamp('dispatched_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reliefOrderItems = pgTable('relief_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => reliefOrders.id, { onDelete: 'cascade' }),
  itemCategory: text('item_category').notNull(),
  itemName: text('item_name').notNull(),
  unit: text('unit').notNull().default('packets'),
  quantityRequested: integer('quantity_requested').notNull(),
  quantityAllocated: integer('quantity_allocated').notNull(),
});

export type ReliefOrderRow = typeof reliefOrders.$inferSelect;
export type ReliefOrderItemRow = typeof reliefOrderItems.$inferSelect;
