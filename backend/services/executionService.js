const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const logsController = require('../api/controllers/logsController');
const { promises: fsPromises } = require('fs');

// Track running processes
const runningProcesses = new Map();

// Cleanup function
const cleanup = (processId) => {
  const proc = runningProcesses.get(processId);
  if (proc) {
    try {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    } catch (error) {
      logger.error(`Error killing process ${processId}:`, error);
    }
    runningProcesses.delete(processId);
  }
};

// Setup temp directories
const setupTempDirectory = async (executionId) => {
  const tempDir = path.join(process.env.UPLOAD_DIR || './uploads', executionId);
  try {
    if (!fs.existsSync(tempDir)) {
      await fsPromises.mkdir(tempDir, { recursive: true });
    }
    return tempDir;
  } catch (error) {
    logger.error(`Error creating temp directory: ${error}`);
    throw error;
  }
};

// Parse requirements.txt
const parseRequirements = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.split('#')[0].trim()); // Remove inline comments
  } catch (error) {
    logger.error(`Error parsing requirements.txt: ${error}`);
    return [];
  }
};

// Install dependencies
const installDependencies = (requirements, tempDir, executionId) => {
  return new Promise((resolve, reject) => {
    if (requirements.length === 0) {
      logsController.addLog(executionId, 'No dependencies to install', 'info', new Date());
      resolve();
      return;
    }

    logsController.addLog(executionId, `Installing ${requirements.length} dependencies...`, 'info', new Date());

    const pip = spawn('pip', ['install', '--user', '--quiet', '--no-warn-script-location', ...requirements], {
      cwd: tempDir,
      timeout: 120000 // 2 minutes for installation
    });

    let errorOutput = '';

    pip.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        logsController.addLog(executionId, `[pip] ${message}`, 'info', new Date());
      }
    });

    pip.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        errorOutput += message + '\n';
        logsController.addLog(executionId, `[pip] ${message}`, 'warn', new Date());
      }
    });

    pip.on('close', (code) => {
      if (code === 0) {
        logsController.addLog(executionId, 'Dependencies installed successfully', 'info', new Date());
        resolve();
      } else {
        logsController.addLog(executionId, `pip install failed with code ${code}`, 'error', new Date());
        reject(new Error(`pip install failed: ${errorOutput}`));
      }
    });

    pip.on('error', (error) => {
      logsController.addLog(executionId, `pip error: ${error.message}`, 'error', new Date());
      reject(error);
    });
  });
};

// Execute Python code
exports.execute = (code, language = 'python', executionId) => {
  return new Promise(async (resolve, reject) => {
    let tempDir, tempFile, process_;

    try {
      tempDir = await setupTempDirectory(executionId);
      tempFile = path.join(tempDir, `${executionId}.py`);

      // Write code to temp file
      await fsPromises.writeFile(tempFile, code);
      logsController.addLog(executionId, `Code written to ${tempFile}`, 'info', new Date());

      // Check for requirements.txt in code or parse imports
      const requirementsPath = path.join(tempDir, 'requirements.txt');
      const requirements = parseRequirements(requirementsPath);

      // Install dependencies if found
      if (requirements.length > 0) {
        try {
          await installDependencies(requirements, tempDir, executionId);
        } catch (error) {
          logsController.addLog(executionId, `Dependency installation error: ${error.message}`, 'error', new Date());
          // Continue anyway, some deps might work
        }
      }

      logsController.addLog(executionId, 'Starting Python execution...', 'info', new Date());

      let output = '';
      let errorOutput = '';
      const startTime = new Date();
      const timeout = config.execution.timeout;

      const pythonEnv = {
        ...process.env,
        PYTHONPATH: tempDir,
        PYTHONUNBUFFERED: '1',
        MPLBACKEND: 'Agg' // For matplotlib images
      };

      process_ = spawn('python3', [tempFile], {
        cwd: tempDir,
        env: pythonEnv,
        timeout: timeout,
        maxBuffer: config.execution.maxOutputSize * 2
      });

      runningProcesses.set(executionId, process_);

      process_.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        logsController.addLog(executionId, message.trim(), 'output', new Date());
      });

      process_.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        logsController.addLog(executionId, message.trim(), 'error', new Date());
      });

      process_.on('error', (error) => {
        logsController.addLog(executionId, `Process error: ${error.message}`, 'error', new Date());
        cleanup(executionId);
        reject(error);
      });

      process_.on('close', async (code) => {
        const endTime = new Date();
        const duration = endTime - startTime;

        logsController.addLog(executionId, `Process exited with code ${code}`, 'info', endTime);
        logger.info(`[${executionId}] Execution completed in ${duration}ms`);

        // Read generated images
        let images = [];
        try {
          const files = await fsPromises.readdir(tempDir);
          const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));
          
          for (const imageFile of imageFiles) {
            const imagePath = path.join(tempDir, imageFile);
            const imageData = await fsPromises.readFile(imagePath);
            const base64 = imageData.toString('base64');
            const mimeType = imageFile.endsWith('.png') ? 'image/png' :
                           imageFile.endsWith('.svg') ? 'image/svg+xml' :
                           'image/jpeg';
            images.push({
              filename: imageFile,
              data: `data:${mimeType};base64,${base64}`
            });
            logsController.addLog(executionId, `Generated image: ${imageFile}`, 'info', new Date());
          }
        } catch (error) {
          logger.warn(`Error reading generated images: ${error.message}`);
        }

        cleanup(executionId);

        resolve({
          output,
          error: errorOutput,
          exitCode: code,
          duration,
          executedAt: startTime,
          completedAt: endTime,
          images,
          tempDir
        });
      });

      // Timeout handling
      setTimeout(() => {
        if (process_ && !process_.killed) {
          logsController.addLog(executionId, `Execution timeout (${timeout}ms exceeded)`, 'error', new Date());
          cleanup(executionId);
        }
      }, timeout + 1000);

    } catch (error) {
      logger.error(`Execution setup error: ${error.message}`);
      logsController.addLog(executionId, `Setup error: ${error.message}`, 'error', new Date());
      cleanup(executionId);
      reject(error);
    }
  });
};

