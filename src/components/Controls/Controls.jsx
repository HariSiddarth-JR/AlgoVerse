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
        <button 
          className="btn-icon btn-step-back" 
          onClick={stepBackward} 
          disabled={isPlaying}
          aria-label="Step Backward"
          title="Step Backward"
        >
          ⏮
        </button>
        {isPlaying ? (
          <button 
            className="btn-primary btn-play-pause" 
            onClick={pause}
            aria-label="Pause"
            title="Pause"
          >
            ⏸ Pause
          </button>
        ) : (
          <button 
            className="btn-primary btn-play-pause" 
            onClick={play}
            aria-label="Play"
            title="Play"
          >
            ▶ Play
          </button>
        )}
        <button 
          className="btn-icon btn-step-fwd" 
          onClick={stepForward} 
          disabled={isPlaying}
          aria-label="Step Forward"
          title="Step Forward"
        >
          ⏭
        </button>
        <button 
          className="btn-secondary btn-reset-action" 
          onClick={reset}
          aria-label="Reset"
          title="Reset"
        >
          🔄 Reset
        </button>
      </div>

      <div className="sliders-container">
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
            aria-label="Animation Speed"
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
            aria-label="Array Size"
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
