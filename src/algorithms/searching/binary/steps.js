export const steps = (initialArray) => {
  const stepsData = [];
  // Binary search requires sorted array
  const array = [...initialArray].sort((a, b) => a - b);
  const target = array[Math.floor(array.length * 0.75)]; // 75% through the array
  
  stepsData.push({ type: 'info', array: [...array], indices: [], message: `Starting Binary Search for target ${target}` });

  let left = 0;
  let right = array.length - 1;
  let found = false;

  while (left <= right) {
    const activeBounds = [];
    for (let i = left; i <= right; i++) activeBounds.push(i);
    
    stepsData.push({ type: 'bounds', array: [...array], indices: activeBounds, message: `Current search space is index ${left} to ${right}` });

    const mid = Math.floor((left + right) / 2);
    stepsData.push({ type: 'visit', array: [...array], indices: [mid], message: `Checking middle element at index ${mid}, value is ${array[mid]}` });
    stepsData.push({ type: 'compare', array: [...array], indices: [mid], message: `Is ${array[mid]} == ${target}?` });

    if (array[mid] === target) {
      stepsData.push({ type: 'found', array: [...array], indices: [mid], message: `Target ${target} found at index ${mid}!` });
      found = true;
      break;
    } else if (array[mid] < target) {
      stepsData.push({ type: 'info', array: [...array], indices: [mid], message: `${array[mid]} < ${target}. Discarding left half.` });
      left = mid + 1;
    } else {
      stepsData.push({ type: 'info', array: [...array], indices: [mid], message: `${array[mid]} > ${target}. Discarding right half.` });
      right = mid - 1;
    }
  }

  if (!found) {
    stepsData.push({ type: 'not-found', array: [...array], indices: [], message: `Target ${target} not found in array.` });
  }

  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Binary Search complete.` });
  return stepsData;
};
