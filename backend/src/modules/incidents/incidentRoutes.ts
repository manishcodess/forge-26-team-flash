import { Router } from 'express';
import {
  listIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
} from './incidentController.js';

export const incidentRouter = Router();

incidentRouter.get('/', listIncidents);
incidentRouter.get('/:id', getIncidentById);
incidentRouter.post('/', createIncident);
incidentRouter.patch('/:id', updateIncident);
