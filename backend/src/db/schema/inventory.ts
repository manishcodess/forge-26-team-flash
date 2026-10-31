import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { warehouses } from './warehouses.js';

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id, { onDelete: 'cascade' }),
  warehouseName: text('warehouse_name').notNull(),
  category: text('category', {
    enum: ['FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'EQUIPMENT'],
  }).notNull(),
  itemName: text('item_name').notNull(),
  unit: text('unit').notNull(),
  quantityAvailable: integer('quantity_available').notNull().default(0),
  quantityReserved: integer('quantity_reserved').notNull().default(0),
  reorderThreshold: integer('reorder_threshold').notNull().default(100),
  lastRestocked: timestamp('last_restocked').defaultNow().notNull(),
});

export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['STOCK_IN', 'RESERVED', 'DISPATCH_OUT', 'ADJUSTMENT', 'RETURN'],
  }).notNull(),
  deltaQuantity: integer('delta_quantity').notNull(),
  orderId: uuid('order_id'),
  notes: text('notes').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  actor: text('actor').notNull().default('SYSTEM'),
});

export type InventoryItemRow = typeof inventoryItems.$inferSelect;
export type NewInventoryItemRow = typeof inventoryItems.$inferInsert;
export type InventoryTransactionRow = typeof inventoryTransactions.$inferSelect;
