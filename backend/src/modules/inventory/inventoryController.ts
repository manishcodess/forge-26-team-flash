import { Request, Response, NextFunction } from 'express';
import { dbStore } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { InventoryItem, InventoryTransaction, ResourceCategory } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export async function listInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { warehouseId, category } = req.query;
    let list = dbStore.getInventory(warehouseId as string);

    if (category) {
      list = list.filter((i) => i.category === category);
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function getInventoryTransactions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { warehouseId } = req.query;
    const txs = dbStore.getTransactions(warehouseId as string);
    res.json(txs);
  } catch (err) {
    next(err);
  }
}

export async function recordStockTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { warehouseId, category, itemName, unit, type, deltaQuantity, notes } = req.body;

    if (!warehouseId || !type || deltaQuantity === undefined) {
      throw new AppError('warehouseId, type, and deltaQuantity are required', 400);
    }

    const wh = dbStore.getWarehouseById(warehouseId);
    if (!wh) {
      throw new AppError(`Warehouse '${warehouseId}' not found`, 404);
    }

    // Find existing inventory item or create new
    let item = dbStore
      .getInventory(warehouseId)
      .find((i) => i.category === category && i.itemName.toLowerCase() === (itemName || '').toLowerCase());

    if (!item) {
      item = {
        id: `inv-${uuidv4().substring(0, 8)}`,
        warehouseId,
        warehouseName: wh.name,
        category: (category as ResourceCategory) || 'FOOD',
        itemName: itemName || 'General Emergency Supplies',
        unit: unit || 'packets',
        quantityAvailable: 0,
        quantityReserved: 0,
        reorderThreshold: 500,
        lastRestocked: new Date().toISOString(),
      };
    }

    const delta = parseInt(deltaQuantity, 10);

    if (type === 'STOCK_IN') {
      item.quantityAvailable += delta;
      item.lastRestocked = new Date().toISOString();
    } else if (type === 'DISPATCH_OUT') {
      if (item.quantityAvailable < delta) {
        throw new AppError(
          `Insufficient stock. Available: ${item.quantityAvailable}, Requested: ${delta}`,
          400
        );
      }
      item.quantityAvailable -= delta;
    } else if (type === 'ADJUSTMENT') {
      item.quantityAvailable = Math.max(0, item.quantityAvailable + delta);
    }

    dbStore.saveInventoryItem(item);

    const transaction: InventoryTransaction = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      itemId: item.id,
      warehouseId,
      type,
      deltaQuantity: delta,
      notes: notes || `Manual ${type} recorded by operator.`,
      timestamp: new Date().toISOString(),
      actor: req.user?.fullName || 'Duty Officer',
    };

    dbStore.recordTransaction(transaction);

    res.status(201).json({
      message: 'Transaction successfully processed',
      item,
      transaction,
    });
  } catch (err) {
    next(err);
  }
}
