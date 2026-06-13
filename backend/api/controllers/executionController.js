const { v4: uuidv4 } = require('uuid');
const executionService = require('../../services/executionService');
const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

const executions = new Map();

// Clean up old executions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, execution] of executions.entries()) {
    if (now - new Date(execution.endTime).getTime() > 5 * 60 * 1000) {
      executions.delete(id);
      logger.info(`Cleaned up execution: ${id}`);
    }
  }
}, 5 * 60 * 1000);

exports.executeCode = async (req, res) => {
  try {
    const { code, language = 'python' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    if (code.length > 100000) {
      return res.status(400).json({ error: 'Code is too large (max 100KB)' });
    }

    const executionId = uuidv4();
    const startTime = new Date();

    logger.info(`Starting code execution ${executionId}`);

    const result = await executionService.execute(code, language, executionId);
    
    const execution = {
      id: executionId,
      language,
      status: result.error && result.exitCode !== 0 ? 'error' : 'success',
      output: result.output,
      error: result.error,
      startTime,
      endTime: new Date(),
      duration: new Date() - startTime,
      images: result.images || []
    };

    executions.set(executionId, execution);

    res.json(execution);
  } catch (error) {
    logger.error('Execution error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.executeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const executionId = uuidv4();
    const startTime = new Date();
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    logger.info(`Executing file: ${fileName}`);

    // Handle zip/tar files
    const ext = path.extname(fileName).toLowerCase();
    let actualFilePath = filePath;

    if (ext === '.zip') {
      try {
        const zip = new AdmZip(filePath);
        zip.extractAllTo(path.dirname(filePath), true);
        
        // Find main.py or first .py file
        const files = fs.readdirSync(path.dirname(filePath));
        const pyFile = files.find(f => f === 'main.py') || files.find(f => f.endsWith('.py'));
        
        if (pyFile) {
          actualFilePath = path.join(path.dirname(filePath), pyFile);
        } else {
          throw new Error('No Python files found in archive');
        }
      } catch (error) {
        return res.status(400).json({ error: `Archive extraction failed: ${error.message}` });
      }
    }

    const result = await executionService.executeFile(actualFilePath, executionId);

    const execution = {
      id: executionId,
      filename: fileName,
      status: result.error && result.exitCode !== 0 ? 'error' : 'success',
      output: result.output,
      error: result.error,
      startTime,
      endTime: new Date(),
      duration: new Date() - startTime,
      images: result.images || []
    };

    executions.set(executionId, execution);

    res.json(execution);
  } catch (error) {
    logger.error('File execution error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.executeProject = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const executionId = uuidv4();
    const startTime = new Date();
    const uploadDir = req.files[0].destination;
    const mainFile = req.body.mainFile || 'main.py';

    logger.info(`Executing project with ${req.files.length} files`);

    // Check for requirements.txt
    const filesInDir = fs.readdirSync(uploadDir);
    const hasRequirements = filesInDir.includes('requirements.txt');
    
    if (hasRequirements) {
      logger.info(`Found requirements.txt in project`);
    }

    const result = await executionService.executeProject(uploadDir, mainFile, executionId);

    const execution = {
      id: executionId,
      type: 'project',
      fileCount: req.files.length,
      status: result.error && result.exitCode !== 0 ? 'error' : 'success',
      output: result.output,
      error: result.error,
      startTime,
      endTime: new Date(),
      duration: new Date() - startTime,
      images: result.images || []
    };

    executions.set(executionId, execution);

    res.json(execution);
  } catch (error) {
    logger.error('Project execution error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.executeFromGithub = async (req, res) => {
  try {
    const { githubUrl, filePath } = req.body;
    const executionId = uuidv4();
    const startTime = new Date();

    logger.info(`Executing from GitHub: ${githubUrl}`);

    const result = await executionService.executeFromGithub(githubUrl, filePath, executionId);

    const execution = {
      id: executionId,
      source: 'github',
      url: githubUrl,
      status: result.error ? 'error' : 'success',
      output: result.output,
      error: result.error,
      startTime,
      endTime: new Date(),
      duration: new Date() - startTime,
      images: result.images || []
    };

    executions.set(executionId, execution);

    res.json(execution);
  } catch (error) {
    logger.error('GitHub execution error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStatus = (req, res) => {
  const { executionId } = req.params;
  const execution = executions.get(executionId);

  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' });
  }

  res.json(execution);
};

exports.stopExecution = (req, res) => {
  try {
    const { executionId } = req.params;
    executionService.stopExecution(executionId);
    res.json({ message: 'Execution stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
