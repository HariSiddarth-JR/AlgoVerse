import React from 'react';
import { FaPlay, FaPause, FaRedo, FaStepForward, FaStepBackward, FaDice } from 'react-icons/fa';
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
  const getSpeedLabel = (val) => {
    if (val < 350) return 'Slow';
    if (val > 650) return 'Fast';
    return 'Medium';
  };

  return (
    <div className="card-clean visualizer-controls-card">
      <div className="controls-card-header">
        <h3 className="controls-title">Controls</h3>
      </div>

      <div className="controls-sliders-group">
        {/* Array Size Slider */}
        <div className="control-slider-item">
          <div className="slider-label-row">
            <label htmlFor="arraySizeInput" className="slider-label">Array Size</label>
            <span className="slider-val-badge">{arraySize}</span>
          </div>
          <input
            id="arraySizeInput"
            type="range"
            min="5"
            max="40"
            step="1"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isPlaying}
            className="clean-slider"
            aria-label="Array Size"
          />
        </div>

        {/* Speed Slider */}
        <div className="control-slider-item">
          <div className="slider-label-row">
            <label htmlFor="speedInput" className="slider-label">Speed</label>
            <span className="slider-val-badge">{getSpeedLabel(speed)}</span>
          </div>
          <input
            id="speedInput"
            type="range"
            min="100"
            max="900"
            step="50"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="clean-slider"
            aria-label="Animation Speed"
          />
        </div>
      </div>

      {/* Button Actions */}
      <div className="controls-buttons-group">
        {/* Generate New Array */}
        <button
          type="button"
          className="btn-control-subtle"
          onClick={reset}
          disabled={isPlaying}
          title="Generate a new randomized array"
        >
          <FaDice /> Generate New Array
        </button>

        {/* Big Play / Pause Button */}
        {isPlaying ? (
          <button
            type="button"
            className="btn-control-play playing"
            onClick={pause}
            aria-label="Pause visualization"
          >
            <FaPause /> Pause
          </button>
        ) : (
          <button
            type="button"
            className="btn-control-play"
            onClick={play}
            aria-label="Play visualization"
          >
            <FaPlay /> Play
          </button>
        )}

        {/* Step & Reset Row */}
        <div className="controls-split-row">
          <button
            type="button"
            className="btn-control-action"
            onClick={stepBackward}
            disabled={isPlaying}
            title="Step backward"
          >
            <FaStepBackward /> Prev
          </button>

          <button
            type="button"
            className="btn-control-action"
            onClick={stepForward}
            disabled={isPlaying}
            title="Advance one step"
          >
            <FaStepForward /> Step
          </button>

          <button
            type="button"
            className="btn-control-action"
            onClick={reset}
            title="Reset to beginning"
          >
            <FaRedo /> Reset
          </button>
        </div>
      </div>

      {/* Playback Progress Bar */}
      <div className="controls-progress-track" title={`Progress: ${Math.round(progress)}%`}>
        <div className="controls-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default Controls;
