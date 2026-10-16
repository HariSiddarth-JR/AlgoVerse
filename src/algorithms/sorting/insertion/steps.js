export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  let comparisonsCount = 0;
  let swapsCount = 0;

  stepsData.push({
    type: 'start',
    array: [...array],
    indices: [],
    message: `Starting Insertion Sort on an array of ${n} elements.`,
    metadata: {
      sortedIndices: [0],
      comparisonsCount: 0,
      swapsCount: 0,
      actionReason: 'Insertion Sort builds a sorted prefix one element at a time.'
    }
  });

  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;

    stepsData.push({
      type: 'info',
      array: [...array],
      indices: [i],
      message: `Key element is ${key} at index ${i}.`,
      metadata: {
        sortedIndices: Array.from({ length: i }, (_, idx) => idx),
        comparisonsCount,
        swapsCount,
        actionReason: `Assuming prefix 0..${i - 1} is sorted. Selecting ${key} to insert into position.`
      }
    });

    while (j >= 0 && array[j] > key) {
      comparisonsCount++;
      stepsData.push({
        type: 'compare',
        array: [...array],
        indices: [j, j + 1],
        message: `Comparing element ${array[j]} at index ${j} with key ${key}.`,
        metadata: {
          sortedIndices: Array.from({ length: i }, (_, idx) => idx),
          comparisonsCount,
          swapsCount,
          actionReason: `${array[j]} > ${key}, so ${array[j]} must shift right.`
        }
      });

      swapsCount++;
      stepsData.push({
        type: 'swap',
        array: [...array],
        indices: [j, j + 1],
        message: `Shifting ${array[j]} right to index ${j + 1}.`,
        metadata: {
          sortedIndices: Array.from({ length: i }, (_, idx) => idx),
          comparisonsCount,
          swapsCount,
          actionReason: `Making space for key ${key}.`
        }
      });

      array[j + 1] = array[j];
      j = j - 1;

      stepsData.push({
        type: 'swap-done',
        array: [...array],
        indices: [j + 1],
        message: `Shifted element to index ${j + 2}.`,
        metadata: {
          sortedIndices: Array.from({ length: i }, (_, idx) => idx),
          comparisonsCount,
          swapsCount
        }
      });
    }

    if (j >= 0) {
      comparisonsCount++;
      stepsData.push({
        type: 'compare',
        array: [...array],
        indices: [j, j + 1],
        message: `Comparing ${array[j]} at index ${j} with key ${key}.`,
        metadata: {
          sortedIndices: Array.from({ length: i }, (_, idx) => idx),
          comparisonsCount,
          swapsCount,
          actionReason: `${array[j]} <= ${key}, insertion position found.`
        }
      });
    }

    array[j + 1] = key;
    stepsData.push({
      type: 'info',
      array: [...array],
      indices: [j + 1],
      message: `Inserted key ${key} into index ${j + 1}.`,
      metadata: {
        sortedIndices: Array.from({ length: i + 1 }, (_, idx) => idx),
        comparisonsCount,
        swapsCount,
        actionReason: `Key ${key} is now in its correct sorted position within prefix 0..${i}.`
      }
    });
  }

  stepsData.push({
    type: 'done',
    array: [...array],
    indices: [],
    message: `Insertion Sort complete! Array is fully sorted.`,
    metadata: {
      sortedIndices: Array.from({ length: n }, (_, idx) => idx),
      comparisonsCount,
      swapsCount,
      actionReason: 'All elements inserted into sorted order.'
    }
  });

  return stepsData;
};
