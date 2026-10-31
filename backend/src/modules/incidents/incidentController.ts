import { Request, Response, NextFunction } from 'express';
import { dbStore } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Incident } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export async function listIncidents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, severity, region } = req.query;
    let list = dbStore.getIncidents();

    if (status) {
      list = list.filter((i) => i.status === status);
    }
    if (severity) {
      list = list.filter((i) => i.severity === severity);
    }
    if (region) {
      list = list.filter((i) => i.region.toLowerCase().includes((region as string).toLowerCase()));
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function getIncidentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const incident = dbStore.getIncidentById(id);

    if (!incident) {
      throw new AppError(`Incident with ID '${id}' not found`, 404);
    }

    const locations = dbStore.getLocations(id);
    const totalFoodRequired = locations.reduce((acc, l) => acc + l.requiredFoodPackets, 0);
    const totalWaterRequired = locations.reduce((acc, l) => acc + l.requiredDrinkingWaterLiters, 0);
    const totalMedicalRequired = locations.reduce((acc, l) => acc + l.requiredMedicalKits, 0);
    const criticalLocationsCount = locations.filter((l) => l.urgencyLevel === 'CRITICAL').length;
    const deliveredCount = locations.filter((l) => l.deliveryStatus === 'DELIVERED').length;

    res.json({
      ...incident,
      locationsCount: locations.length,
      criticalLocationsCount,
      deliveredCount,
      totalDemand: {
        foodPackets: totalFoodRequired,
        drinkingWaterLiters: totalWaterRequired,
        medicalKits: totalMedicalRequired,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      title,
      disasterType,
      severity,
      state,
      region,
      riverBasin,
      rainfallPast24hMm,
      description,
      affectedPopulationTotal,
      activeVillagesCount,
    } = req.body;

    if (!title || !disasterType || !region) {
      throw new AppError('title, disasterType, and region are required fields', 400);
    }

    const newIncident: Incident = {
      id: `inc-${uuidv4().substring(0, 8)}`,
      title,
      disasterType: disasterType || 'FLOOD',
      severity: severity || 'MODERATE',
      state: state || 'Bihar',
      region,
      status: 'ACTIVE',
      reportedAt: new Date().toISOString(),
      affectedPopulationTotal: affectedPopulationTotal || 0,
      activeVillagesCount: activeVillagesCount || 0,
      riverBasin,
      rainfallPast24hMm: rainfallPast24hMm || 0,
      description: description || 'Active climate emergency response incident.',
    };

    dbStore.saveIncident(newIncident);
    dbStore.logAudit({
      id: uuidv4(),
      action: 'CREATE_INCIDENT',
      targetEntity: 'INCIDENT',
      targetId: newIncident.id,
      payload: { title: newIncident.title },
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newIncident);
  } catch (err) {
    next(err);
  }
}

export async function updateIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = dbStore.getIncidentById(id);

    if (!existing) {
      throw new AppError(`Incident with ID '${id}' not found`, 404);
    }

    const updated: Incident = {
      ...existing,
      ...req.body,
      id: existing.id, // preserve ID
    };

    dbStore.saveIncident(updated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
