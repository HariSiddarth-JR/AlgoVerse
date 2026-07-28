import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SortingEngine.css';

const SortingEngine = ({ array, activeIndices, stepType }) => {
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
    return 'var(--accent-blue)';
  };

  const getBarShadow = (index) => {
    if (activeIndices.includes(index)) {
      if (stepType === 'compare') return '0 0 15px var(--accent-yellow-glow)';
      if (stepType === 'swap' || stepType === 'swap-done') return '0 0 15px var(--accent-red-glow)';
      if (stepType === 'sorted') return '0 0 15px var(--accent-green-glow)';
    }
    return 'none';
  };

  return (
    <div className="glass-card engine-container">
      <div className="engine-bars-wrapper">
        <AnimatePresence>
          {array.map((value, idx) => (
            <motion.div 
              key={`${value}-${idx}`} // Use value + idx as key for simple animation. Ideally, elements should have unique IDs.
              layout
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="engine-bar-container"
            >
              <motion.div 
                className="engine-bar"
                animate={{
                  height: `${(value / maxVal) * 100}%`,
                  backgroundColor: getBarColor(idx),
                  boxShadow: getBarShadow(idx)
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="engine-bar-value">{value}</span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SortingEngine;
