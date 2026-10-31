import { Request, Response, NextFunction } from 'express';
import { dbStore } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ReliefOrder, InventoryTransaction } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateHaversineDistanceKm, estimateTravelMinutes } from '../../utils/haversine.js';

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, warehouseId, incidentId } = req.query;
    const orders = dbStore.getOrders({
      status: status as string,
      warehouseId: warehouseId as string,
      incidentId: incidentId as string,
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      throw new AppError(`Order with ID '${id}' not found`, 404);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      incidentId,
      warehouseId,
      destinationLocationId,
      items,
      assignedVehicleType,
      assignedVehicleReg,
      notes,
    } = req.body;

    if (!warehouseId || !destinationLocationId || !items || !Array.isArray(items)) {
      throw new AppError('warehouseId, destinationLocationId, and items array are required', 400);
    }

    const wh = dbStore.getWarehouseById(warehouseId);
    if (!wh) {
      throw new AppError(`Warehouse '${warehouseId}' not found`, 404);
    }

    const loc = dbStore.getLocationById(destinationLocationId);
    if (!loc) {
      throw new AppError(`Location '${destinationLocationId}' not found`, 404);
    }

    const dist = calculateHaversineDistanceKm(wh.latitude, wh.longitude, loc.latitude, loc.longitude);
    const travelMins = estimateTravelMinutes(dist, loc.accessRoadStatus);

    const targetIncidentId = incidentId || loc.incidentId || dbStore.getIncidents()[0]?.id;
    const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: ReliefOrder = {
      id: `ord-${uuidv4().substring(0, 8)}`,
      orderNumber,
      incidentId: targetIncidentId,
      warehouseId,
      warehouseName: wh.name,
      destinationLocationId,
      destinationLocationName: loc.name,
      status: 'DRAFT',
      assignedVehicleType:
        assignedVehicleType || (loc.accessRoadStatus === 'COMPLETELY_FLOODED' ? 'RESCUE_BOAT' : 'TRUCK_4x4'),
      assignedVehicleReg,
      estimatedDistanceKm: dist,
      estimatedTravelMinutes: travelMins,
      roadHazardWarning:
        loc.accessRoadStatus !== 'OPEN'
          ? `Notice: Sector approach road is ${loc.accessRoadStatus}.`
          : undefined,
      routeConfidence: 'VERIFIED_SAFE',
      createdAt: new Date().toISOString(),
      items,
      notes,
    };

    dbStore.saveOrder(newOrder);

    dbStore.logAudit({
      id: uuidv4(),
      userId: req.user?.id,
      action: 'CREATE_DRAFT_ORDER',
      targetEntity: 'RELIEF_ORDER',
      targetId: newOrder.id,
      payload: { orderNumber: newOrder.orderNumber },
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newOrder);
  } catch (err) {
    next(err);
  }
}

