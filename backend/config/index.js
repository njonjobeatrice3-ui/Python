module.exports = {
  execution: {
    timeout: parseInt(process.env.EXECUTION_TIMEOUT || 30000),
    maxOutputSize: parseInt(process.env.MAX_OUTPUT_SIZE || 10 * 1024 * 1024), // 10MB
    maxMemory: parseInt(process.env.MAX_MEMORY || 512), // MB
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || 50 * 1024 * 1024), // 50MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedMimeTypes: ['text/plain', 'text/x-python', 'application/octet-stream'],
    allowedExtensions: ['.py', '.txt']
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    apiBaseUrl: 'https://api.github.com'
  },
  logs: {
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || 7),
    maxLogsPerExecution: 10000
  },
  security: {
    sandboxEnabled: process.env.SANDBOX_ENABLED !== 'false',
    allowedImports: [
      'os', 'sys', 'json', 'requests', 'datetime', 'math',
      'random', 'string', 're', 'collections', 'itertools',
      'functools', 'operator', 'pathlib', 'tempfile',
      'subprocess', 'shutil', 'asyncio', 'threading'
    ]
  }
};
