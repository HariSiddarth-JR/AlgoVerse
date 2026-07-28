export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  const heapify = (arr, n, i) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      stepsData.push({ type: 'compare', array: [...arr], indices: [largest, left], message: `Comparing parent ${arr[largest]} with left child ${arr[left]}` });
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < n) {
      stepsData.push({ type: 'compare', array: [...arr], indices: [largest, right], message: `Comparing current largest ${arr[largest]} with right child ${arr[right]}` });
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      stepsData.push({ type: 'swap', array: [...arr], indices: [i, largest], message: `Swapping ${arr[i]} and ${arr[largest]} to maintain max heap` });
      let temp = arr[i];
      arr[i] = arr[largest];
      arr[largest] = temp;
      stepsData.push({ type: 'swap-done', array: [...arr], indices: [i, largest], message: `Swapped.` });
      
      heapify(arr, n, largest);
    }
  };

  stepsData.push({ type: 'info', array: [...array], indices: [], message: `Building max heap...` });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(array, n, i);
  }

  stepsData.push({ type: 'info', array: [...array], indices: [], message: `Max heap built. Starting sort...` });
  for (let i = n - 1; i > 0; i--) {
    stepsData.push({ type: 'swap', array: [...array], indices: [0, i], message: `Moving max element ${array[0]} to the end` });
    let temp = array[0];
    array[0] = array[i];
    array[i] = temp;
    stepsData.push({ type: 'swap-done', array: [...array], indices: [0, i], message: `Swapped.` });
    
    stepsData.push({ type: 'sorted', array: [...array], indices: [i], message: `${array[i]} is in its final position.` });
    
    heapify(array, i, 0);
  }
  
  stepsData.push({ type: 'sorted', array: [...array], indices: [0], message: `${array[0]} is in its final position.` });
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Array is completely sorted.` });

  return stepsData;
};
