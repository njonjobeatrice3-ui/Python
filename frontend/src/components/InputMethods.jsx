import React, { useState } from 'react';
import '../styles/InputMethods.css';

const InputMethods = ({ onCodeChange, onFilesUpload }) => {
  const [activeMethod, setActiveMethod] = useState('paste');

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Handle zip files
      if (file.name.endsWith('.zip') || file.name.endsWith('.tar') || file.name.endsWith('.gz')) {
        onFilesUpload([file]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        onCodeChange(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleMultipleFiles = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesUpload(Array.from(files));
    }
  };

  const handleGithubImport = () => {
    const url = prompt('Enter GitHub repository URL:');
    if (url) {
      alert('GitHub import feature coming soon!');
    }
  };

  return (
    <div className="input-methods">
      <div className="method-tabs">
        <button 
          className={`tab ${activeMethod === 'paste' ? 'active' : ''}`}
          onClick={() => setActiveMethod('paste')}
        >
          📝 Paste Code
        </button>
        <button 
          className={`tab ${activeMethod === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveMethod('upload')}
        >
          📁 Upload File
        </button>
        <button 
          className={`tab ${activeMethod === 'project' ? 'active' : ''}`}
          onClick={() => setActiveMethod('project')}
        >
          📦 Project
        </button>
        <button 
          className={`tab ${activeMethod === 'github' ? 'active' : ''}`}
          onClick={() => setActiveMethod('github')}
        >
          🔗 GitHub Link
        </button>
      </div>

      <div className="method-content">
        {activeMethod === 'upload' && (
          <div className="upload-area">
            <input 
              type="file" 
              accept=".py,.txt,.zip,.tar,.gz" 
              onChange={handleFileUpload}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="upload-label">
              <p>📤 Click to select or drag and drop a Python file</p>
              <p className="upload-hint">.py, .txt, .zip, .tar.gz files supported</p>
            </label>
          </div>
        )}

        {activeMethod === 'project' && (
          <div className="upload-area">
            <input 
              type="file" 
              accept=".py,.txt,.zip,.tar,.gz" 
              onChange={handleMultipleFiles}
              id="project-input"
              multiple
              style={{ display: 'none' }}
            />
            <label htmlFor="project-input" className="upload-label">
              <p>📦 Upload entire Python project</p>
              <p className="upload-hint">Upload main.py + requirements.txt + all dependencies</p>
            </label>
          </div>
        )}

        {activeMethod === 'github' && (
          <button className="github-btn" onClick={handleGithubImport}>
            🔗 Import from GitHub
          </button>
        )}
      </div>
    </div>
  );
};

export default InputMethods;
