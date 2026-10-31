import { Router } from 'express';
import { generateReliefPlan, convertPlanToDraftOrders } from './allocationController.js';

export const allocationRouter = Router();

allocationRouter.post('/generate', generateReliefPlan);
allocationRouter.post('/create-draft-orders', convertPlanToDraftOrders);
