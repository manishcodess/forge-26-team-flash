import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import * as schema from './schema/index.js';
import {
  User,
  Incident,
  AffectedLocation,
  Warehouse,
  InventoryItem,
  InventoryTransaction,
  ReliefOrder,
  AuditLog,
} from '../types/index.js';
import {
  defaultUsers,
  initialIncidents,
  initialWarehouses,
  initialAffectedLocations,
  initialInventory,
  initialOrders,
} from './seedData.js';

const { Pool } = pg;

export class UnifiedStore {
  public isPgConnected = false;
  public pgDb: ReturnType<typeof drizzle> | null = null;
  private pool: pg.Pool | null = null;

  // In-memory data store collections
  public users: Map<string, User> = new Map();
  public incidents: Map<string, Incident> = new Map();
  public locations: Map<string, AffectedLocation> = new Map();
  public warehouses: Map<string, Warehouse> = new Map();
  public inventory: Map<string, InventoryItem> = new Map();
  public transactions: Map<string, InventoryTransaction> = new Map();
  public orders: Map<string, ReliefOrder> = new Map();
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInMemory();
  }

  public seedInMemory() {
    this.users.clear();
    defaultUsers.forEach((u) => this.users.set(u.id, { ...u }));

    this.incidents.clear();
    initialIncidents.forEach((inc) => this.incidents.set(inc.id, { ...inc }));

    this.warehouses.clear();
    initialWarehouses.forEach((wh) => this.warehouses.set(wh.id, { ...wh }));

    this.locations.clear();
    initialAffectedLocations.forEach((loc) => this.locations.set(loc.id, { ...loc }));

    this.inventory.clear();
    initialInventory.forEach((item) => this.inventory.set(item.id, { ...item }));

    this.orders.clear();
    initialOrders.forEach((ord) => this.orders.set(ord.id, { ...ord }));

    logger.info(
      `[UnifiedStore] In-memory store seeded: ${this.incidents.size} incidents, ${this.warehouses.size} warehouses, ${this.locations.size} locations, ${this.inventory.size} inventory items, ${this.orders.size} orders.`
    );
  }

  public async init() {
    if (!config.DATABASE_URL) {
      logger.info('[UnifiedStore] No DATABASE_URL set. Running in resilient In-Memory Store mode.');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: config.DATABASE_URL,
        connectionTimeoutMillis: 3000,
      });

      const client = await this.pool.connect();
      client.release();

      this.pgDb = drizzle(this.pool, { schema });
      this.isPgConnected = true;
      logger.info('[UnifiedStore] Successfully connected to PostgreSQL via Drizzle ORM.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(
        `[UnifiedStore] PostgreSQL connection failed (${msg}). Gracefully falling back to pre-seeded in-memory store.`
      );
      this.isPgConnected = false;
    }
  }

  // --- Incidents ---
  public getIncidents(): Incident[] {
    return Array.from(this.incidents.values());
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  public saveIncident(incident: Incident): Incident {
    this.incidents.set(incident.id, incident);
    return incident;
  }

  // --- Locations ---
  public getLocations(incidentId?: string): AffectedLocation[] {
    const all = Array.from(this.locations.values());
    if (incidentId) {
      return all.filter((l) => l.incidentId === incidentId);
    }
    return all;
  }

  public getLocationById(id: string): AffectedLocation | undefined {
    return this.locations.get(id);
  }

  public saveLocation(location: AffectedLocation): AffectedLocation {
    this.locations.set(location.id, location);
    return location;
  }

  // --- Warehouses ---
  public getWarehouses(): Warehouse[] {
    return Array.from(this.warehouses.values());
  }

  public getWarehouseById(id: string): Warehouse | undefined {
    return this.warehouses.get(id);
  }

  public saveWarehouse(wh: Warehouse): Warehouse {
    this.warehouses.set(wh.id, wh);
    return wh;
  }

  // --- Inventory ---
  public getInventory(warehouseId?: string): InventoryItem[] {
    const all = Array.from(this.inventory.values());
    if (warehouseId) {
      return all.filter((item) => item.warehouseId === warehouseId);
    }
    return all;
  }

  public getInventoryItem(id: string): InventoryItem | undefined {
    return this.inventory.get(id);
  }

  public saveInventoryItem(item: InventoryItem): InventoryItem {
    this.inventory.set(item.id, item);
    return item;
  }

  public recordTransaction(tx: InventoryTransaction): InventoryTransaction {
    this.transactions.set(tx.id, tx);
    return tx;
  }

  public getTransactions(warehouseId?: string): InventoryTransaction[] {
    const all = Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (warehouseId) {
      return all.filter((t) => t.warehouseId === warehouseId);
    }
    return all;
  }

  // --- Orders ---
  public getOrders(filters?: { status?: string; warehouseId?: string; incidentId?: string }): ReliefOrder[] {
    let list = Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filters?.status) {
      list = list.filter((o) => o.status === filters.status);
    }
    if (filters?.warehouseId) {
      list = list.filter((o) => o.warehouseId === filters.warehouseId);
    }
    if (filters?.incidentId) {
      list = list.filter((o) => o.incidentId === filters.incidentId);
    }
    return list;
  }

  public getOrderById(id: string): ReliefOrder | undefined {
    return this.orders.get(id);
  }

  public saveOrder(order: ReliefOrder): ReliefOrder {
    this.orders.set(order.id, order);
    return order;
  }

  // --- Users ---
  public getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public saveUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // --- Audit ---
  public logAudit(log: AuditLog): void {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }
}

export const dbStore = new UnifiedStore();
