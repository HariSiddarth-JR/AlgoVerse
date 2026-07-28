export const steps = (initialArray) => {
  const stepsData = [];
  // Jump search requires sorted array
  const array = [...initialArray].sort((a, b) => a - b);
  const n = array.length;
  const target = array[Math.floor(n * 0.75)]; // 75% through the array
  
  stepsData.push({ type: 'info', array: [...array], indices: [], message: `Starting Jump Search for target ${target}` });

  let step = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Finding the block where the element is present
  while (array[Math.min(step, n) - 1] < target) {
    const activeBounds = [];
    for (let i = prev; i < Math.min(step, n); i++) activeBounds.push(i);
    
    stepsData.push({ type: 'bounds', array: [...array], indices: activeBounds, message: `Jumping... Current block is index ${prev} to ${Math.min(step, n) - 1}` });
    stepsData.push({ type: 'compare', array: [...array], indices: [Math.min(step, n) - 1], message: `Is block end ${array[Math.min(step, n) - 1]} < ${target}? Yes.` });
    
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) break;
  }

  // Doing a linear search for target in block
  let found = false;
  if (prev < n) {
    const activeBounds = [];
    for (let i = prev; i < Math.min(step, n); i++) activeBounds.push(i);
    
    stepsData.push({ type: 'bounds', array: [...array], indices: activeBounds, message: `Target may be in block ${prev} to ${Math.min(step, n) - 1}` });
    
    while (prev < Math.min(step, n)) {
      stepsData.push({ type: 'visit', array: [...array], indices: [prev], message: `Linear search: Visiting index ${prev}, value is ${array[prev]}` });
      stepsData.push({ type: 'compare', array: [...array], indices: [prev], message: `Is ${array[prev]} == ${target}?` });
      
      if (array[prev] === target) {
        stepsData.push({ type: 'found', array: [...array], indices: [prev], message: `Target ${target} found at index ${prev}!` });
        found = true;
        break;
      } else {
        stepsData.push({ type: 'not-found', array: [...array], indices: [prev], message: `${array[prev]} != ${target}. Moving to next.` });
      }
      prev++;
    }
  }

  if (!found) {
    stepsData.push({ type: 'not-found', array: [...array], indices: [], message: `Target ${target} not found in array.` });
  }

  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Jump Search complete.` });
  return stepsData;
};
