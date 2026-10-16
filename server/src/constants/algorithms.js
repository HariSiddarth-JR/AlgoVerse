const VALID_ALGORITHM_IDS = [
    "bubble",
    "heap",
    "insertion",
    "merge",
    "quick",
    "selection",
    "shell",
    "binary",
    "jump",
    "linear",
];

const ALGORITHM_ALIASES = {
    linear: "linear",
    linearsearch: "linear",
    binary: "binary",
    binarysearch: "binary",
    jump: "jump",
    jumpsearch: "jump",
    bubble: "bubble",
    bubblesort: "bubble",
    selection: "selection",
    selectionsort: "selection",
    insertion: "insertion",
    insertionsort: "insertion",
    merge: "merge",
    mergesort: "merge",
    quick: "quick",
    quicksort: "quick",
    heap: "heap",
    heapsort: "heap",
    shell: "shell",
    shellsort: "shell",
};

const ALGORITHM_CATEGORIES = {
    bubble: "sorting",
    heap: "sorting",
    insertion: "sorting",
    merge: "sorting",
    quick: "sorting",
    selection: "sorting",
    shell: "sorting",
    binary: "searching",
    jump: "searching",
    linear: "searching",
};

const ALGORITHM_TITLES = {
    bubble: "Bubble Sort",
    heap: "Heap Sort",
    insertion: "Insertion Sort",
    merge: "Merge Sort",
    quick: "Quick Sort",
    selection: "Selection Sort",
    shell: "Shell Sort",
    binary: "Binary Search",
    jump: "Jump Search",
    linear: "Linear Search",
};

function normalizeAlgorithmId(id) {
    if (!id || typeof id !== "string") return id;
    const clean = id.toLowerCase().replace(/[-_\s]/g, "");
    return ALGORITHM_ALIASES[clean] || id.toLowerCase().trim();
}

function isValidAlgorithmId(id) {
    if (!id || typeof id !== "string") return false;
    const normalized = normalizeAlgorithmId(id);
    return VALID_ALGORITHM_IDS.includes(normalized);
}

function getAlgorithmCategory(id) {
    const normalized = normalizeAlgorithmId(id);
    return ALGORITHM_CATEGORIES[normalized] || "general";
}

function getAlgorithmTitle(id) {
    const normalized = normalizeAlgorithmId(id);
    return ALGORITHM_TITLES[normalized] || id;
}

module.exports = {
    VALID_ALGORITHM_IDS,
    ALGORITHM_ALIASES,
    ALGORITHM_CATEGORIES,
    ALGORITHM_TITLES,
    normalizeAlgorithmId,
    isValidAlgorithmId,
    getAlgorithmCategory,
    getAlgorithmTitle,
};
