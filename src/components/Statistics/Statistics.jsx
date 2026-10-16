import React from 'react';
import './Statistics.css';

const Statistics = ({
  comparisons = 0,
  swaps = 0,
  currentStepNumber = 0,
  totalSteps = 0,
  timeComplexity = 'O(n²)',
  spaceComplexity = 'O(1)'
}) => {
  return (
    <div className="card-clean statistics-card">
      <div className="stats-card-header">
        <h3 className="stats-title">Statistics</h3>
        {totalSteps > 0 && (
          <span className="stats-steps-counter">
            Step {currentStepNumber} / {totalSteps}
          </span>
        )}
      </div>

      <div className="stats-list">
        <div className="stat-row-item">
          <span className="stat-item-label">Comparisons</span>
          <span className="stat-item-value">{comparisons}</span>
        </div>

        <div className="stat-row-item">
          <span className="stat-item-label">Swaps</span>
          <span className="stat-item-value">{swaps}</span>
        </div>

        <div className="stat-row-item">
          <span className="stat-item-label">Time Complexity</span>
          <span className="stat-item-value mono-val">{timeComplexity}</span>
        </div>

        <div className="stat-row-item">
          <span className="stat-item-label">Space Complexity</span>
          <span className="stat-item-value mono-val">{spaceComplexity}</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