export async function approveOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      throw new AppError(`Order '${id}' not found`, 404);
    }

    if (order.status !== 'DRAFT' && order.status !== 'PENDING_APPROVAL') {
      throw new AppError(`Cannot approve order with current status '${order.status}'`, 400);
    }

    // Lock reserved stock in warehouse inventory
    const warehouseInventory = dbStore.getInventory(order.warehouseId);
    for (const orderItem of order.items) {
      const inv = warehouseInventory.find(
        (i) => i.category === orderItem.itemCategory
      );
      if (inv) {
        inv.quantityReserved += orderItem.quantityAllocated;
        dbStore.saveInventoryItem(inv);
      }
    }

    const approver = req.user?.fullName || 'Rajesh Verma (Disaster Operations Lead)';
    order.status = 'APPROVED';
    order.approvedBy = approver;
    order.approvedAt = new Date().toISOString();

    dbStore.saveOrder(order);

    // Update location delivery status to ALLOCATED
    const loc = dbStore.getLocationById(order.destinationLocationId);
    if (loc && loc.deliveryStatus === 'UNASSIGNED') {
      loc.deliveryStatus = 'ALLOCATED';
      dbStore.saveLocation(loc);
    }

    dbStore.logAudit({
      id: uuidv4(),
      userId: req.user?.id,
      action: 'APPROVE_ORDER',
      targetEntity: 'RELIEF_ORDER',
      targetId: order.id,
      payload: { orderNumber: order.orderNumber, approvedBy: approver },
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: `Relief Order ${order.orderNumber} successfully APPROVED. Inventory reserved.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

export async function dispatchOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      throw new AppError(`Order '${id}' not found`, 404);
    }

    if (order.status !== 'APPROVED') {
      throw new AppError(`Order must be in APPROVED status before dispatching. Current: '${order.status}'`, 400);
    }

    // Deduct stock from available and release reservation
    const warehouseInventory = dbStore.getInventory(order.warehouseId);
    for (const orderItem of order.items) {
      const inv = warehouseInventory.find(
        (i) => i.category === orderItem.itemCategory
      );
      if (inv) {
        inv.quantityAvailable = Math.max(0, inv.quantityAvailable - orderItem.quantityAllocated);
        inv.quantityReserved = Math.max(0, inv.quantityReserved - orderItem.quantityAllocated);
        dbStore.saveInventoryItem(inv);

        // Record stock-out transaction
        const tx: InventoryTransaction = {
          id: `tx-${uuidv4().substring(0, 8)}`,
          itemId: inv.id,
          warehouseId: order.warehouseId,
          type: 'DISPATCH_OUT',
          deltaQuantity: -orderItem.quantityAllocated,
          orderId: order.id,
          notes: `Dispatched for Order ${order.orderNumber} to ${order.destinationLocationName}`,
          timestamp: new Date().toISOString(),
          actor: req.user?.fullName || 'Patna Logistics Dispatch Officer',
        };
        dbStore.recordTransaction(tx);
      }
    }

    order.status = 'DISPATCHED';
    order.dispatchedAt = new Date().toISOString();
    dbStore.saveOrder(order);

    // Update affected location to IN_TRANSIT
    const loc = dbStore.getLocationById(order.destinationLocationId);
    if (loc) {
      loc.deliveryStatus = 'IN_TRANSIT';
      dbStore.saveLocation(loc);
    }

    dbStore.logAudit({
      id: uuidv4(),
      userId: req.user?.id,
      action: 'DISPATCH_ORDER',
      targetEntity: 'RELIEF_ORDER',
      targetId: order.id,
      payload: { orderNumber: order.orderNumber, vehicleType: order.assignedVehicleType },
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: `Relief Order ${order.orderNumber} DISPATCHED. Stock deducted from warehouse ledger. Convoy en route.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

export async function deliverOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      throw new AppError(`Order '${id}' not found`, 404);
    }

    order.status = 'DELIVERED';
    dbStore.saveOrder(order);

    // Update location to DELIVERED
    const loc = dbStore.getLocationById(order.destinationLocationId);
    if (loc) {
      loc.deliveryStatus = 'DELIVERED';
      dbStore.saveLocation(loc);
    }

    dbStore.logAudit({
      id: uuidv4(),
      userId: req.user?.id,
      action: 'DELIVER_ORDER',
      targetEntity: 'RELIEF_ORDER',
      targetId: order.id,
      payload: { orderNumber: order.orderNumber },
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: `Relief Order ${order.orderNumber} marked as DELIVERED to destination.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      throw new AppError(`Order '${id}' not found`, 404);
    }

    if (order.status === 'DISPATCHED' || order.status === 'DELIVERED') {
      throw new AppError(`Cannot cancel order after dispatch or delivery`, 400);
    }

    // Release reservations if it was already approved
    if (order.status === 'APPROVED') {
      const warehouseInventory = dbStore.getInventory(order.warehouseId);
      for (const orderItem of order.items) {
        const inv = warehouseInventory.find(
          (i) => i.category === orderItem.itemCategory
        );
        if (inv) {
          inv.quantityReserved = Math.max(0, inv.quantityReserved - orderItem.quantityAllocated);
          dbStore.saveInventoryItem(inv);
        }
      }
    }

    order.status = 'CANCELLED';
    dbStore.saveOrder(order);

    // Reset location status to UNASSIGNED
    const loc = dbStore.getLocationById(order.destinationLocationId);
    if (loc && loc.deliveryStatus !== 'DELIVERED') {
      loc.deliveryStatus = 'UNASSIGNED';
      dbStore.saveLocation(loc);
    }

    res.json({
      message: `Order ${order.orderNumber} successfully CANCELLED. Reserved stock released.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}
