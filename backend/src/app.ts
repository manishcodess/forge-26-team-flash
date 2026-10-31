import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { dbStore } from './db/index.js';

// Routers
import { authRouter } from './modules/auth/authRoutes.js';
import { incidentRouter } from './modules/incidents/incidentRoutes.js';
import { locationRouter } from './modules/locations/locationRoutes.js';
import { warehouseRouter } from './modules/warehouses/warehouseRoutes.js';
import { inventoryRouter } from './modules/inventory/inventoryRoutes.js';
import { weatherRouter } from './modules/weather/weatherRoutes.js';
import { routingRouter } from './modules/routing/routingRoutes.js';
import { allocationRouter } from './modules/allocation/allocationRoutes.js';
import { orderRouter } from './modules/orders/orderRoutes.js';
import { aiRouter } from './modules/ai/aiRoutes.js';

export const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Tactical Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health Checks
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ResQFlow Tactical Emergency Response Backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    postgresConnected: dbStore.isPgConnected,
    incidentsMonitored: dbStore.incidents.size,
    operationalWarehouses: dbStore.warehouses.size,
    aiModel: config.GEMINI_API_KEY ? 'Gemini Pro / Flash Function Calling' : 'Autonomous Domain Copilot',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ResQFlow API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/incidents', incidentRouter);
app.use('/api/locations', locationRouter);
app.use('/api/warehouses', warehouseRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/routing', routingRouter);
app.use('/api/relief-plans', allocationRouter);
app.use('/api/orders', orderRouter);
app.use('/api/ai', aiRouter);

// Global Error Handler
app.use(errorHandler);
