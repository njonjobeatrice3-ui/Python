const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

// GET /api/logs/:executionId - Get execution logs
router.get('/:executionId', logsController.getLogs);

// WebSocket /api/logs/stream - Stream logs in real-time
router.ws('/stream/:executionId', logsController.streamLogs);

module.exports = router;
