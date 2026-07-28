export const generateRandomArray = (length, min = 10, max = 100) => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

export const createStep = (type, array, indices = [], message = '', metadata = {}) => {
  return {
    type,
    array: [...array],
    indices,
    message,
    metadata
  };
};
