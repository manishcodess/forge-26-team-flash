import { Router } from 'express';
import {
  listInventory,
  getInventoryTransactions,
  recordStockTransaction,
} from './inventoryController.js';

export const inventoryRouter = Router();

inventoryRouter.get('/', listInventory);
inventoryRouter.get('/transactions', getInventoryTransactions);
inventoryRouter.post('/transactions', recordStockTransaction);
