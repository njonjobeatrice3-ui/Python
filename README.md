# Python Web Runner

A powerful web application for running Python scripts, full programs, and bots (WhatsApp, Telegram) with real-time output preview and logging capabilities.

## Features

- 🐍 **Run Python Scripts & Programs** - Execute Python code directly from your browser
- 📝 **Multiple Input Methods**:
  - Paste code directly
  - Upload Python files
  - Import from GitHub repositories
- 📊 **Real-Time Output** - Live output preview with timestamps
- 🚨 **Error Logging** - Detailed error logs with failure tracking
- 🤖 **Bot Support** - Run WhatsApp and Telegram bots
- 🖥️ **Full-Screen Preview** - Expand output to full screen
- ⏱️ **Timestamped Logs** - Track execution time with precise timestamps
- 📈 **Advanced Features** - More powerful than similar tools like Katabump

## Project Structure

```
python-web-runner/
├── frontend/                 # React/Vue frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Express.js/FastAPI backend
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── services/
│   │   ├── executionService.js
│   │   ├── githubService.js
│   │   └── logService.js
│   ├── utils/
│   ├── config/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── docker/                   # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                     # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── FEATURES.md
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/njonjobeatrice3-ui/python.git
cd python
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Configure environment variables
```bash
# In backend/.env
PORT=5000
GITHUB_TOKEN=your_github_token
EXECUTION_TIMEOUT=30000
MAX_OUTPUT_SIZE=10MB
```

5. Start the application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## Usage

### Running Python Code

1. **Paste Code**: Directly paste your Python code into the editor
2. **Upload File**: Select a `.py` file from your computer
3. **GitHub Import**: Provide a GitHub repository link

### Real-Time Logs

- View execution logs with timestamps
- Track error messages and stack traces
- Monitor bot activity in real-time

### Full-Screen Output

- Click the expand button to view output in full screen
- Useful for debugging and monitoring long-running processes

## API Endpoints

### Code Execution
- `POST /api/execute` - Execute Python code
- `POST /api/execute/file` - Execute uploaded file
- `POST /api/execute/github` - Execute code from GitHub

### Logs & Status
- `GET /api/logs/:executionId` - Get execution logs
- `WS /api/logs/stream` - WebSocket for real-time logs

### File Management
- `POST /api/upload` - Upload file
- `GET /api/files` - List uploaded files
- `DELETE /api/files/:fileId` - Delete file

## Technologies

### Frontend
- React.js / Vue.js
- Vite (build tool)
- Axios (API calls)
- WebSocket (real-time updates)
- Tailwind CSS (styling)

### Backend
- Express.js
- Node.js
- Python subprocess execution
- Winston (logging)
- GitHub API integration

## Configuration

Edit `backend/config/index.js` to customize:
- Execution timeout
- Maximum output size
- Supported file types
- Log retention period

## Security

- Sandbox Python execution environment
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling
- Environment variable protection

## Deployment

### Docker
```bash
docker-compose up
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Made with ❤️ by njonjobeatrice3-ui**
