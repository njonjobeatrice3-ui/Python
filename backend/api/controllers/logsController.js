const logger = require('../../utils/logger');
const executionLogs = new Map();

exports.getLogs = (req, res) => {
  try {
    const { executionId } = req.params;
    const logs = executionLogs.get(executionId) || [];

    res.json({ executionId, logs });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.streamLogs = (ws, req) => {
  const { executionId } = req.params;

  logger.info(`Client connected for log stream: ${executionId}`);

  const interval = setInterval(() => {
    const logs = executionLogs.get(executionId) || [];
    ws.send(JSON.stringify({ executionId, logs, timestamp: new Date() }));
  }, 500);

  ws.on('close', () => {
    clearInterval(interval);
    logger.info(`Client disconnected from log stream: ${executionId}`);
  });
};

// Helper to add logs
exports.addLog = (executionId, logMessage, level = 'info', timestamp = new Date()) => {
  if (!executionLogs.has(executionId)) {
    executionLogs.set(executionId, []);
  }
  const logs = executionLogs.get(executionId);
  logs.push({ message: logMessage, level, timestamp });
};
