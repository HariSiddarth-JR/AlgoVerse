export const selectionSortCode = [
  "function selectionSort(array) {",
  "  const n = array.length;",
  "  for (let i = 0; i < n - 1; i++) {",
  "    let minIdx = i;",
  "    for (let j = i + 1; j < n; j++) {",
  "      if (array[j] < array[minIdx]) {",
  "        minIdx = j;",
  "      }",
  "    }",
  "    if (minIdx !== i) {",
  "      const temp = array[i];",
  "      array[i] = array[minIdx];",
  "      array[minIdx] = temp;",
  "    }",
  "  }",
  "  return array;",
  "}"
];
