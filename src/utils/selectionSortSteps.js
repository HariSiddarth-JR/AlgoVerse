import { createStep } from './arrayGenerator';

export const getSelectionSortSteps = (initialArray) => {
  const steps = [];
  const array = [...initialArray];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push(createStep('newMin', array, [minIdx], `Current minimum is ${array[minIdx]} at index ${minIdx}`));

    for (let j = i + 1; j < n; j++) {
      steps.push(createStep('compare', array, [minIdx, j], `Comparing current minimum ${array[minIdx]} with ${array[j]}`));
      
      if (array[j] < array[minIdx]) {
        minIdx = j;
        steps.push(createStep('newMin', array, [minIdx], `Found new minimum ${array[minIdx]} at index ${minIdx}`));
      }
    }
    
    if (minIdx !== i) {
      steps.push(createStep('swap', array, [i, minIdx], `Swapping ${array[i]} with minimum ${array[minIdx]}`));
      
      const temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      
      steps.push(createStep('swap-done', array, [i, minIdx], `Swapped.`));
    } else {
      steps.push(createStep('info', array, [i], `Element ${array[i]} is already the minimum.`));
    }
    
    steps.push(createStep('sorted', array, [i], `${array[i]} is in its final sorted position.`));
  }
  
  steps.push(createStep('sorted', array, [n - 1], `${array[n - 1]} is in its final sorted position.`));
  steps.push(createStep('done', array, [], `Array is completely sorted.`));

  return steps;
};
