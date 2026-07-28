export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    stepsData.push({ type: 'info', array: [...array], indices: [], message: `Using gap of ${gap}` });

    for (let i = gap; i < n; i += 1) {
      let temp = array[i];
      let j;
      
      stepsData.push({ type: 'info', array: [...array], indices: [i], message: `Holding ${temp} from index ${i}` });

      for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
        stepsData.push({ type: 'compare', array: [...array], indices: [j, j - gap], message: `Comparing ${array[j - gap]} and ${temp}` });
        stepsData.push({ type: 'swap', array: [...array], indices: [j, j - gap], message: `Moving ${array[j - gap]} forward by gap ${gap}` });
        array[j] = array[j - gap];
        stepsData.push({ type: 'swap-done', array: [...array], indices: [j], message: `Moved.` });
      }

      if (j !== i) {
        stepsData.push({ type: 'swap', array: [...array], indices: [j], message: `Placing ${temp} at index ${j}` });
      }
      array[j] = temp;
      if (j !== i) {
        stepsData.push({ type: 'swap-done', array: [...array], indices: [j], message: `Placed.` });
      }
    }
  }

  // Final pass to mark all as sorted
  for (let i = 0; i < n; i++) {
    stepsData.push({ type: 'sorted', array: [...array], indices: [i], message: `${array[i]} is in its final position.` });
  }
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Array is completely sorted.` });

  return stepsData;
};
