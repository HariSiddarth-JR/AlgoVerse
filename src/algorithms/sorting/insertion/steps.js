export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;

    stepsData.push({ type: 'info', array: [...array], indices: [i], message: `Key is ${key} at index ${i}` });

    while (j >= 0 && array[j] > key) {
      stepsData.push({ type: 'compare', array: [...array], indices: [j, j + 1], message: `Comparing ${array[j]} and ${key}` });
      stepsData.push({ type: 'swap', array: [...array], indices: [j, j + 1], message: `Moving ${array[j]} to the right` });
      
      array[j + 1] = array[j];
      j = j - 1;
      
      stepsData.push({ type: 'swap-done', array: [...array], indices: [j + 1], message: `Moved.` });
    }
    
    array[j + 1] = key;
    stepsData.push({ type: 'info', array: [...array], indices: [j + 1], message: `Inserted key ${key} at index ${j + 1}` });
  }

  // Final pass to mark all as sorted
  for (let i = 0; i < n; i++) {
    stepsData.push({ type: 'sorted', array: [...array], indices: [i], message: `${array[i]} is in its final position.` });
  }
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Array is completely sorted.` });

  return stepsData;
};
