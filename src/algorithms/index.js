import bubbleSort from './sorting/bubble';
import selectionSort from './sorting/selection';
import insertionSort from './sorting/insertion';
import mergeSort from './sorting/merge';
import quickSort from './sorting/quick';
import heapSort from './sorting/heap';
import shellSort from './sorting/shell';

import linearSearch from './searching/linear';
import binarySearch from './searching/binary';
import jumpSearch from './searching/jump';

// Central Registry mapping ID -> Algorithm Plugin
export const algorithmsRegistry = {
  [bubbleSort.id]: bubbleSort,
  [selectionSort.id]: selectionSort,
  [insertionSort.id]: insertionSort,
  [mergeSort.id]: mergeSort,
  [quickSort.id]: quickSort,
  [heapSort.id]: heapSort,
  [shellSort.id]: shellSort,
  [linearSearch.id]: linearSearch,
  [binarySearch.id]: binarySearch,
  [jumpSearch.id]: jumpSearch
};
