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
  const [images, setImages] = useState([]);
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
    setImages([]);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'python' })
      });

      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Execution failed');
        return;
      }

      setExecutionId(result.id);
      setOutput(result.output || '');
      setError(result.error || '');
      setImages(result.images || []);

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

  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError('');
    setOutput('');
    setLogs([]);
    setImages([]);

    try {
      const formData = new FormData();
      
      // Determine if it's a project upload or single file
      if (files.length > 1 || files[0].name.endsWith('.zip')) {
        // Project upload
        files.forEach(file => {
          formData.append('files', file);
        });
        formData.append('mainFile', 'main.py');

        const response = await fetch('/api/execute/project', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (!response.ok) {
          setError(result.error || 'Project execution failed');
          return;
        }

        setExecutionId(result.id);
        setOutput(result.output || '');
        setError(result.error || '');
        setImages(result.images || []);
      } else {
        // Single file upload
        formData.append('file', files[0]);

        const response = await fetch('/api/execute/file', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (!response.ok) {
          setError(result.error || 'File execution failed');
          return;
        }

        setExecutionId(result.id);
        setOutput(result.output || '');
        setError(result.error || '');
        setImages(result.images || []);
      }

      // Fetch logs
      if (result.id) {
        const logsResponse = await fetch(`/api/logs/${result.id}`);
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }
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
        <p>Execute Python scripts, projects, and programs with real-time output preview</p>
      </header>

      <div className={`app-container ${isFullScreen ? 'fullscreen-mode' : ''}`}>
        <div className="input-section">
          <InputMethods onCodeChange={setCode} onFilesUpload={handleFilesUpload} />
          <CodeEditor code={code} onChange={setCode} />
          <button 
            className="execute-btn" 
            onClick={executeCode}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Executing...' : '▶ Execute'}
          </button>
        </div>

        <div className={`output-section ${isFullScreen ? 'full-screen' : ''}`}>
          <OutputPanel
            output={output}
            error={error}
            logs={logs}
            images={images}
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
