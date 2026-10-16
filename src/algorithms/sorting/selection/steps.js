export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  const n = array.length;

  let comparisonsCount = 0;
  let swapsCount = 0;
  const sortedIndices = [];

  // Step 0: Initial Start State
  stepsData.push({
    type: 'start',
    array: [...array],
    indices: [],
    message: `Starting Selection Sort on an array of ${n} elements.`,
    metadata: {
      minimumIndex: null,
      minimumValue: null,
      sortedIndices: [],
      comparisonsCount: 0,
      swapsCount: 0,
      actionReason: 'Selection Sort searches for the smallest unsorted element and places it in its correct position.'
    }
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Event 1: Initial minimum selection for pass i
    stepsData.push({
      type: 'newMin',
      array: [...array],
      indices: [minIdx],
      message: `${array[minIdx]} at index ${minIdx} is assumed as the initial minimum for pass ${i + 1}.`,
      metadata: {
        minimumIndex: minIdx,
        minimumValue: array[minIdx],
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        actionReason: 'Pass starts by setting the first unsorted element as the initial minimum.'
      }
    });

    for (let j = i + 1; j < n; j++) {
      comparisonsCount++;

      // Event 2: Comparison between current minimum and element j
      stepsData.push({
        type: 'compare',
        array: [...array],
        indices: [minIdx, j],
        message: `Comparing current minimum ${array[minIdx]} (index ${minIdx}) with ${array[j]} (index ${j}).`,
        metadata: {
          minimumIndex: minIdx,
          minimumValue: array[minIdx],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          actionReason: `Checking if ${array[j]} is smaller than ${array[minIdx]}.`
        }
      });

      if (array[j] < array[minIdx]) {
        const prevMin = array[minIdx];
        minIdx = j;

        // Event 3: New minimum found!
        stepsData.push({
          type: 'newMin',
          array: [...array],
          indices: [minIdx],
          message: `${array[minIdx]} is smaller than ${prevMin}. New minimum found at index ${minIdx}!`,
          metadata: {
            minimumIndex: minIdx,
            minimumValue: array[minIdx],
            sortedIndices: [...sortedIndices],
            comparisonsCount,
            swapsCount,
            actionReason: `Found a smaller value ${array[minIdx]} at index ${minIdx}. Updating minimum reference.`
          }
        });
      }
    }

    if (minIdx !== i) {
      swapsCount++;

      // Event 4: Swap minimum into position i
      stepsData.push({
        type: 'swap',
        array: [...array],
        indices: [i, minIdx],
        message: `Swapping ${array[i]} (index ${i}) with minimum ${array[minIdx]} (index ${minIdx}).`,
        metadata: {
          minimumIndex: minIdx,
          minimumValue: array[minIdx],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          actionReason: `Placing the smallest unsorted element ${array[minIdx]} into its final position at index ${i}.`
        }
      });

      const temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;

      // Event 5: Swap complete
      stepsData.push({
        type: 'swap-done',
        array: [...array],
        indices: [i, minIdx],
        message: `Swapped values ${array[i]} and ${array[minIdx]}.`,
        metadata: {
          minimumIndex: i,
          minimumValue: array[i],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          actionReason: 'Swap completed successfully.'
        }
      });
    } else {
      // Info: Element is already minimum
      stepsData.push({
        type: 'info',
        array: [...array],
        indices: [i],
        message: `${array[i]} at index ${i} is already the minimum element. No swap needed.`,
        metadata: {
          minimumIndex: i,
          minimumValue: array[i],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          actionReason: 'Element is already in its correct sorted position.'
        }
      });
    }

    // Event 6: Element i is now sorted
    sortedIndices.push(i);
    stepsData.push({
      type: 'sorted',
      array: [...array],
      indices: [i],
      message: `Position ${i} (value ${array[i]}) is now officially sorted.`,
      metadata: {
        minimumIndex: null,
        minimumValue: null,
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        actionReason: 'The prefix of the array up to this index is now fully sorted.'
      }
    });
  }

  // Last element is automatically sorted
  if (!sortedIndices.includes(n - 1)) {
    sortedIndices.push(n - 1);
    stepsData.push({
      type: 'sorted',
      array: [...array],
      indices: [n - 1],
      message: `Position ${n - 1} (value ${array[n - 1]}) is in its final sorted position.`,
      metadata: {
        minimumIndex: null,
        minimumValue: null,
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        actionReason: 'The final remaining element is inherently sorted.'
      }
    });
  }

  // Event 7: Completion
  stepsData.push({
    type: 'done',
    array: [...array],
    indices: [],
    message: `Selection Sort complete! Array is fully sorted in ${comparisonsCount} comparisons and ${swapsCount} swaps.`,
    metadata: {
      minimumIndex: null,
      minimumValue: null,
      sortedIndices: Array.from({ length: n }, (_, idx) => idx),
      comparisonsCount,
      swapsCount,
      actionReason: 'All elements have been placed in ascending order.'
    }
  });

  return stepsData;
};
