import React, { useState } from 'react';
import '../styles/OutputPanel.css';
import { FiMaximize2, FiMinimize2, FiDownload } from 'react-icons/fi';

const OutputPanel = ({ output, error, logs, images, isFullScreen, onToggleFullScreen }) => {
  const [expandedImages, setExpandedImages] = useState(false);

  const downloadOutput = () => {
    const content = output + (error ? `\n\nErrors:\n${error}` : '');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    a.click();
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <h3>📊 Output & Logs</h3>
        <div className="output-controls">
          {(output || error) && (
            <button className="download-btn" onClick={downloadOutput} title="Download output">
              <FiDownload />
            </button>
          )}
          <button className="fullscreen-btn" onClick={onToggleFullScreen}>
            {isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
        </div>
      </div>

      <div className="output-content">
        {error && (
          <div className="error-section">
            <h4>❌ Errors</h4>
            <pre className="error-output">{error}</pre>
          </div>
        )}

        {output && (
          <div className="output-section">
            <h4>✅ Output</h4>
            <pre className="output-display">{output}</pre>
          </div>
        )}

        {images && images.length > 0 && (
          <div className="images-section">
            <h4>🖼️ Generated Images ({images.length})</h4>
            <div className={`images-gallery ${expandedImages ? 'expanded' : ''}`}>
              {images.map((image, index) => (
                <div key={index} className="image-container">
                  <img src={image.data} alt={image.filename} />
                  <p className="image-name">{image.filename}</p>
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <button className="expand-images-btn" onClick={() => setExpandedImages(!expandedImages)}>
                {expandedImages ? 'Collapse' : 'Expand All'}
              </button>
            )}
          </div>
        )}

        {logs.length > 0 && (
          <div className="logs-section">
            <h4>📋 Logs</h4>
            <div className="logs-list">
              {logs.map((log, index) => (
                <div key={index} className={`log-entry log-${log.level}`}>
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-level">[{log.level.toUpperCase()}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!error && !output && images.length === 0 && logs.length === 0 && (
          <div className="empty-state">
            <p>👇 Execute code to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
