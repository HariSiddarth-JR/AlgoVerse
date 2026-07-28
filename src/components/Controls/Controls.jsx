import React from 'react';
import './Controls.css';

const Controls = ({
  isPlaying,
  play,
  pause,
  reset,
  stepForward,
  stepBackward,
  speed,
  setSpeed,
  arraySize,
  setArraySize,
  progress
}) => {
  return (
    <div className="glass-card controls-container">
      <div className="controls-row">
        <button className="btn-icon" onClick={stepBackward} disabled={isPlaying}>
          ⏮
        </button>
        {isPlaying ? (
          <button className="btn-primary" onClick={pause}>
            ⏸ Pause
          </button>
        ) : (
          <button className="btn-primary" onClick={play}>
            ▶ Play
          </button>
        )}
        <button className="btn-icon" onClick={stepForward} disabled={isPlaying}>
          ⏭
        </button>
        <button className="btn-secondary" onClick={reset}>
          🔄 Reset
        </button>
      </div>

      <div className="sliders-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <div className="speed-control">
          <label htmlFor="speed">Speed</label>
          <input 
            id="speed"
            type="range" 
            min="100" 
            max="900" 
            step="100" 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        <div className="speed-control">
          <label htmlFor="arraySize">Array Size ({arraySize})</label>
          <input 
            id="arraySize"
            type="range" 
            min="5" 
            max="50" 
            step="1" 
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isPlaying}
          />
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default Controls;
