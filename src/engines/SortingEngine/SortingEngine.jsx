import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SortingEngine.css';

const SortingEngine = ({ array, activeIndices, stepType, metadata }) => {
  const maxVal = Math.max(...array, 100);
  const sortedIndices = metadata?.sortedIndices || [];
  const minimumIndex = metadata?.minimumIndex ?? null;

  const getBarColor = (index) => {
    // 1. Sorted elements are Green
    if (sortedIndices.includes(index) || stepType === 'done') {
      return 'var(--bar-sorted)';
    }

    // 2. Active Swap is Red
    if ((stepType === 'swap' || stepType === 'swap-done') && activeIndices.includes(index)) {
      return 'var(--bar-swap)';
    }

    // 3. Minimum element is Purple / Pivot
    if (index === minimumIndex || (stepType === 'newMin' && activeIndices.includes(index))) {
      return 'var(--bar-pivot)';
    }

    // 4. Comparison element is Amber
    if (stepType === 'compare' && activeIndices.includes(index)) {
      return 'var(--bar-compare)';
    }

    // 5. Default element is Clean Brand Blue
    return 'var(--bar-default)';
  };

  return (
    <div className="card-clean visualizer-canvas-container">
      <div className="canvas-grid-lines">
        <span className="grid-line line-75"></span>
        <span className="grid-line line-50"></span>
        <span className="grid-line line-25"></span>
      </div>

      <div className="engine-bars-wrapper">
        <AnimatePresence>
          {array.map((value, idx) => {
            const heightPercent = (value / maxVal) * 100;
            return (
              <motion.div
                key={`${value}-${idx}`}
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="engine-bar-container"
              >
                <motion.div
                  className="engine-bar"
                  animate={{
                    height: `${heightPercent}%`,
                    backgroundColor: getBarColor(idx)
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="engine-bar-value">{value}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SortingEngine;
