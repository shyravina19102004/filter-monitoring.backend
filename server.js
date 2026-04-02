const app = require('./src/app');
const { startScheduler } = require('./src/jobs/scheduler');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  startScheduler();
});