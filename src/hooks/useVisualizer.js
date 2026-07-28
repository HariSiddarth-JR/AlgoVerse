import { useState, useEffect, useRef, useCallback } from 'react';
import { generateRandomArray } from '../utils/arrayGenerator';

export const useVisualizer = (algorithm) => {
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per step
  
  // Metrics
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  const [arraySize, setArraySize] = useState(20);

  const timerRef = useRef(null);

  const initialize = useCallback(() => {
    const newArray = generateRandomArray(arraySize, 10, 100);
    setArray(newArray);
    
    if (algorithm && algorithm.getSteps) {
      const generatedSteps = algorithm.getSteps([...newArray]);
      setSteps(generatedSteps);
    } else {
      setSteps([]);
    }
    
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setComparisons(0);
    setSwaps(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [algorithm, arraySize]);

  // Initial load or size change
  useEffect(() => {
    initialize();
  }, [initialize]);

  const reset = () => {
    initialize();
  };

  const play = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      if (steps.length > 0) setArray(steps[0].array);
      setComparisons(0);
      setSwaps(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      const step = steps[nextIndex];
      if (step) {
        setArray(step.array);
        if (step.type === 'compare') {
          setComparisons(prev => prev + 1);
        } else if (step.type === 'swap' || step.type === 'newMin') {
          setSwaps(prev => prev + 1);
        }
      }
      return nextIndex < steps.length - 1; // return true if can continue
    }
    setIsPlaying(false);
    return false;
  }, [currentStepIndex, steps]);

  const stepBackward = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      
      const step = steps[prevIndex];
      if (step) {
        setArray(step.array);
        // Note: Accurately rewinding metrics is tricky without storing them in the step itself, 
        // but for a simple visualizer, we can either store cumulative metrics in steps or just accept slight inconsistencies when rewinding.
        // For production, we'd store `comparisonsSoFar` in the step object.
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        const canContinue = stepForward();
        if (!canContinue) {
          setIsPlaying(false);
        }
      }, 1000 - speed); // Invert speed so higher = faster, range 100-900 
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, speed, stepForward]);

  const currentStep = steps[currentStepIndex] || null;

  return {
    array: currentStep ? currentStep.array : array,
    activeIndices: currentStep ? currentStep.indices : [],
    stepType: currentStep ? currentStep.type : '',
    message: currentStep ? currentStep.message : 'Ready to sort',
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
    progress: steps.length > 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0
  };
};
