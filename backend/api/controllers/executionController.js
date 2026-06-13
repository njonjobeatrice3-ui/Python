const { v4: uuidv4 } = require('uuid');
const executionService = require('../../services/executionService');
const logger = require('../../utils/logger');

const executions = new Map();

exports.executeCode = async (req, res) => {
  try {
    const { code, language = 'python' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
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
