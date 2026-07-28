<div align="center">
  <br />
  <br />
  <img src="public/vite.svg" alt="AlgoVerse" width="100" height="100" />
  <h1>AlgoVerse V2</h1>
  <p>
    <b>Understand Algorithms Like Never Before</b>
  </p>
  <p>
    An interactive, beautifully crafted educational platform to visualize, control, and master Data Structures and Algorithms.
  </p>
  <br />
</div>

## 🚀 Features

- **Premium Visualization**: Physics-based, fluid animations powered by Framer Motion. Every swap, comparison, and traversal feels incredible.
- **Deep Understanding**: Detailed time and space complexity analysis, real-time code highlighting, and step-by-step playback controls.
- **Plugin Architecture**: A highly scalable registry system. Drop in a new algorithm plugin and watch the engines render it perfectly.
- **Modern Tech Stack**: Built with React, Vite, Framer Motion, and pure custom CSS utilizing gorgeous glassmorphism aesthetics.
- **Responsive Dashboard**: Features beautiful algorithm category dashboards (Sorting & Searching) with quick-glance performance metrics.

## 🧠 Supported Algorithms

### Sorting
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Shell Sort

### Searching
- Linear Search
- Binary Search
- Jump Search

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HariSiddarth-JR/AlgoVerse.git
   cd AlgoVerse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🏗️ Architecture

AlgoVerse uses a dynamic plugin system to easily scale the number of algorithms. Each algorithm contains:
- `index.js`: Exposes the plugin API (id, title, category, code, info, and logic).
- `steps.js`: Generates the step-by-step visual frames for the engine to render.
- `info.js`: Contains text explanations, big-O metrics, and characteristics.
- `code.js`: Contains raw code snippets to be displayed.

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check the issues page if you want to contribute.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  Built with ❤️ by HariSiddarth-JR
</div>
