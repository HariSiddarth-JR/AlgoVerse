export const steps = (initialArray) => {
  const stepsData = [];
  const array = [...initialArray];
  // Target is arbitrarily the last element or random element for demo purposes.
  // We'll just pick a random element from the array to guarantee it's found,
  // or a specific element so it demonstrates searching.
  const target = array[Math.floor(array.length * 0.75)]; // 75% through the array
  
  stepsData.push({ type: 'info', array: [...array], indices: [], message: `Starting Linear Search for target ${target}` });

  let found = false;
  for (let i = 0; i < array.length; i++) {
    stepsData.push({ type: 'visit', array: [...array], indices: [i], message: `Visiting index ${i}, value is ${array[i]}` });
    stepsData.push({ type: 'compare', array: [...array], indices: [i], message: `Is ${array[i]} == ${target}?` });
    
    if (array[i] === target) {
      stepsData.push({ type: 'found', array: [...array], indices: [i], message: `Target ${target} found at index ${i}!` });
      found = true;
      break;
    } else {
      stepsData.push({ type: 'not-found', array: [...array], indices: [i], message: `${array[i]} != ${target}. Moving to next.` });
    }
  }
  
  if (!found) {
    stepsData.push({ type: 'not-found', array: [...array], indices: [], message: `Target ${target} not found in array.` });
  }
  
  stepsData.push({ type: 'done', array: [...array], indices: [], message: `Linear Search complete.` });
  return stepsData;
};
