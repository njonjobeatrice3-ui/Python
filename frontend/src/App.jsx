import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import InputMethods from './components/InputMethods';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionId, setExecutionId] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const executeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    setIsLoading(true);
    setError('');
    setOutput('');
    setLogs([]);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'python' })
      });

      const result = await response.json();
      setExecutionId(result.id);
      setOutput(result.output || '');
      setError(result.error || '');

      // Fetch logs
      const logsResponse = await fetch(`/api/logs/${result.id}`);
      const logsData = await logsResponse.json();
      setLogs(logsData.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐍 Python Web Runner</h1>
        <p>Execute Python scripts and programs with real-time output preview</p>
      </header>

      <div className="app-container">
        <div className="input-section">
          <InputMethods onCodeChange={setCode} />
          <CodeEditor code={code} onChange={setCode} />
          <button 
            className="execute-btn" 
            onClick={executeCode}
            disabled={isLoading}
          >
            {isLoading ? 'Executing...' : '▶ Execute'}
          </button>
        </div>

        <div className={`output-section ${isFullScreen ? 'full-screen' : ''}`}>
          <OutputPanel
            output={output}
            error={error}
            logs={logs}
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
