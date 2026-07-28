import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SearchingEngine.css';

const SearchingEngine = ({ array, activeIndices, stepType }) => {
  
  const getBoxColor = (index) => {
    if (activeIndices.includes(index)) {
      if (stepType === 'visit' || stepType === 'compare') return 'var(--accent-yellow)';
      if (stepType === 'found') return 'var(--accent-green)';
      if (stepType === 'bounds') return 'var(--accent-purple)';
      if (stepType === 'not-found') return 'var(--accent-red)';
    }
    // For elements outside the bounds in binary search
    if (stepType === 'bounds' && !activeIndices.includes(index)) {
      // If we pass an array of active bounds, say [left, right], we could dim others
      // For simplicity, let's keep it blue unless we specifically want to dim.
    }
    return 'var(--bg-surface)'; // Default block color
  };

  const getBoxBorder = (index) => {
    if (activeIndices.includes(index)) {
      if (stepType === 'visit' || stepType === 'compare') return '1px solid var(--accent-yellow)';
      if (stepType === 'found') return '1px solid var(--accent-green)';
      if (stepType === 'bounds') return '1px solid var(--accent-purple)';
      if (stepType === 'not-found') return '1px solid var(--accent-red)';
    }
    return '1px solid var(--border-color)';
  };

  const getBoxShadow = (index) => {
    if (activeIndices.includes(index)) {
      if (stepType === 'visit' || stepType === 'compare') return '0 0 15px var(--accent-yellow-glow)';
      if (stepType === 'found') return '0 0 15px var(--accent-green-glow)';
      if (stepType === 'bounds') return '0 0 15px var(--accent-purple-glow)';
      if (stepType === 'not-found') return '0 0 15px var(--accent-red-glow)';
    }
    return 'none';
  };

  return (
    <div className="glass-card searching-engine-container">
      <div className="searching-grid-wrapper">
        <AnimatePresence>
          {array.map((value, idx) => (
            <motion.div 
              key={idx} // Arrays in searching typically don't swap, so idx is safe as key
              layout
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="search-box"
              animate={{
                backgroundColor: getBoxColor(idx),
                border: getBoxBorder(idx),
                boxShadow: getBoxShadow(idx)
              }}
            >
              <span className="search-value">{value}</span>
              <span className="search-index">{idx}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchingEngine;
