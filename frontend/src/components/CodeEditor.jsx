import React from 'react';
import '../styles/CodeEditor.css';

const CodeEditor = ({ code, onChange }) => {
  return (
    <div className="code-editor-container">
      <label>📝 Code</label>
      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your Python code here...\n\nExample:\nprint('Hello World!')\nfor i in range(5):\n    print(i)"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;
