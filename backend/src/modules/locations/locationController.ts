import { Request, Response, NextFunction } from 'express';
import { dbStore } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AffectedLocation } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export async function listLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { incidentId, urgency, deliveryStatus, district } = req.query;
    let list = dbStore.getLocations(incidentId as string);

    if (urgency) {
      list = list.filter((l) => l.urgencyLevel === urgency);
    }
    if (deliveryStatus) {
      list = list.filter((l) => l.deliveryStatus === deliveryStatus);
    }
    if (district) {
      list = list.filter((l) => l.district.toLowerCase() === (district as string).toLowerCase());
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function getLocationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const location = dbStore.getLocationById(id);

    if (!location) {
      throw new AppError(`Location with ID '${id}' not found`, 404);
    }

    res.json(location);
  } catch (err) {
    next(err);
  }
}

export async function createLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      incidentId,
      name,
      district,
      latitude,
      longitude,
      populationAffected,
      requiredFoodPackets,
      requiredDrinkingWaterLiters,
      requiredMedicalKits,
      requiredBlankets,
      urgencyLevel,
      accessRoadStatus,
      contactPerson,
      contactPhone,
    } = req.body;

    if (!name || !district || latitude === undefined || longitude === undefined) {
      throw new AppError('name, district, latitude, and longitude are required', 400);
    }

    const targetIncidentId = incidentId || dbStore.getIncidents()[0]?.id || 'inc-bihar-2026-01';

    const newLoc: AffectedLocation = {
      id: `loc-${uuidv4().substring(0, 8)}`,
      incidentId: targetIncidentId,
      name,
      district,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      populationAffected: populationAffected || 0,
      requiredFoodPackets: requiredFoodPackets || 0,
      requiredDrinkingWaterLiters: requiredDrinkingWaterLiters || 0,
      requiredMedicalKits: requiredMedicalKits || 0,
      requiredBlankets: requiredBlankets || 0,
      urgencyLevel: urgencyLevel || 'MEDIUM',
      deliveryStatus: 'UNASSIGNED',
      accessRoadStatus: accessRoadStatus || 'OPEN',
      contactPerson,
      contactPhone,
      lastUpdated: new Date().toISOString(),
    };

    dbStore.saveLocation(newLoc);
    res.status(201).json(newLoc);
  } catch (err) {
    next(err);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = dbStore.getLocationById(id);

    if (!existing) {
      throw new AppError(`Location with ID '${id}' not found`, 404);
    }

    const updated: AffectedLocation = {
      ...existing,
      ...req.body,
      id: existing.id,
      lastUpdated: new Date().toISOString(),
    };

    dbStore.saveLocation(updated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
