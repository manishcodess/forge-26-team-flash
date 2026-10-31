import { Router } from 'express';
import { getWeatherForecast, getBiharDistrictsWeather } from './weatherController.js';

export const weatherRouter = Router();

weatherRouter.get('/forecast', getWeatherForecast);
weatherRouter.get('/bihar', getBiharDistrictsWeather);
