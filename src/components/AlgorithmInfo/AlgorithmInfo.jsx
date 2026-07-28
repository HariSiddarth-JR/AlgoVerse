import React from 'react';
import './AlgorithmInfo.css';

const AlgorithmInfo = ({ info }) => {
  return (
    <div className="glass-card info-panel">
      <h3>{info.title} Description</h3>
      <p className="info-desc">{info.description}</p>
      
      <div className="complexities-grid">
        <div className="complexity-item">
          <span className="complexity-label">Best Case</span>
          <span className="complexity-value">{info.bestCase}</span>
        </div>
        <div className="complexity-item">
          <span className="complexity-label">Average Case</span>
          <span className="complexity-value">{info.averageCase}</span>
        </div>
        <div className="complexity-item">
          <span className="complexity-label">Worst Case</span>
          <span className="complexity-value">{info.worstCase}</span>
        </div>
        <div className="complexity-item">
          <span className="complexity-label">Space Complexity</span>
          <span className="complexity-value">{info.spaceComplexity}</span>
        </div>
        <div className="complexity-item">
          <span className="complexity-label">Stable</span>
          <span className="complexity-value">{info.stable ? 'Yes' : 'No'}</span>
        </div>
        <div className="complexity-item">
          <span className="complexity-label">In-Place</span>
          <span className="complexity-value">{info.inPlace ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmInfo;
