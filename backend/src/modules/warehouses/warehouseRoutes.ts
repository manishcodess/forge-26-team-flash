import { Router } from 'express';
import {
  listWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
} from './warehouseController.js';

export const warehouseRouter = Router();

warehouseRouter.get('/', listWarehouses);
warehouseRouter.get('/:id', getWarehouseById);
warehouseRouter.post('/', createWarehouse);
warehouseRouter.patch('/:id', updateWarehouse);
