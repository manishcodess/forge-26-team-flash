import { Router } from 'express';
import { handleAIChat } from './aiController.js';

export const aiRouter = Router();

aiRouter.post('/chat', handleAIChat);
