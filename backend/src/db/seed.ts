import { dbStore } from './index.js';
import { logger } from '../utils/logger.js';

async function main() {
  logger.info('Initializing ResQFlow Bihar Flood Scenario Seed...');
  await dbStore.init();
  dbStore.seedInMemory();
  logger.info('Seeding completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  logger.error('Failed to seed database:', err);
  process.exit(1);
});
