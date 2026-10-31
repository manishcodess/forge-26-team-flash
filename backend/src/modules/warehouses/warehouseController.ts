import { Request, Response, NextFunction } from 'express';
import { dbStore } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Warehouse } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export async function listWarehouses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = dbStore.getWarehouses();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function getWarehouseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const wh = dbStore.getWarehouseById(id);

    if (!wh) {
      throw new AppError(`Warehouse with ID '${id}' not found`, 404);
    }

    const items = dbStore.getInventory(id);
    res.json({
      ...wh,
      inventory: items,
    });
  } catch (err) {
    next(err);
  }
}

export async function createWarehouse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      code,
      address,
      district,
      latitude,
      longitude,
      totalCapacitySqft,
      contactPhone,
      availableVehicles,
      availableRescueBoats,
    } = req.body;

    if (!name || !code || latitude === undefined || longitude === undefined) {
      throw new AppError('name, code, latitude, and longitude are required', 400);
    }

    const newWh: Warehouse = {
      id: `wh-${uuidv4().substring(0, 6)}`,
      name,
      code,
      address: address || '',
      district: district || 'Bihar',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      totalCapacitySqft: totalCapacitySqft || 25000,
      utilizedCapacityPercent: 0,
      contactPhone: contactPhone || '',
      isOperational: true,
      availableVehicles: availableVehicles || 5,
      availableRescueBoats: availableRescueBoats || 2,
    };

    dbStore.saveWarehouse(newWh);
    res.status(201).json(newWh);
  } catch (err) {
    next(err);
  }
}

export async function updateWarehouse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = dbStore.getWarehouseById(id);

    if (!existing) {
      throw new AppError(`Warehouse with ID '${id}' not found`, 404);
    }

    const updated: Warehouse = {
      ...existing,
      ...req.body,
      id: existing.id,
    };

    dbStore.saveWarehouse(updated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
