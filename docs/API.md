# Python Web Runner - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### Execute Code

**POST** `/execute`

Execute inline Python code.

**Request:**
```json
{
  "code": "print('Hello World')",
  "language": "python"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "language": "python",
  "status": "success",
  "output": "Hello World\n",
  "error": "",
  "startTime": "2024-01-10T12:00:00Z",
  "endTime": "2024-01-10T12:00:01Z",
  "duration": 1000
}
```

### Execute File

**POST** `/execute/file`

Execute an uploaded Python file.

**Request:**
- Multipart form data with file field

**Response:**
Same as `/execute`

### Execute from GitHub

**POST** `/execute/github`

Execute code from a GitHub repository.

**Request:**
```json
{
  "githubUrl": "https://github.com/username/repo",
  "filePath": "script.py"
}
```

**Response:**
Same as `/execute`

### Get Execution Status

**GET** `/execute/status/:executionId`

Get the status of a specific execution.

**Response:**
Same as `/execute`

### Get Logs

**GET** `/logs/:executionId`

Get all logs for an execution.

**Response:**
```json
{
  "executionId": "550e8400-e29b-41d4-a716-446655440000",
  "logs": [
    {
      "message": "Process started",
      "level": "info",
      "timestamp": "2024-01-10T12:00:00Z"
    },
    {
      "message": "Hello World",
      "level": "output",
      "timestamp": "2024-01-10T12:00:00.100Z"
    }
  ]
}
```

### Stream Logs (WebSocket)

**WS** `/logs/stream/:executionId`

Stream logs in real-time using WebSocket.

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:5000/api/logs/stream/execution-id');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.logs);
};
```

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Code is required"
}
```

**404 Not Found:**
```json
{
  "error": "Execution not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Detailed error message (only in development)"
}
```

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP.

Headers in response:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Timestamp when limit resets
