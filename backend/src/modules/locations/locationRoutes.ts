import { Router } from 'express';
import {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
} from './locationController.js';

export const locationRouter = Router();

locationRouter.get('/', listLocations);
locationRouter.get('/:id', getLocationById);
locationRouter.post('/', createLocation);
locationRouter.patch('/:id', updateLocation);
