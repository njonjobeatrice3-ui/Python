import React from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import '../styles/OutputPanel.css';

const OutputPanel = ({ output, error, logs, isFullScreen, onToggleFullScreen }) => {
  return (
    <div className="output-panel">
      <div className="output-header">
        <h3>📊 Output & Logs</h3>
        <button className="fullscreen-btn" onClick={onToggleFullScreen}>
          {isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
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

        {!error && !output && logs.length === 0 && (
          <div className="empty-state">
            <p>👇 Execute code to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
