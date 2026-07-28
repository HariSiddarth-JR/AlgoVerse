import React from 'react';
import './CodePanel.css';

const CodePanel = ({ code, activeLine }) => {
  return (
    <div className="glass-card code-panel">
      <h3>Algorithm Code</h3>
      <div className="code-container">
        {code.map((line, index) => (
          <div 
            key={index} 
            className={`code-line ${activeLine === index ? 'active-line' : ''}`}
          >
            <span className="line-number">{index + 1}</span>
            <pre>{line}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodePanel;
