# Python Web Runner - Setup Guide

## Prerequisites

- Node.js v16 or higher
- Python 3.8 or higher
- Git
- npm or yarn

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/njonjobeatrice3-ui/python.git
cd python
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and configure:
- `PORT`: Server port (default: 5000)
- `EXECUTION_TIMEOUT`: Max execution time in ms (default: 30000)
- `MAX_OUTPUT_SIZE`: Max output size in bytes

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Start Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Docker Setup

```bash
docker-compose -f docker/docker-compose.yml up
```

Access the application at `http://localhost:3000`

## Production Deployment

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Build Docker image
docker build -f docker/Dockerfile -t python-web-runner:latest .
```

### Environment Variables for Production

```
NODE_ENV=production
EXECUTION_TIMEOUT=30000
LOG_LEVEL=warn
SANDBOX_ENABLED=true
```

## Troubleshooting

### Python not found

Ensure Python 3 is installed:
```bash
python3 --version
```

### Port already in use

Change the port in `.env`:
```
PORT=5001
```

### Module not found errors

Run npm install again:
```bash
npm install
```
