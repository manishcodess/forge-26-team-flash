import { Router } from 'express';
import {
  listOrders,
  getOrderById,
  createOrder,
  approveOrder,
  dispatchOrder,
  deliverOrder,
  cancelOrder,
} from './orderController.js';

export const orderRouter = Router();

orderRouter.get('/', listOrders);
orderRouter.get('/:id', getOrderById);
orderRouter.post('/', createOrder);
orderRouter.post('/:id/approve', approveOrder);
orderRouter.post('/:id/dispatch', dispatchOrder);
orderRouter.post('/:id/deliver', deliverOrder);
orderRouter.post('/:id/cancel', cancelOrder);
