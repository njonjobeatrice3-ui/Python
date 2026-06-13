# Python Web Runner - Features

## Core Features

### 1. Multiple Input Methods

- **Paste Code**: Directly paste Python code into the editor
- **File Upload**: Upload `.py` or `.txt` files from your computer
- **GitHub Import**: Clone and run code directly from GitHub repositories

### 2. Real-Time Execution

- Execute Python scripts instantly
- Full program support
- Bot support (WhatsApp, Telegram)
- Live output streaming

### 3. Advanced Output Handling

- Real-time output preview
- Full-screen mode for output
- Expandable/collapsible sections
- Syntax highlighting

### 4. Comprehensive Logging

- **Timestamped Logs**: Each log entry includes precise timestamp
- **Log Levels**: Info, Output, Error, Debug
- **Real-time Updates**: WebSocket-based log streaming
- **Error Tracking**: Detailed error messages and stack traces

### 5. Execution Details

- Execution ID tracking
- Start and end times
- Execution duration
- Exit codes
- Memory usage monitoring

## Advanced Features

### 1. Sandbox Execution

- Secure code execution environment
- Resource limits (memory, CPU, timeout)
- Input validation and sanitization
- Environment variable protection

### 2. File Management

- Upload and store files
- List uploaded files
- Delete files
- Automatic cleanup

### 3. API Rate Limiting

- Protect against abuse
- Fair resource allocation
- Per-IP request limits

### 4. Persistent Logging

- Store execution logs
- Log retention policies
- Error log archiving
- Search and filter capabilities

### 5. GitHub Integration

- Import repositories
- Execute specific files
- Support for GitHub tokens
- Clone and run workflows

## UI/UX Features

### 1. Modern Interface

- Dark theme (GitHub-style)
- Responsive design
- Mobile-friendly
- Accessibility support

### 2. Interactive Editor

- Code syntax highlighting
- Line numbers
- Auto-indent
- Copy/paste support

### 3. Output Panel

- Split view (code/output)
- Full-screen mode
- Scrollable logs
- Color-coded output

### 4. Status Indicators

- Execution status
- Success/error states
- Loading states
- Connection status

## Supported Languages

- Python 3.x (primary)
- Node.js (experimental)

## Bot Support

### WhatsApp Bots

- Twilio integration ready
- Message handling
- Group chat support

### Telegram Bots

- Python-telegram-bot support
- Command handling
- Message callbacks

## Performance Features

- Configurable timeout (default: 30s)
- Output size limits (default: 10MB)
- Memory limits (default: 512MB)
- Efficient log streaming
- WebSocket for real-time updates

## Security Features

- Input validation
- Sandbox execution
- Rate limiting
- CORS protection
- Environment variable masking
- File upload validation

## Deployment Features

- Docker support
- Docker Compose configuration
- Environment-based configuration
- Production-ready logging
- Health check endpoint
