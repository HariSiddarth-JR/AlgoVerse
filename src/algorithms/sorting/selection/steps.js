export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    stepsData.push({ type: 'newMin', array: [...array], indices: [minIdx], message: `Current minimum is ${array[minIdx]} at index ${minIdx}` });

    for (let j = i + 1; j < n; j++) {
      stepsData.push({ type: 'compare', array: [...array], indices: [minIdx, j], message: `Comparing current minimum ${array[minIdx]} with ${array[j]}` });
      
      if (array[j] < array[minIdx]) {
        minIdx = j;
        stepsData.push({ type: 'newMin', array: [...array], indices: [minIdx], message: `Found new minimum ${array[minIdx]} at index ${minIdx}` });
      }
    }
    
    if (minIdx !== i) {
      stepsData.push({ type: 'swap', array: [...array], indices: [i, minIdx], message: `Swapping ${array[i]} with minimum ${array[minIdx]}` });
      
      const temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      
      stepsData.push({ type: 'swap-done', array: [...array], indices: [i, minIdx], message: `Swapped.` });
    } else {
      stepsData.push({ type: 'info', array: [...array], indices: [i], message: `Element ${array[i]} is already the minimum.` });
    }
    
    stepsData.push({ type: 'sorted', array: [...array], indices: [i], message: `${array[i]} is in its final position.` });
  }
  
  stepsData.push({ type: 'sorted', array: [...array], indices: [n - 1], message: `${array[n - 1]} is in its final position.` });
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Array is completely sorted.` });

  return stepsData;
};
