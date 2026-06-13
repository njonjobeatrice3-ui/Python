const { v4: uuidv4 } = require('uuid');
const executionService = require('../../services/executionService');
const logger = require('../../utils/logger');

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

    logger.info(`Starting execution ${executionId}`);

    const result = await executionService.execute(code, language, executionId);
    
    const execution = {
      id: executionId,
      language,
      status: result.error ? 'error' : 'success',
      output: result.output,
      error: result.error,
      startTime,
      endTime: new Date(),
      duration: new Date() - startTime
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
    const executionId = uuidv4();
    const startTime = new Date();
    const filePath = req.file.path;

    logger.info(`Executing file: ${filePath}`);

    const result = await executionService.executeFile(filePath, executionId);

    const execution = {
      id: executionId,
      filename: req.file.originalname,
      status: result.error ? 'error' : 'success',
      output: result.output,
      error: result.error,
      startTime,
      endTime: new Date(),
      duration: new Date() - startTime
    };

    executions.set(executionId, execution);

    res.json(execution);
  } catch (error) {
    logger.error('File execution error:', error);
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
      duration: new Date() - startTime
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
