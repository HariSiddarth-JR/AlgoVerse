import { getBubbleSortSteps } from '../utils/bubbleSortSteps';
import { bubbleSortCode } from './bubbleSortCode';
import { bubbleSortInfo } from './bubbleSortInfo';

import { getSelectionSortSteps } from '../utils/selectionSortSteps';
import { selectionSortCode } from './selectionSortCode';
import { selectionSortInfo } from './selectionSortInfo';

export const algorithms = {
  bubbleSort: {
    id: 'bubbleSort',
    title: 'Bubble Sort',
    getSteps: getBubbleSortSteps,
    code: bubbleSortCode,
    info: bubbleSortInfo
  },
  selectionSort: {
    id: 'selectionSort',
    title: 'Selection Sort',
    getSteps: getSelectionSortSteps,
    code: selectionSortCode,
    info: selectionSortInfo
  }
};
