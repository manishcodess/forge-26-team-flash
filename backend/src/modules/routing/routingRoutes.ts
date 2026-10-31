import { Router } from 'express';
import { getRoute } from './routingController.js';

export const routingRouter = Router();

routingRouter.get('/route', getRoute);
