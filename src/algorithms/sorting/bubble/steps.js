export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      stepsData.push({ type: 'compare', array: [...array], indices: [j, j + 1], message: `Comparing ${array[j]} and ${array[j + 1]}` });
      
      if (array[j] > array[j + 1]) {
        stepsData.push({ type: 'swap', array: [...array], indices: [j, j + 1], message: `Swapping ${array[j]} and ${array[j + 1]}` });
        
        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        
        stepsData.push({ type: 'swap-done', array: [...array], indices: [j, j + 1], message: `Swapped.` });
      }
    }
    stepsData.push({ type: 'sorted', array: [...array], indices: [n - i - 1], message: `${array[n - i - 1]} is in its final position.` });
  }
  
  stepsData.push({ type: 'sorted', array: [...array], indices: [0], message: `${array[0]} is in its final position.` });
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Array is completely sorted.` });

  return stepsData;
};
