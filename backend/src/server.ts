import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { dbStore } from './db/index.js';

async function bootstrap() {
  try {
    logger.info('========================================================');
    logger.info('   ⚡ ResQ — Disaster Relief & Logistics Operations      ');
    logger.info('   Team Flash — GenAI Buildathon 2026                   ');
    logger.info('========================================================');

    // Initialize database (Postgres or resilient pre-seeded fallback)
    await dbStore.init();

    const server = app.listen(config.PORT, () => {
      logger.info(`Operational Server listening on port ${config.PORT}`);
      logger.info(`Environment:           ${config.NODE_ENV}`);
      logger.info(`Health check:          http://localhost:${config.PORT}/health`);
      logger.info(`REST API root:         http://localhost:${config.PORT}/api`);
      logger.info(`External Weather Feed: ${config.OPEN_METEO_BASE_URL}`);
      logger.info(`OSRM Routing Engine:   ${config.OSRM_BASE_URL}`);
      logger.info(`AI Copilot Engine:     ${config.GEMINI_API_KEY ? 'Gemini 1.5/2.0 API' : 'Autonomous Fallback Engine'}`);
      logger.info('--------------------------------------------------------');
      logger.info('Ready to orchestrate flood relief operations.');
    });

    const shutdown = () => {
      logger.info('Gracefully shutting down ResQFlow backend...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Fatal error during startup bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
