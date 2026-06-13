const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/execute - Execute code snippet
router.post('/', executionController.executeCode);

// POST /api/execute/file - Execute uploaded file
router.post('/file', upload.single('file'), executionController.executeFile);

// POST /api/execute/github - Execute from GitHub
router.post('/github', executionController.executeFromGithub);

// GET /api/execute/status/:executionId - Get execution status
router.get('/status/:executionId', executionController.getStatus);

module.exports = router;
