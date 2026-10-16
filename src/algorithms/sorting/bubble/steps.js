export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  let comparisonsCount = 0;
  let swapsCount = 0;
  const sortedIndices = [];

  // Initial Start State
  stepsData.push({
    type: 'start',
    array: [...array],
    indices: [],
    message: `Starting Bubble Sort on an array of ${n} elements.`,
    metadata: {
      sortedIndices: [],
      comparisonsCount: 0,
      swapsCount: 0,
      actionReason: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.'
    }
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisonsCount++;

      stepsData.push({
        type: 'compare',
        array: [...array],
        indices: [j, j + 1],
        message: `Comparing adjacent elements ${array[j]} (index ${j}) and ${array[j + 1]} (index ${j + 1}).`,
        metadata: {
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          actionReason: `Checking if ${array[j]} > ${array[j + 1]} to see if a swap is required.`
        }
      });

      if (array[j] > array[j + 1]) {
        swapsCount++;

        stepsData.push({
          type: 'swap',
          array: [...array],
          indices: [j, j + 1],
          message: `${array[j]} is greater than ${array[j + 1]}, so they are swapped.`,
          metadata: {
            sortedIndices: [...sortedIndices],
            comparisonsCount,
            swapsCount,
            actionReason: `Bubbling the larger value ${array[j]} towards the end of the array.`
          }
        });

        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;

        stepsData.push({
          type: 'swap-done',
          array: [...array],
          indices: [j, j + 1],
          message: `Swapped ${array[j + 1]} and ${array[j]}.`,
          metadata: {
            sortedIndices: [...sortedIndices],
            comparisonsCount,
            swapsCount,
            actionReason: 'Adjacent elements have been reordered.'
          }
        });
      }
    }

    const sortedIdx = n - i - 1;
    sortedIndices.push(sortedIdx);

    stepsData.push({
      type: 'sorted',
      array: [...array],
      indices: [sortedIdx],
      message: `The largest remaining element ${array[sortedIdx]} is now in its correct position at index ${sortedIdx}.`,
      metadata: {
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        actionReason: 'After each pass, the largest unsorted element bubbles up to its final rightmost position.'
      }
    });
  }

  if (!sortedIndices.includes(0)) {
    sortedIndices.push(0);
    stepsData.push({
      type: 'sorted',
      array: [...array],
      indices: [0],
      message: `Position 0 (value ${array[0]}) is naturally in its final position.`,
      metadata: {
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        actionReason: 'All elements have bubbled into their correct positions.'
      }
    });
  }

  stepsData.push({
    type: 'done',
    array: [...array],
    indices: [],
    message: `Bubble Sort complete! Array is fully sorted in ${comparisonsCount} comparisons and ${swapsCount} swaps.`,
    metadata: {
      sortedIndices: Array.from({ length: n }, (_, idx) => idx),
      comparisonsCount,
      swapsCount,
      actionReason: 'Array is completely sorted.'
    }
  });

  return stepsData;
};
