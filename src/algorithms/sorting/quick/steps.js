export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];

  const partition = (arr, low, high) => {
    let pivot = arr[high];
    stepsData.push({ type: 'info', array: [...arr], indices: [high], message: `Choosing pivot ${pivot} at index ${high}` });
    
    let i = low - 1;
    for (let j = low; j < high; j++) {
      stepsData.push({ type: 'compare', array: [...arr], indices: [j, high], message: `Comparing ${arr[j]} and pivot ${pivot}` });
      if (arr[j] < pivot) {
        i++;
        stepsData.push({ type: 'swap', array: [...arr], indices: [i, j], message: `Swapping ${arr[i]} and ${arr[j]}` });
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        stepsData.push({ type: 'swap-done', array: [...arr], indices: [i, j], message: `Swapped.` });
      }
    }
    
    stepsData.push({ type: 'swap', array: [...arr], indices: [i + 1, high], message: `Swapping pivot ${pivot} to correct position` });
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    stepsData.push({ type: 'swap-done', array: [...arr], indices: [i + 1, high], message: `Swapped.` });
    
    stepsData.push({ type: 'sorted', array: [...arr], indices: [i + 1], message: `Pivot ${pivot} is in its final position.` });
    return i + 1;
  };

  const quickSortHelper = (arr, low, high) => {
    if (low < high) {
      let pi = partition(arr, low, high);
      quickSortHelper(arr, low, pi - 1);
      quickSortHelper(arr, pi + 1, high);
    } else if (low >= 0 && low < arr.length) {
      stepsData.push({ type: 'sorted', array: [...arr], indices: [low], message: `${arr[low]} is in its final position.` });
    }
  };

  quickSortHelper(array, 0, array.length - 1);
  
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Array is completely sorted.` });
  return stepsData;
};
