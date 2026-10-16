const { normalizeAlgorithmId } = require("../constants/algorithms");

const QUIZ_BANK = {
    bubble: [
        {
            id: "bubble-q1",
            question: "What is the worst-case time complexity of Bubble Sort?",
            options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
            correctOption: 2,
            explanation: "In the worst case (e.g. reverse sorted array), Bubble Sort makes n*(n-1)/2 comparisons, resulting in O(n²) time complexity.",
        },
        {
            id: "bubble-q2",
            question: "How can Bubble Sort be optimized to achieve O(n) best-case time complexity?",
            options: [
                "By sorting from both ends simultaneously",
                "By tracking if any swaps occurred in a pass and stopping early if none did",
                "By dividing the array into halves",
                "By using extra memory to cache comparisons",
            ],
            correctOption: 1,
            explanation: "If an entire pass completes with zero swaps, the array is already sorted, allowing early exit in O(n) time.",
        },
        {
            id: "bubble-q3",
            question: "Is Bubble Sort a stable sorting algorithm?",
            options: [
                "Yes, because adjacent elements with equal values are never swapped",
                "No, elements jump over multiple positions",
                "Only for integer arrays",
                "Only if extra space is allocated",
            ],
            correctOption: 0,
            explanation: "Bubble Sort is stable because it only swaps adjacent elements when the left element is strictly greater than the right element.",
        },
        {
            id: "bubble-q4",
            question: "What is guaranteed after the k-th pass of standard Bubble Sort?",
            options: [
                "The k largest elements are in their final sorted positions at the end",
                "The k smallest elements are in their final positions at the beginning",
                "The first k elements are in sorted order",
                "The middle k elements are partitioned",
            ],
            correctOption: 0,
            explanation: "In each pass, the largest remaining unsorted element bubbles up to the end of the array.",
        },
        {
            id: "bubble-q5",
            question: "What is the auxiliary space complexity of Bubble Sort?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            correctOption: 0,
            explanation: "Bubble Sort operates in-place, requiring only a constant O(1) extra space for temporary swap variables.",
        },
        {
            id: "bubble-q6",
            question: "How many comparisons does standard unoptimized Bubble Sort make on an array of size n?",
            options: ["n(n - 1) / 2", "n log n", "n - 1", "2n"],
            correctOption: 0,
            explanation: "In unoptimized Bubble Sort, comparisons are (n-1) + (n-2) + ... + 1 = n(n - 1) / 2 regardless of initial order.",
        },
        {
            id: "bubble-q7",
            question: "When is Bubble Sort considered practical in software engineering?",
            options: [
                "For small, nearly-sorted collections or teaching algorithm mechanics",
                "For massive distributed datasets",
                "For real-time streaming audio processing",
                "When minimizing CPU comparisons is critical",
            ],
            correctOption: 0,
            explanation: "Bubble Sort has high overhead for large datasets and is primarily used pedagogically or for small lists known to be nearly sorted.",
        },
    ],
    selection: [
        {
            id: "selection-q1",
            question: "What is the primary characteristic of Selection Sort in terms of swaps?",
            options: [
                "It makes at most O(n) swaps throughout the entire sort",
                "It swaps adjacent elements repeatedly",
                "It never swaps any elements",
                "It makes O(n²) swaps in all cases",
            ],
            correctOption: 0,
            explanation: "Selection Sort finds the minimum element and makes at most one swap per outer pass, requiring at most n-1 swaps.",
        },
        {
            id: "selection-q2",
            question: "What is the best-case time complexity of standard Selection Sort?",
            options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
            correctOption: 2,
            explanation: "Selection Sort always scans the remaining unsorted portion to find the minimum, even if the array is already sorted, resulting in O(n²) comparisons in all cases.",
        },
        {
            id: "selection-q3",
            question: "Why is standard array Selection Sort generally classified as unstable?",
            options: [
                "Long-distance swaps can move an element past an identical element",
                "It requires extra dynamic memory",
                "It runs non-deterministically",
                "It compares elements backwards",
            ],
            correctOption: 0,
            explanation: "Swapping the minimum element into the target index can place it ahead of an identical key located between the indices.",
        },
        {
            id: "selection-q4",
            question: "What is the auxiliary space complexity of Selection Sort?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            correctOption: 0,
            explanation: "Selection Sort sorts in-place using O(1) auxiliary memory.",
        },
        {
            id: "selection-q5",
            question: "In which scenario might Selection Sort be preferred over Bubble Sort?",
            options: [
                "When writing to memory is significantly more expensive than reading/comparing",
                "When stability is an absolute requirement",
                "When the input is already in sorted order",
                "When the dataset contains millions of items",
            ],
            correctOption: 0,
            explanation: "Selection Sort performs at most O(n) memory writes (swaps), compared to O(n²) writes for Bubble Sort.",
        },
        {
            id: "selection-q6",
            question: "What does Selection Sort do in pass i of an array of length n?",
            options: [
                "Finds the minimum in subarray [i...n-1] and swaps it into index i",
                "Finds adjacent inversions and fixes all of them",
                "Splits subarray [i...n-1] into two halves",
                "Inserts item i into the sorted subarray [0...i-1]",
            ],
            correctOption: 0,
            explanation: "Pass i finds the minimum element in indices i through n-1 and swaps it with the element at position i.",
        },
        {
            id: "selection-q7",
            question: "Does Selection Sort benefit in time complexity if the array is already sorted?",
            options: [
                "No, it still performs the full n(n - 1) / 2 comparisons",
                "Yes, it finishes in O(n) time",
                "Yes, it completes in O(log n) time",
                "It skips the scanning step entirely",
            ],
            correctOption: 0,
            explanation: "Selection Sort does not check whether remaining elements are ordered; it always scans to find the true minimum.",
        },
    ],
    insertion: [
        {
            id: "insertion-q1",
            question: "What is the best-case time complexity of Insertion Sort and when does it occur?",
            options: [
                "O(n) when the array is already sorted",
                "O(n log n) when the array is randomly shuffled",
                "O(n²) when the array is in reverse order",
                "O(1) when the array has only two items",
            ],
            correctOption: 0,
            explanation: "When the array is already sorted, Insertion Sort only makes one comparison per element and zero shifts, completing in O(n) time.",
        },
        {
            id: "insertion-q2",
            question: "Why is Insertion Sort often used as the base case in hybrid algorithms like Timsort?",
            options: [
                "It is extremely fast with low overhead for small or nearly-sorted datasets",
                "It has O(log n) space complexity",
                "It is completely non-recursive",
                "It requires no comparisons",
            ],
            correctOption: 0,
            explanation: "Insertion Sort has negligible overhead and runs very fast in practice on small arrays (e.g. n < 32) and nearly-sorted data.",
        },
        {
            id: "insertion-q3",
            question: "Is Insertion Sort a stable sorting algorithm?",
            options: [
                "Yes, equal elements do not cross each other during shifts",
                "No, shifting disrupts duplicate keys",
                "Only when sorting integers",
                "Only if an auxiliary buffer is allocated",
            ],
            correctOption: 0,
            explanation: "Insertion Sort shifts elements that are strictly greater than the key, leaving equal keys in their original relative order.",
        },
        {
            id: "insertion-q4",
            question: "What is the worst-case time complexity of Insertion Sort?",
            options: ["O(n²)", "O(n log n)", "O(n)", "O(n!)"],
            correctOption: 0,
            explanation: "When the array is sorted in reverse order, each new element must be compared and shifted across the entire sorted prefix.",
        },
        {
            id: "insertion-q5",
            question: "What is an online sorting algorithm, and does Insertion Sort possess this property?",
            options: [
                "Yes, it can sort elements as they are streamed in one by one",
                "No, it requires the entire array upfront to build indices",
                "Yes, but only via an external server network API",
                "No, only Divide and Conquer algorithms can be online",
            ],
            correctOption: 0,
            explanation: "Insertion Sort can insert new elements one by one into an already-sorted collection without needing to restart the sort.",
        },
        {
            id: "insertion-q6",
            question: "What is the auxiliary space complexity of Insertion Sort?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            correctOption: 0,
            explanation: "Insertion Sort is an in-place algorithm that only requires constant O(1) additional storage.",
        },
        {
            id: "insertion-q7",
            question: "How does Insertion Sort place the current key into its correct position?",
            options: [
                "By shifting elements larger than the key one position to the right",
                "By swapping it immediately with the first element",
                "By partitioning the array into two equal buckets",
                "By using binary search to replace elements in-place",
            ],
            correctOption: 0,
            explanation: "Insertion Sort compares the key backwards through the sorted sublist, shifting elements right until the key's position is found.",
        },
    ],
    merge: [
        {
            id: "merge-q1",
            question: "What algorithmic paradigm does Merge Sort follow?",
            options: ["Greedy approach", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
            correctOption: 2,
            explanation: "Merge Sort recursively divides the array into two halves, sorts each half, and conquers by merging the sorted halves.",
        },
        {
            id: "merge-q2",
            question: "What is the auxiliary space complexity of standard array Merge Sort?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            correctOption: 2,
            explanation: "Standard Merge Sort requires O(n) auxiliary array space to merge the subarrays.",
        },
        {
            id: "merge-q3",
            question: "What is the worst-case time complexity of Merge Sort?",
            options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
            correctOption: 0,
            explanation: "Merge Sort consistently divides the problem in half (log n levels) and performs O(n) merge work at each level.",
        },
        {
            id: "merge-q4",
            question: "Is standard Merge Sort stable?",
            options: [
                "Yes, when merging takes from the left subarray on ties (<=)",
                "No, merging always reverses duplicate keys",
                "Only if implemented iteratively",
                "Only for strings",
            ],
            correctOption: 0,
            explanation: "By taking the left element when both elements are equal, Merge Sort preserves the original relative order.",
        },
        {
            id: "merge-q5",
            question: "Why is Merge Sort particularly well-suited for sorting singly linked lists?",
            options: [
                "Merging linked lists requires O(1) auxiliary pointer space and no random access",
                "Linked lists cannot be sorted by any other algorithm",
                "It makes zero comparisons on linked lists",
                "It avoids memory deallocation completely",
            ],
            correctOption: 0,
            explanation: "Linked lists allow merging by simply rewiring pointers without requiring O(n) additional buffer arrays.",
        },
        {
            id: "merge-q6",
            question: "What is the recurrence relation for standard Merge Sort?",
            options: ["T(n) = 2T(n/2) + O(n)", "T(n) = T(n-1) + O(n)", "T(n) = 2T(n/2) + O(1)", "T(n) = T(n/2) + O(1)"],
            correctOption: 0,
            explanation: "Merge Sort splits into 2 subproblems of size n/2 and merges them in linear O(n) time.",
        },
        {
            id: "merge-q7",
            question: "What is the best-case time complexity of standard Merge Sort?",
            options: ["O(n log n)", "O(n)", "O(1)", "O(log n)"],
            correctOption: 0,
            explanation: "Standard Merge Sort divides and merges fully regardless of whether the array was already sorted, running in O(n log n).",
        },
    ],
    quick: [
        {
            id: "quick-q1",
            question: "What is the average and worst-case time complexity of Quick Sort?",
            options: [
                "Average: O(n log n), Worst: O(n²)",
                "Average: O(n²), Worst: O(n log n)",
                "Average: O(n log n), Worst: O(n log n)",
                "Average: O(n), Worst: O(n²)",
            ],
            correctOption: 0,
            explanation: "Quick Sort averages O(n log n), but with poor pivot choices (such as always picking the smallest or largest element in a sorted array), it degrades to O(n²).",
        },
        {
            id: "quick-q2",
            question: "Which pivot selection technique helps prevent Quick Sort's worst-case on already sorted inputs?",
            options: [
                "Always choosing the first element",
                "Median-of-three or randomized pivot selection",
                "Always picking the last element",
                "Searching for the absolute minimum element",
            ],
            correctOption: 1,
            explanation: "Median-of-three (examining first, middle, last elements) or randomized pivot selection avoids predictable O(n²) behavior on sorted inputs.",
        },
        {
            id: "quick-q3",
            question: "What is the average auxiliary space complexity of Quick Sort on the call stack?",
            options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
            correctOption: 0,
            explanation: "Balanced recursive calls result in an average recursion depth of O(log n).",
        },
        {
            id: "quick-q4",
            question: "What is the primary role of the Partition step in Quick Sort?",
            options: [
                "Place pivot at its final sorted index with smaller elements left and larger right",
                "Merge two separately sorted halves into one array",
                "Find the median element in O(1) time",
                "Count the total number of inversions",
            ],
            correctOption: 0,
            explanation: "Partitioning reorders the array around the pivot value and returns the pivot's final index.",
        },
        {
            id: "quick-q5",
            question: "Is standard in-place Quick Sort stable?",
            options: [
                "No, swapping around the pivot can change relative order of equal keys",
                "Yes, it never reorders identical values",
                "Yes, if Hoare partition is used",
                "Only when using median-of-three",
            ],
            correctOption: 0,
            explanation: "In-place partitioning swaps elements across long distances, which can disrupt the relative ordering of equal elements.",
        },
        {
            id: "quick-q6",
            question: "What causes Quick Sort to degrade to O(n²) worst-case performance?",
            options: [
                "Repeatedly choosing the extreme smallest or largest element as the pivot",
                "Having all elements be unique integers",
                "Running on an odd-sized array",
                "Selecting the exact median as pivot",
            ],
            correctOption: 0,
            explanation: "When partitions are maximally unbalanced (e.g. 0 elements on one side and n-1 on the other), recursion depth reaches n.",
        },
        {
            id: "quick-q7",
            question: "What is 3-way (Dutch National Flag) partitioning used for in Quick Sort?",
            options: [
                "Handling inputs with large numbers of duplicate keys efficiently in O(n) time",
                "Sorting negative numbers separately",
                "Sorting strings alphabetically",
                "Eliminating recursion completely",
            ],
            correctOption: 0,
            explanation: "3-way partitioning groups equal keys together into a middle segment so they do not need further recursive sorting.",
        },
    ],
    heap: [
        {
            id: "heap-q1",
            question: "What is the worst-case time complexity of Heap Sort?",
            options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
            correctOption: 0,
            explanation: "Heap Sort builds a heap in O(n) time and performs n deletions of O(log n) each, guaranteeing O(n log n) in all cases.",
        },
        {
            id: "heap-q2",
            question: "What is the auxiliary space complexity of Heap Sort?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            correctOption: 0,
            explanation: "Heap Sort operates directly within the input array using an implicit binary heap, requiring O(1) extra space.",
        },
        {
            id: "heap-q3",
            question: "What is the time complexity to build the initial max-heap from an unsorted array of size n?",
            options: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"],
            correctOption: 0,
            explanation: "Using the bottom-up sift-down approach (heapify), building a heap takes linear O(n) time.",
        },
        {
            id: "heap-q4",
            question: "In an array-based binary heap (0-indexed), what are the child indices of node at index i?",
            options: ["2i + 1 and 2i + 2", "2i and 2i + 1", "i/2 and i/2 + 1", "i + 1 and i + 2"],
            correctOption: 0,
            explanation: "In a 0-indexed binary heap array, the left child is at 2i + 1 and the right child is at 2i + 2.",
        },
        {
            id: "heap-q5",
            question: "Is standard Heap Sort a stable sorting algorithm?",
            options: [
                "No, heap restructuring moves elements without preserving original order",
                "Yes, parent-child comparisons preserve stability",
                "Yes, because it uses a complete binary tree",
                "Only when using a min-heap",
            ],
            correctOption: 0,
            explanation: "Heapifying operations exchange elements non-adjacent to each other, which disrupts the original order of duplicate keys.",
        },
        {
            id: "heap-q6",
            question: "What step is repeatedly performed after building the initial max-heap in Heap Sort?",
            options: [
                "Swap root with the last unsorted element and heapify the new root",
                "Rebuild the entire heap from scratch",
                "Partition the array around the median",
                "Perform linear scans of the left half",
            ],
            correctOption: 0,
            explanation: "The maximum element is at the root; swapping it to the current end places it in sorted order, then sift-down restores the heap.",
        },
        {
            id: "heap-q7",
            question: "What property must every node satisfy in a max-heap?",
            options: [
                "Every parent node must be greater than or equal to its children",
                "Every node must have exactly two children",
                "The left child must be smaller than the right child",
                "Leaves must all contain negative numbers",
            ],
            correctOption: 0,
            explanation: "In a max-heap, the key at every node is greater than or equal to the keys of its children.",
        },
    ],
    shell: [
        {
            id: "shell-q1",
            question: "What is Shell Sort fundamentally?",
            options: [
                "A generalization of Insertion Sort using diminishing gap sequences",
                "A variant of Quick Sort with multiple pivots",
                "A non-comparison distribution sort",
                "A recursive tree sort",
            ],
            correctOption: 0,
            explanation: "Shell Sort improves Insertion Sort by comparing and swapping elements separated by a gap that shrinks on each pass.",
        },
        {
            id: "shell-q2",
            question: "What is the final gap size in every valid Shell Sort gap sequence?",
            options: ["1", "0", "2", "n/2"],
            correctOption: 0,
            explanation: "The final gap must always be 1, which performs standard Insertion Sort on an array that is already nearly sorted.",
        },
        {
            id: "shell-q3",
            question: "What is the auxiliary space complexity of Shell Sort?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            correctOption: 0,
            explanation: "Shell Sort sorts entirely in-place, requiring only O(1) auxiliary memory.",
        },
        {
            id: "shell-q4",
            question: "Is Shell Sort a stable sorting algorithm?",
            options: [
                "No, elements jump over gaps and can alter the order of equal keys",
                "Yes, because it is based on Insertion Sort",
                "Yes, provided the gap sequence is geometric",
                "Only when n is a power of 2",
            ],
            correctOption: 0,
            explanation: "Because comparisons and swaps take place across gap intervals, identical elements can swap positions relative to each other.",
        },
        {
            id: "shell-q5",
            question: "Why is Shell Sort significantly faster than standard Insertion Sort on random arrays?",
            options: [
                "Large initial gaps quickly move displaced elements over long distances",
                "It uses hash tables internally",
                "It eliminates all comparisons",
                "It converts the array into a binary search tree",
            ],
            correctOption: 0,
            explanation: "Standard Insertion Sort only moves elements one position at a time; Shell Sort moves them across the array in single steps early on.",
        },
        {
            id: "shell-q6",
            question: "What was the original gap sequence proposed by Donald Shell?",
            options: ["n/2, n/4, n/8, ..., 1", "1, 3, 7, 15, ..., 2^k - 1", "1, 4, 13, 40, ...", "Fibonacci numbers"],
            correctOption: 0,
            explanation: "Donald Shell originally proposed repeatedly halving the gap (floor(n/2), floor(n/4), ..., 1).",
        },
        {
            id: "shell-q7",
            question: "What is the worst-case time complexity of Shell Sort using Hibbard's gap sequence (2^k - 1)?",
            options: ["O(n^(3/2))", "O(n²)", "O(n log n)", "O(n)"],
            correctOption: 0,
            explanation: "With Hibbard's increments (1, 3, 7, 15, ...), the worst-case time complexity is bounded by O(n^(3/2)).",
        },
    ],
    linear: [
        {
            id: "linear-q1",
            question: "What is the worst-case time complexity of Linear Search?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            correctOption: 2,
            explanation: "In the worst case (the target element is at the very end or not present), Linear Search inspects all n elements.",
        },
        {
            id: "linear-q2",
            question: "What is the best-case time complexity of Linear Search?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            correctOption: 0,
            explanation: "If the desired item is at the first index, Linear Search terminates in a single comparison, O(1).",
        },
        {
            id: "linear-q3",
            question: "Does Linear Search require the target array to be sorted?",
            options: [
                "No, it works equally well on unsorted or sorted data",
                "Yes, it requires ascending order",
                "Yes, it requires descending order",
                "Only if array length exceeds 100",
            ],
            correctOption: 0,
            explanation: "Linear Search checks elements sequentially, so the collection does not need to be sorted.",
        },
        {
            id: "linear-q4",
            question: "What is the average number of comparisons in a successful Linear Search on an array of size n?",
            options: ["(n + 1) / 2", "n / 4", "log₂ n", "n - 1"],
            correctOption: 0,
            explanation: "Assuming uniform distribution, the target is found at position (1 + 2 + ... + n) / n = (n + 1) / 2 comparisons on average.",
        },
        {
            id: "linear-q5",
            question: "What is the auxiliary space complexity of iterative Linear Search?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            correctOption: 0,
            explanation: "Linear Search only requires an index counter and target reference, using O(1) auxiliary space.",
        },
        {
            id: "linear-q6",
            question: "When is Linear Search practically preferred over Binary Search?",
            options: [
                "When the dataset is unsorted and only searched once or twice",
                "When searching a database with millions of sorted records",
                "When minimizing CPU comparisons is paramount",
                "When memory is completely full",
            ],
            correctOption: 0,
            explanation: "Sorting takes O(n log n); if you only search an unsorted list once, Linear Search O(n) is much faster overall.",
        },
        {
            id: "linear-q7",
            question: "What is Sentinel Linear Search?",
            options: [
                "Placing the target at the array boundary to avoid checking the loop index bounds each iteration",
                "Searching from both ends simultaneously",
                "Using multiple threads to scan segments",
                "Checking only prime indices",
            ],
            correctOption: 0,
            explanation: "By placing the target at the end as a sentinel, the loop only tests element equality instead of both i < n and equality.",
        },
    ],
    binary: [
        {
            id: "binary-q1",
            question: "What is the prerequisite for running Binary Search on an array?",
            options: [
                "The array must be sorted",
                "The array size must be a power of two",
                "The array cannot contain negative numbers",
                "The array must not contain duplicate values",
            ],
            correctOption: 0,
            explanation: "Binary Search relies on sorted order so it can eliminate half the search space with each comparison.",
        },
        {
            id: "binary-q2",
            question: "What is the time complexity of Binary Search on a sorted array of size n?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            correctOption: 1,
            explanation: "Binary Search halves the remaining search interval in each step, taking at most log₂(n) comparisons.",
        },
        {
            id: "binary-q3",
            question: "How should the middle index be computed in languages with potential integer overflow?",
            options: [
                "low + Math.floor((high - low) / 2)",
                "Math.floor((low + high) / 2)",
                "(low + high) * 2",
                "high - low",
            ],
            correctOption: 0,
            explanation: "Calculating low + (high - low) / 2 avoids the potential overflow of (low + high) exceeding maximum integer bounds.",
        },
        {
            id: "binary-q4",
            question: "What is the auxiliary space complexity of iterative Binary Search?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            correctOption: 0,
            explanation: "Iterative Binary Search only updates low, high, and mid pointers in-place, taking O(1) space.",
        },
        {
            id: "binary-q5",
            question: "If target is less than array[mid] in an ascending sorted array, what is the next step?",
            options: [
                "high = mid - 1",
                "low = mid + 1",
                "mid = mid / 2",
                "Return -1 immediately",
            ],
            correctOption: 0,
            explanation: "Since the array is sorted, all elements at and to the right of mid are too large, so search the left half.",
        },
        {
            id: "binary-q6",
            question: "What is the maximum number of comparisons needed to search an array of 1,000,000 sorted elements using Binary Search?",
            options: ["20", "500,000", "1,000", "100"],
            correctOption: 0,
            explanation: "log₂(1,000,000) ≈ 19.93, meaning at most 20 comparisons are required.",
        },
        {
            id: "binary-q7",
            question: "Which algorithmic strategy does Binary Search employ?",
            options: ["Decrease and Conquer", "Dynamic Programming", "Greedy method", "Brute Force"],
            correctOption: 0,
            explanation: "Binary Search reduces the problem size by a factor of 2 in each step, which is a classic decrease-and-conquer strategy.",
        },
    ],
    jump: [
        {
            id: "jump-q1",
            question: "What is the optimal block jump size (m) for Jump Search on an array of size n?",
            options: ["m = √n", "m = n / 2", "m = log n", "m = 2"],
            correctOption: 0,
            explanation: "Balancing the number of jumps (n/m) and linear comparisons (m) yields m = √n for optimal performance.",
        },
        {
            id: "jump-q2",
            question: "What is the time complexity of Jump Search when using the optimal block size √n?",
            options: ["O(√n)", "O(n)", "O(log n)", "O(1)"],
            correctOption: 0,
            explanation: "The total number of comparisons in the worst case is (n/m) + (m - 1) = √n + √n - 1 = O(√n).",
        },
        {
            id: "jump-q3",
            question: "What is the requirement for Jump Search to work correctly?",
            options: [
                "The array must be sorted in ascending or descending order",
                "The array size must be an exact square number",
                "The array cannot contain zero",
                "The array must be a doubly-linked list",
            ],
            correctOption: 0,
            explanation: "Like Binary Search, Jump Search relies on sorted order to skip ahead across blocks of elements.",
        },
        {
            id: "jump-q4",
            question: "What secondary search is performed once Jump Search identifies the block containing the target?",
            options: [
                "A linear search backward (or forward) from the boundary",
                "Binary search on the entire array",
                "A recursive jump search",
                "Interpolation search",
            ],
            correctOption: 0,
            explanation: "Once array[step] >= target, Jump Search performs a linear search from the previous jump boundary to locate the element.",
        },
        {
            id: "jump-q5",
            question: "How does Jump Search compare in speed to Linear Search and Binary Search?",
            options: [
                "Faster than Linear Search O(n), but slower than Binary Search O(log n)",
                "Faster than Binary Search, but slower than Linear Search",
                "Equivalent to Binary Search in all cases",
                "Slower than Linear Search",
            ],
            correctOption: 0,
            explanation: "O(log n) < O(√n) < O(n). Jump Search is asymptotically between Linear Search and Binary Search.",
        },
        {
            id: "jump-q6",
            question: "What is the auxiliary space complexity of Jump Search?",
            options: ["O(1)", "O(√n)", "O(n)", "O(log n)"],
            correctOption: 0,
            explanation: "Jump Search operates in-place using only a few index variables, requiring O(1) extra space.",
        },
        {
            id: "jump-q7",
            question: "In what systems might Jump Search be preferred over Binary Search?",
            options: [
                "Systems where jumping backward is expensive or random seeking has high latency",
                "Systems with unlimited memory and zero cache misses",
                "When the dataset is strictly unsorted",
                "Systems running in parallel on GPU cores",
            ],
            correctOption: 0,
            explanation: "Binary search jumps back and forth repeatedly; Jump Search only jumps forward and traverses backward linearly once.",
        },
    ],
};

// Generic fallback questions for categories
const GENERIC_QUESTIONS = [
    {
        id: "gen-q1",
        question: "Why is algorithm analysis typically focused on worst-case and average-case time complexities?",
        options: [
            "To provide upper-bound performance guarantees and estimate typical behavior under scale",
            "Because best-case is the only metric that matters in production",
            "To eliminate the need for memory management",
            "Because hardware speed cannot be measured",
        ],
        correctOption: 0,
        explanation: "Worst-case analysis guarantees that an algorithm will never exceed a certain threshold, ensuring safety and reliability in critical systems.",
    },
    {
        id: "gen-q2",
        question: "What does in-place sorting mean?",
        options: [
            "The algorithm sorts elements without requiring more than O(1) or O(log n) additional memory",
            "The algorithm replaces all elements with zeros",
            "The algorithm runs exclusively on one CPU core",
            "The algorithm does not modify the original array",
        ],
        correctOption: 0,
        explanation: "An in-place sorting algorithm uses a small, fixed amount of extra storage space beyond the input array itself.",
    },
    {
        id: "gen-q3",
        question: "What does algorithm stability refer to in sorting?",
        options: [
            "Preserving the original relative order of elements that have equal keys",
            "Preventing the application from crashing on invalid inputs",
            "Ensuring the sort always finishes in under one millisecond",
            "Restricting sorting exclusively to positive integers",
        ],
        correctOption: 0,
        explanation: "A stable sort ensures that when two elements have identical sorting keys, their initial relative sequence is preserved.",
    },
    {
        id: "gen-q4",
        question: "What is Big-O notation used to describe?",
        options: [
            "The upper bound of growth rate of an algorithm's resource consumption as input size increases",
            "The exact execution duration in nanoseconds on specific CPU hardware",
            "The disk space of the compiled binary executable",
            "The number of lines of source code written",
        ],
        correctOption: 0,
        explanation: "Big-O characterizes the asymptotic behavior and upper bound of time or memory as input n scales.",
    },
    {
        id: "gen-q5",
        question: "What is an auxiliary space complexity in contrast to total space complexity?",
        options: [
            "Extra space or temporary memory used by the algorithm excluding the input data",
            "The total RAM installed in the machine running the code",
            "The memory required to store the function names in the stack trace",
            "The permanent disk space used to store log files",
        ],
        correctOption: 0,
        explanation: "Auxiliary space measures only the temporary working space allocated by the algorithm during its execution.",
    },
    {
        id: "gen-q6",
        question: "Why does comparison-based sorting have a lower bound of Ω(n log n)?",
        options: [
            "There are n! possible permutations, requiring at least log₂(n!) ≈ n log n decision tree comparisons",
            "Because hardware CPUs cannot compare more than two numbers at once",
            "Because recursion requires at least log n memory calls",
            "Because arrays must be traversed at least twice",
        ],
        correctOption: 0,
        explanation: "A decision tree sorting n elements has n! leaves, requiring a depth of at least log₂(n!) = Ω(n log n).",
    },
];

function getQuizForAlgorithm(algorithmId) {
    const norm = normalizeAlgorithmId(algorithmId);
    return QUIZ_BANK[norm] || GENERIC_QUESTIONS;
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * Select a fresh, randomized subset of questions for a new quiz attempt.
 * Avoids repeating questions from the previous attempt (excludeIds) whenever possible.
 * Also randomizes answer options order and tracks the new correctOption index.
 */
function getRandomQuizQuestions(algorithmId, { excludeIds = [], count = 3, shuffleOptions = true } = {}) {
    const fullBank = getQuizForAlgorithm(algorithmId);
    if (!fullBank || fullBank.length === 0) return [];

    const excludeSet = new Set(excludeIds || []);
    const unserved = fullBank.filter((q) => !excludeSet.has(q.id));
    const served = fullBank.filter((q) => excludeSet.has(q.id));

    const shuffledUnserved = shuffleArray(unserved);
    const shuffledServed = shuffleArray(served);

    const selected = [];
    for (const q of shuffledUnserved) {
        if (selected.length < count) selected.push(q);
    }
    for (const q of shuffledServed) {
        if (selected.length < count) selected.push(q);
    }

    // Shuffle the question order for this attempt
    const orderedQuestions = shuffleArray(selected);

    // Optionally shuffle options and track new correctOption index
    return orderedQuestions.map((q) => {
        if (!shuffleOptions) {
            return { ...q };
        }

        const optWithIndex = q.options.map((opt, idx) => ({ opt, originalIndex: idx }));
        const shuffledOpts = shuffleArray(optWithIndex);
        const newCorrectOption = shuffledOpts.findIndex((item) => item.originalIndex === q.correctOption);

        return {
            id: q.id,
            question: q.question,
            options: shuffledOpts.map((item) => item.opt),
            correctOption: newCorrectOption,
            explanation: q.explanation,
        };
    });
}

// Client-safe questions (strips correctOption and explanation)
function getClientQuestions(algorithmId) {
    const questions = getQuizForAlgorithm(algorithmId);
    return questions.map(({ id, question, options }) => ({
        id,
        question,
        options,
    }));
}

module.exports = {
    QUIZ_BANK,
    GENERIC_QUESTIONS,
    getQuizForAlgorithm,
    getRandomQuizQuestions,
    getClientQuestions,
};
