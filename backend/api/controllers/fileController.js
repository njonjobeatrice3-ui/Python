const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const uploadDir = './uploads';

exports.listFiles = (req, res) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir).map(filename => ({
      id: filename,
      filename,
      path: path.join(uploadDir, filename),
      uploadedAt: fs.statSync(path.join(uploadDir, filename)).birthtime
    }));

    res.json({ files });
  } catch (error) {
    logger.error('Error listing files:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFile = (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(uploadDir, fileId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    logger.info(`File deleted: ${fileId}`);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
};
