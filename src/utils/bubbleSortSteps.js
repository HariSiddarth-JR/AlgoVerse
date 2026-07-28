import { createStep } from './arrayGenerator';

export const getBubbleSortSteps = (initialArray) => {
  const steps = [];
  const array = [...initialArray];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push(createStep('compare', array, [j, j + 1], `Comparing ${array[j]} and ${array[j + 1]}`));
      
      if (array[j] > array[j + 1]) {
        steps.push(createStep('swap', array, [j, j + 1], `Swapping ${array[j]} and ${array[j + 1]} since ${array[j]} > ${array[j + 1]}`));
        
        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        
        steps.push(createStep('swap-done', array, [j, j + 1], `Swapped.`));
      }
    }
    steps.push(createStep('sorted', array, [n - i - 1], `${array[n - i - 1]} is in its final sorted position.`));
  }
  
  steps.push(createStep('sorted', array, [0], `${array[0]} is in its final sorted position.`));
  steps.push(createStep('done', array, [], `Array is completely sorted.`));

  return steps;
};
