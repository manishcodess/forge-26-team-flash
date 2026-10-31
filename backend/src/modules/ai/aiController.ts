import { Request, Response, NextFunction } from 'express';
import { processAIChat } from './aiService.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function handleAIChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { message, incidentId, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      throw new AppError('Message is required', 400);
    }

    const aiResponse = await processAIChat(message, incidentId, conversationHistory);
    res.json(aiResponse);
  } catch (err) {
    next(err);
  }
}
