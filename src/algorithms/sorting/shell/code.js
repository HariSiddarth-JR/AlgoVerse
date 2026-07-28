export const code = [
  "function shellSort(array) {",
  "  const n = array.length;",
  "  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {",
  "    for (let i = gap; i < n; i += 1) {",
  "      let temp = array[i];",
  "      let j;",
  "      for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {",
  "        array[j] = array[j - gap];",
  "      }",
  "      array[j] = temp;",
  "    }",
  "  }",
  "  return array;",
  "}"
];
