import { Request, Response, NextFunction } from 'express';
import { fetchLiveWeather } from './weatherService.js';
import { dbStore } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getWeatherForecast(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const name = (req.query.name as string) || 'Disaster Zone';

    if (isNaN(lat) || isNaN(lon)) {
      throw new AppError('Valid lat and lon query parameters are required', 400);
    }

    const telemetry = await fetchLiveWeather(lat, lon, name);
    res.json(telemetry);
  } catch (err) {
    next(err);
  }
}

export async function getBiharDistrictsWeather(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locations = dbStore.getLocations();
    const weatherPromises = locations.map((loc) =>
      fetchLiveWeather(loc.latitude, loc.longitude, `${loc.name} (${loc.district})`)
    );

    const results = await Promise.all(weatherPromises);
    res.json(results);
  } catch (err) {
    next(err);
  }
}
