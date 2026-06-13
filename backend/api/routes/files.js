const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.get('/', fileController.listFiles);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
