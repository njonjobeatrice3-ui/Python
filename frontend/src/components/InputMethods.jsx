import React, { useState } from 'react';
import '../styles/InputMethods.css';

const InputMethods = ({ onCodeChange }) => {
  const [activeMethod, setActiveMethod] = useState('paste');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCodeChange(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleGithubImport = () => {
    const url = prompt('Enter GitHub repository URL:');
    if (url) {
      // TODO: Implement GitHub import
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
              accept=".py,.txt" 
              onChange={handleFileUpload}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="upload-label">
              <p>📤 Click to select or drag and drop a Python file</p>
              <p className="upload-hint">.py or .txt files</p>
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
