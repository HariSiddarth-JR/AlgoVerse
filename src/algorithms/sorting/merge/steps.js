export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];

  const merge = (mainArray, startIdx, middleIdx, endIdx, auxiliaryArray) => {
    let k = startIdx;
    let i = startIdx;
    let j = middleIdx + 1;

    while (i <= middleIdx && j <= endIdx) {
      stepsData.push({ type: 'compare', array: [...mainArray], indices: [i, j], message: `Comparing ${auxiliaryArray[i]} and ${auxiliaryArray[j]}` });
      if (auxiliaryArray[i] <= auxiliaryArray[j]) {
        stepsData.push({ type: 'swap', array: [...mainArray], indices: [k], message: `Writing ${auxiliaryArray[i]} into index ${k}` });
        mainArray[k] = auxiliaryArray[i];
        stepsData.push({ type: 'swap-done', array: [...mainArray], indices: [k], message: `Written.` });
        i++;
      } else {
        stepsData.push({ type: 'swap', array: [...mainArray], indices: [k], message: `Writing ${auxiliaryArray[j]} into index ${k}` });
        mainArray[k] = auxiliaryArray[j];
        stepsData.push({ type: 'swap-done', array: [...mainArray], indices: [k], message: `Written.` });
        j++;
      }
      k++;
    }

    while (i <= middleIdx) {
      stepsData.push({ type: 'swap', array: [...mainArray], indices: [k], message: `Writing remaining ${auxiliaryArray[i]} into index ${k}` });
      mainArray[k] = auxiliaryArray[i];
      stepsData.push({ type: 'swap-done', array: [...mainArray], indices: [k], message: `Written.` });
      i++;
      k++;
    }

    while (j <= endIdx) {
      stepsData.push({ type: 'swap', array: [...mainArray], indices: [k], message: `Writing remaining ${auxiliaryArray[j]} into index ${k}` });
      mainArray[k] = auxiliaryArray[j];
      stepsData.push({ type: 'swap-done', array: [...mainArray], indices: [k], message: `Written.` });
      j++;
      k++;
    }
  };

  const mergeSortHelper = (mainArray, startIdx, endIdx, auxiliaryArray) => {
    if (startIdx === endIdx) return;
    const middleIdx = Math.floor((startIdx + endIdx) / 2);
    mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray);
    mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray);
    merge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray);
  };

  const auxiliaryArray = [...initialArray];
  mergeSortHelper(array, 0, array.length - 1, auxiliaryArray);

  for (let i = 0; i < array.length; i++) {
    stepsData.push({ type: 'sorted', array: [...array], indices: [i], message: `${array[i]} is in its final position.` });
  }
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Array is completely sorted.` });

  return stepsData;
};
