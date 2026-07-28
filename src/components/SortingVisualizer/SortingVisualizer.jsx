import React from 'react';
import './SortingVisualizer.css';

const SortingVisualizer = ({ array, activeIndices, stepType }) => {
  const maxVal = Math.max(...array, 100);

  const getBarColor = (index) => {
    if (activeIndices.includes(index)) {
      if (stepType === 'compare') return 'var(--accent-yellow)';
      if (stepType === 'swap') return 'var(--accent-red)';
      if (stepType === 'swap-done') return 'var(--accent-purple)';
      if (stepType === 'newMin') return 'var(--accent-purple)';
      if (stepType === 'sorted') return 'var(--accent-green)';
      if (stepType === 'info') return 'var(--accent-blue)';
    }
    // Optimization: we could also track which indices are fully sorted,
    // but for simplicity, we'll keep the default color if not currently active
    return 'var(--accent-blue)';
  };

  return (
    <div className="card visualizer-container">
      <div className="bars-wrapper">
        {array.map((value, idx) => (
          <div 
            key={idx} 
            className="bar-container"
          >
            <div 
              className="bar" 
              style={{
                height: `${(value / maxVal) * 100}%`,
                backgroundColor: getBarColor(idx)
              }}
            >
              <span className="bar-value">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortingVisualizer;
