import { Request, Response, NextFunction } from 'express';
import { calculateRoute } from './routingService.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getRoute(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const fromLat = parseFloat(req.query.fromLat as string);
    const fromLon = parseFloat(req.query.fromLon as string);
    const toLat = parseFloat(req.query.toLat as string);
    const toLon = parseFloat(req.query.toLon as string);
    const roadStatus = (req.query.roadStatus as 'OPEN' | 'WATERLOGGED' | 'COMPLETELY_FLOODED') || 'OPEN';

    if (isNaN(fromLat) || isNaN(fromLon) || isNaN(toLat) || isNaN(toLon)) {
      throw new AppError('fromLat, fromLon, toLat, and toLon query parameters are required', 400);
    }

    const route = await calculateRoute(fromLat, fromLon, toLat, toLon, roadStatus);
    res.json(route);
  } catch (err) {
    next(err);
  }
}
