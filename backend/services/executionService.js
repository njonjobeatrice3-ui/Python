const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const logsController = require('../api/controllers/logsController');

exports.execute = (code, language = 'python', executionId) => {
  return new Promise((resolve, reject) => {
    const tempFile = path.join('./temp', `${executionId}.${language === 'python' ? 'py' : 'js'}`);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp', { recursive: true });
    }

    // Write code to temp file
    fs.writeFileSync(tempFile, code);

    const args = language === 'python' ? [tempFile] : [tempFile];
    const command = language === 'python' ? 'python3' : 'node';

    let output = '';
    let errorOutput = '';

    const child = spawn(command, args, {
      timeout: config.execution.timeout,
      maxBuffer: config.execution.maxOutputSize
    });

    const startTime = new Date();

    child.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      logsController.addLog(executionId, message.trim(), 'output', new Date());
      logger.info(`[${executionId}] ${message.trim()}`);
    });

    child.stderr.on('data', (data) => {
      const message = data.toString();
      errorOutput += message;
      logsController.addLog(executionId, message.trim(), 'error', new Date());
      logger.error(`[${executionId}] ${message.trim()}`);
    });

    child.on('error', (error) => {
      logsController.addLog(executionId, error.message, 'error', new Date());
      reject(error);
    });

    child.on('close', (code) => {
      const endTime = new Date();
      const duration = endTime - startTime;

      logsController.addLog(executionId, `Process exited with code ${code}`, 'info', endTime);
      logger.info(`[${executionId}] Execution completed in ${duration}ms`);

      // Clean up temp file
      fs.unlinkSync(tempFile);

      resolve({
        output,
        error: errorOutput,
        exitCode: code,
        duration,
        executedAt: startTime,
        completedAt: endTime
      });
    });
  });
};

exports.executeFile = (filePath, executionId) => {
  return new Promise((resolve, reject) => {
    const extension = path.extname(filePath);
    const command = extension === '.py' ? 'python3' : 'node';

    let output = '';
    let errorOutput = '';

    const child = spawn(command, [filePath], {
      timeout: config.execution.timeout,
      maxBuffer: config.execution.maxOutputSize
    });

    const startTime = new Date();

    child.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      logsController.addLog(executionId, message.trim(), 'output', new Date());
    });

    child.stderr.on('data', (data) => {
      const message = data.toString();
      errorOutput += message;
      logsController.addLog(executionId, message.trim(), 'error', new Date());
    });

    child.on('close', (code) => {
      const endTime = new Date();
      logsController.addLog(executionId, `Process completed with exit code ${code}`, 'info', endTime);
      resolve({ output, error: errorOutput, exitCode: code });
    });
  });
};

exports.executeFromGithub = async (githubUrl, filePath, executionId) => {
  try {
    logsController.addLog(executionId, `Downloading from GitHub: ${githubUrl}`, 'info', new Date());
    
    // Placeholder for GitHub download logic
    // You would implement GitHub API integration here
    
    logsController.addLog(executionId, 'GitHub execution not yet fully implemented', 'info', new Date());
    
    return { output: '', error: 'GitHub execution feature coming soon' };
  } catch (error) {
    logsController.addLog(executionId, error.message, 'error', new Date());
    throw error;
  }
};
