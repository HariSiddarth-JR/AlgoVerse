import React from 'react';
import './Statistics.css';

const Statistics = ({ comparisons, swaps, message }) => {
  return (
    <div className="glass-card statistics-panel">
      <div className="stats-header">
        <h3>Metrics</h3>
        <span className="stats-message">{message}</span>
      </div>
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Comparisons</span>
          <span className="stat-value">{comparisons}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Swaps/Writes</span>
          <span className="stat-value">{swaps}</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
