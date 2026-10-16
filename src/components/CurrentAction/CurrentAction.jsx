import React from 'react';
import './CurrentAction.css';

const CurrentAction = ({ step }) => {
  if (!step) {
    return (
      <div className="glass-card current-action-panel">
        <div className="action-header">
          <h3 className="action-title">Current Action</h3>
          <span className="action-badge action-badge-ready">READY</span>
        </div>
        <p className="action-message">"Press Play or Next to start visualizing the algorithm steps."</p>
      </div>
    );
  }

  const { message, metadata, type } = step;
  const actionReason = metadata?.actionReason;

  const getTypeLabel = (t) => {
    switch (t) {
      case 'newMin': return 'NEW MINIMUM';
      case 'compare': return 'COMPARING';
      case 'swap': return 'SWAPPING';
      case 'swap-done': return 'SWAPPED';
      case 'sorted': return 'SORTED';
      case 'done': return 'COMPLETED';
      case 'visit': return 'VISITING';
      case 'found': return 'FOUND';
      case 'not-found': return 'NOT FOUND';
      case 'bounds': return 'BOUNDS';
      default: return t ? t.toUpperCase() : 'ACTION';
    }
  };

  return (
    <div className="glass-card current-action-panel">
      <div className="action-header">
        <h3 className="action-title">Current Action</h3>
        <span className={`action-badge action-badge-${type}`}>
          {getTypeLabel(type)}
        </span>
      </div>
      
      <p className="action-message">"{message}"</p>

      {actionReason && (
        <div className="action-reason-box">
          <span className="reason-label">WHY THIS STEP?</span>
          <p className="reason-text">{actionReason}</p>
        </div>
      )}
    </div>
  );
};

export default CurrentAction;
