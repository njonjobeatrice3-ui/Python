const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Create uploads directory
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const execId = req.body.executionId || uuidv4();
    const userDir = path.join(uploadDir, execId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.py', '.txt', '.zip', '.tar', '.gz'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Python files and archives are allowed'));
    }
  }
});

// POST /api/execute - Execute code snippet
router.post('/', executionController.executeCode);

// POST /api/execute/file - Execute uploaded file(s)
router.post('/file', upload.single('file'), executionController.executeFile);

// POST /api/execute/project - Execute project with multiple files
router.post('/project', upload.array('files', 50), executionController.executeProject);

// POST /api/execute/github - Execute from GitHub
router.post('/github', executionController.executeFromGithub);

// GET /api/execute/status/:executionId - Get execution status
router.get('/status/:executionId', executionController.getStatus);

// DELETE /api/execute/:executionId - Stop execution
router.delete('/:executionId', executionController.stopExecution);

module.exports = router;
