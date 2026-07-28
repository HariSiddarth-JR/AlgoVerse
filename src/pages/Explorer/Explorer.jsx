import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { algorithmsRegistry } from '../../algorithms';
import { useVisualizer } from '../../hooks/useVisualizer';

// Components
import SortingEngine from '../../engines/SortingEngine/SortingEngine';
import SearchingEngine from '../../engines/SearchingEngine/SearchingEngine';
import Controls from '../../components/Controls/Controls';
import CodePanel from '../../components/CodePanel/CodePanel';
import AlgorithmInfo from '../../components/AlgorithmInfo/AlgorithmInfo';
import Statistics from '../../components/Statistics/Statistics';

const Explorer = () => {
  const { category, algoId } = useParams();
  const navigate = useNavigate();

  // Validate algorithm exists, else fallback to bubble sort
  useEffect(() => {
    if (!algorithmsRegistry[algoId]) {
      navigate('/explore/sorting/bubble', { replace: true });
    }
  }, [algoId, navigate]);

  const currentAlgo = useMemo(() => algorithmsRegistry[algoId] || algorithmsRegistry['bubble'], [algoId]);

  const {
    array,
    activeIndices,
    stepType,
    message,
    isPlaying,
    speed,
    setSpeed,
    arraySize,
    setArraySize,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    comparisons,
    swaps,
    progress
  } = useVisualizer(currentAlgo);

  if (!currentAlgo) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem' }}>
          {/* Left Column: Visualizer + Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {currentAlgo.category === 'Sorting' && (
              <SortingEngine 
                array={array} 
                activeIndices={activeIndices} 
                stepType={stepType} 
              />
            )}
            {currentAlgo.category === 'Searching' && (
              <SearchingEngine 
                array={array} 
                activeIndices={activeIndices} 
                stepType={stepType} 
              />
            )}
            <Controls 
              isPlaying={isPlaying}
              play={play}
              pause={pause}
              reset={reset}
              stepForward={stepForward}
              stepBackward={stepBackward}
              speed={speed}
              setSpeed={setSpeed}
              arraySize={arraySize}
              setArraySize={setArraySize}
              progress={progress}
            />
          </div>

          {/* Right Column: Info & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Statistics 
              comparisons={comparisons}
              swaps={swaps}
              message={message}
            />
            <AlgorithmInfo info={currentAlgo.info} />
          </div>
        </div>

        {/* Bottom Row: Code */}
        <CodePanel 
          code={currentAlgo.code} 
          activeLine={-1}
        />
        
      </div>
    </div>
  );
};

export default Explorer;