// Execute a Python project directory
exports.executeProject = (projectPath, mainFile, executionId) => {
  return new Promise(async (resolve, reject) => {
    let process_;

    try {
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Project path not found: ${projectPath}`);
      }

      const mainFilePath = path.join(projectPath, mainFile || 'main.py');
      if (!fs.existsSync(mainFilePath)) {
        throw new Error(`Main file not found: ${mainFile}`);
      }

      // Check for requirements.txt
      const requirementsPath = path.join(projectPath, 'requirements.txt');
      const requirements = parseRequirements(requirementsPath);

      // Install dependencies
      if (requirements.length > 0) {
        try {
          await installDependencies(requirements, projectPath, executionId);
        } catch (error) {
          logsController.addLog(executionId, `Warning: ${error.message}`, 'warn', new Date());
        }
      }

      logsController.addLog(executionId, `Executing project: ${mainFile || 'main.py'}`, 'info', new Date());

      let output = '';
      let errorOutput = '';
      const startTime = new Date();
      const timeout = config.execution.timeout;

      const pythonEnv = {
        ...process.env,
        PYTHONPATH: projectPath,
        PYTHONUNBUFFERED: '1',
        MPLBACKEND: 'Agg'
      };

      process_ = spawn('python3', [mainFilePath], {
        cwd: projectPath,
        env: pythonEnv,
        timeout: timeout,
        maxBuffer: config.execution.maxOutputSize * 2
      });

      runningProcesses.set(executionId, process_);

      process_.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        logsController.addLog(executionId, message.trim(), 'output', new Date());
      });

      process_.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        logsController.addLog(executionId, message.trim(), 'error', new Date());
      });

      process_.on('close', async (code) => {
        const endTime = new Date();
        const duration = endTime - startTime;

        logsController.addLog(executionId, `Project execution completed with code ${code}`, 'info', endTime);

        // Read generated images
        let images = [];
        try {
          const files = await fsPromises.readdir(projectPath);
          const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));
          
          for (const imageFile of imageFiles) {
            const imagePath = path.join(projectPath, imageFile);
            const imageData = await fsPromises.readFile(imagePath);
            const base64 = imageData.toString('base64');
            const mimeType = imageFile.endsWith('.png') ? 'image/png' :
                           imageFile.endsWith('.svg') ? 'image/svg+xml' :
                           'image/jpeg';
            images.push({
              filename: imageFile,
              data: `data:${mimeType};base64,${base64}`
            });
          }
        } catch (error) {
          logger.warn(`Error reading project images: ${error.message}`);
        }

        cleanup(executionId);

        resolve({
          output,
          error: errorOutput,
          exitCode: code,
          duration,
          executedAt: startTime,
          completedAt: endTime,
          images
        });
      });

      setTimeout(() => {
        if (process_ && !process_.killed) {
          logsController.addLog(executionId, `Project execution timeout`, 'error', new Date());
          cleanup(executionId);
        }
      }, timeout + 1000);

    } catch (error) {
      logger.error(`Project execution error: ${error.message}`);
      logsController.addLog(executionId, `Error: ${error.message}`, 'error', new Date());
      cleanup(executionId);
      reject(error);
    }
  });
};

// Execute uploaded file
exports.executeFile = (filePath, executionId) => {
  return new Promise(async (resolve, reject) => {
    let process_;

    try {
      const extension = path.extname(filePath);
      const fileDir = path.dirname(filePath);
      
      if (extension !== '.py') {
        throw new Error('Only Python files (.py) are supported');
      }

      // Check for requirements.txt in the same directory
      const requirementsPath = path.join(fileDir, 'requirements.txt');
      const requirements = parseRequirements(requirementsPath);

      if (requirements.length > 0) {
        try {
          await installDependencies(requirements, fileDir, executionId);
        } catch (error) {
          logsController.addLog(executionId, `Warning: ${error.message}`, 'warn', new Date());
        }
      }

      logsController.addLog(executionId, `Executing file: ${path.basename(filePath)}`, 'info', new Date());

      let output = '';
      let errorOutput = '';
      const startTime = new Date();
      const timeout = config.execution.timeout;

      const pythonEnv = {
        ...process.env,
        PYTHONPATH: fileDir,
        PYTHONUNBUFFERED: '1',
        MPLBACKEND: 'Agg'
      };

      process_ = spawn('python3', [filePath], {
        cwd: fileDir,
        env: pythonEnv,
        timeout: timeout,
        maxBuffer: config.execution.maxOutputSize * 2
      });

      runningProcesses.set(executionId, process_);

      process_.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        logsController.addLog(executionId, message.trim(), 'output', new Date());
      });

      process_.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        logsController.addLog(executionId, message.trim(), 'error', new Date());
      });

      process_.on('close', async (code) => {
        const endTime = new Date();
        const duration = endTime - startTime;

        logsController.addLog(executionId, `File execution completed with code ${code}`, 'info', endTime);

        // Read generated images
        let images = [];
        try {
          const files = await fsPromises.readdir(fileDir);
          const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));
          
          for (const imageFile of imageFiles) {
            const imagePath = path.join(fileDir, imageFile);
            const imageData = await fsPromises.readFile(imagePath);
            const base64 = imageData.toString('base64');
            const mimeType = imageFile.endsWith('.png') ? 'image/png' :
                           imageFile.endsWith('.svg') ? 'image/svg+xml' :
                           'image/jpeg';
            images.push({
              filename: imageFile,
              data: `data:${mimeType};base64,${base64}`
            });
          }
        } catch (error) {
          logger.warn(`Error reading generated images: ${error.message}`);
        }

        cleanup(executionId);

        resolve({
          output,
          error: errorOutput,
          exitCode: code,
          duration,
          executedAt: startTime,
          completedAt: endTime,
          images
        });
      });

      setTimeout(() => {
        if (process_ && !process_.killed) {
          logsController.addLog(executionId, `File execution timeout`, 'error', new Date());
          cleanup(executionId);
        }
      }, timeout + 1000);

    } catch (error) {
      logger.error(`File execution error: ${error.message}`);
      logsController.addLog(executionId, `Error: ${error.message}`, 'error', new Date());
      cleanup(executionId);
      reject(error);
    }
  });
};

// Execute from GitHub
exports.executeFromGithub = async (githubUrl, filePath, executionId) => {
  try {
    logsController.addLog(executionId, `Cloning from GitHub: ${githubUrl}`, 'info', new Date());
    
    // Placeholder for GitHub clone logic
    logsController.addLog(executionId, 'GitHub execution feature coming soon', 'info', new Date());
    
    return { output: '', error: 'GitHub feature not yet implemented' };
  } catch (error) {
    logsController.addLog(executionId, error.message, 'error', new Date());
    throw error;
  }
};

// Stop execution
exports.stopExecution = (executionId) => {
  cleanup(executionId);
  logger.info(`Stopped execution: ${executionId}`);
};
