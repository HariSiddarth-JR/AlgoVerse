import { useState, useEffect, useRef, useCallback } from 'react';
import { generateRandomArray } from '../utils/arrayGenerator';

export const useVisualizer = (algorithm) => {
  const [arraySize, setArraySize] = useState(10);
  const [rawArray, setRawArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per step

  const timerRef = useRef(null);

  const clearCurrentTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const initialize = useCallback(() => {
    clearCurrentTimer();
    const newArray = generateRandomArray(arraySize, 10, 100);
    setRawArray(newArray);
    
    if (algorithm && algorithm.getSteps) {
      const generatedSteps = algorithm.getSteps([...newArray]);
      setSteps(generatedSteps);
    } else {
      setSteps([]);
    }
    
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [algorithm, arraySize, clearCurrentTimer]);

  // Initial load or dependency change
  useEffect(() => {
    initialize();
  }, [initialize]);

  const reset = () => {
    initialize();
  };

  const play = () => {
    if (steps.length === 0) return;
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
    clearCurrentTimer();
  };

  const stepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      return true;
    }
    setIsPlaying(false);
    clearCurrentTimer();
    return false;
  }, [currentStepIndex, steps.length, clearCurrentTimer]);

  const stepBackward = () => {
    if (isPlaying) {
      pause();
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Playback timer effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, Math.max(50, 1000 - speed));
    }
    return () => {
      clearCurrentTimer();
    };
  }, [isPlaying, currentStepIndex, steps.length, speed, clearCurrentTimer]);

  // Derive all step state directly from steps[currentStepIndex]
  const currentStep = steps[currentStepIndex] || null;

  return {
    array: currentStep ? currentStep.array : rawArray,
    activeIndices: currentStep ? currentStep.indices : [],
    stepType: currentStep ? currentStep.type : '',
    message: currentStep ? currentStep.message : 'Ready to sort',
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    minimumIndex: currentStep?.metadata?.minimumIndex ?? null,
    minimumValue: currentStep?.metadata?.minimumValue ?? null,
    sortedIndices: currentStep?.metadata?.sortedIndices ?? [],
    comparisons: currentStep?.metadata?.comparisonsCount ?? 0,
    swaps: currentStep?.metadata?.swapsCount ?? 0,
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
    progress: steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : (steps.length === 1 ? 100 : 0)
  };
};
