import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlay,
  FaPause,
  FaArrowRight,
  FaChartBar,
  FaGraduationCap,
  FaChartLine,
  FaBookmark
} from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  // Mini interactive preview visualizer state in Hero
  const [bars, setBars] = useState([35, 60, 25, 80, 45, 95, 70, 40, 85, 55]);
  const [activeIndices, setActiveIndices] = useState([2, 3]);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Sorting');

  // Mini animation effect for hero preview
  useEffect(() => {
    if (!isPreviewPlaying) return;
    const interval = setInterval(() => {
      setBars((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * (next.length - 1));
        const j = i + 1;
        setActiveIndices([i, j]);
        if (next[i] > next[j]) {
          const temp = next[i];
          next[i] = next[j];
          next[j] = temp;
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPreviewPlaying]);

  const popularAlgorithms = [
    {
      id: 'bubble',
      title: 'Bubble Sort',
      category: 'sorting',
      level: 'Beginner',
      complexity: 'O(n²)',
      bars: [30, 60, 45, 80, 20]
    },
    {
      id: 'selection',
      title: 'Selection Sort',
      category: 'sorting',
      level: 'Beginner',
      complexity: 'O(n²)',
      bars: [25, 45, 70, 35, 90]
    },
    {
      id: 'insertion',
      title: 'Insertion Sort',
      category: 'sorting',
      level: 'Beginner',
      complexity: 'O(n²)',
      bars: [40, 20, 65, 85, 50]
    },
    {
      id: 'merge',
      title: 'Merge Sort',
      category: 'sorting',
      level: 'Intermediate',
      complexity: 'O(n log n)',
      bars: [60, 30, 85, 40, 75]
    },
    {
      id: 'quick',
      title: 'Quick Sort',
      category: 'sorting',
      level: 'Intermediate',
      complexity: 'O(n log n)',
      bars: [50, 75, 30, 95, 60]
    },
    {
      id: 'heap',
      title: 'Heap Sort',
      category: 'sorting',
      level: 'Intermediate',
      complexity: 'O(n log n)',
      bars: [35, 55, 80, 45, 70]
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Column: Heading & CTAs */}
          <motion.div
            className="hero-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-pill-badge">
              <span className="pill-dot"></span>
              Learn • Visualize • Practice
            </div>

            <h1 className="hero-heading">
              Master Algorithms Through Interactive Visualizations
            </h1>

            <p className="hero-description">
              Explore sorting, searching, and data structure algorithms with step-by-step
              visualizations, quizzes, and track your progress.
            </p>

            <div className="hero-action-buttons">
              <Link to="/explore/sorting" className="btn-hero-primary">
                Explore Algorithms <FaArrowRight />
              </Link>
              <Link to="/dashboard" className="btn-hero-secondary">
                View Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Sleek Interactive Visualizer Preview */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="hero-preview-window">
              {/* Window Header */}
              <div className="preview-window-topbar">
                <div className="preview-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="preview-code-snippet">
                  <code>for (let i = 0; i &lt; n; i++) &#123; // compare &amp; swap &#125;</code>
                </div>
              </div>

              {/* Window Body: Visualizer Preview */}
              <div className="preview-canvas-area">
                <div className="preview-bars-wrapper">
                  {bars.map((val, idx) => {
                    const isActive = activeIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`preview-bar ${isActive ? 'active' : ''}`}
                        style={{ height: `${val}%` }}
                      >
                        <span className="preview-bar-num">{val}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Scrubber / Mini Player Row */}
                <div className="preview-controls-row">
                  <button
                    type="button"
                    className="preview-play-btn"
                    onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                    aria-label={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
                  >
                    {isPreviewPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <div className="preview-scrubber">
                    <div className="preview-scrubber-fill" style={{ width: '45%' }}></div>
                    <div className="preview-scrubber-thumb" style={{ left: '45%' }}></div>
                  </div>
                </div>
              </div>

              {/* Category selector pills in preview */}
              <div className="preview-categories-row">
                {['Sorting', 'Searching', 'Data Structures', 'Graph Algorithms', 'Dynamic Programming'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`preview-category-tag ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategory(cat);
                        if (cat === 'Sorting') navigate('/explore/sorting');
                        else if (cat === 'Searching') navigate('/explore/searching');
                        else if (cat === 'Data Structures') navigate('/explore/datastructures');
                        else if (cat === 'Graph Algorithms') navigate('/explore/graph');
                        else if (cat === 'Dynamic Programming') navigate('/explore/dp');
                      }}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 Feature Highlights Row */}
      <section className="features-highlight-section">
        <div className="features-highlight-container">
          <div className="feature-highlight-card">
            <div className="feature-icon-box blue">
              <FaChartBar />
            </div>
            <div className="feature-text-box">
              <h3>Interactive Visualizations</h3>
              <p>See algorithms in action</p>
            </div>
          </div>

          <div className="feature-highlight-card">
            <div className="feature-icon-box purple">
              <FaGraduationCap />
            </div>
            <div className="feature-text-box">
              <h3>Quizzes &amp; Practice</h3>
              <p>Test your understanding</p>
            </div>
          </div>

          <div className="feature-highlight-card">
            <div className="feature-icon-box green">
              <FaChartLine />
            </div>
            <div className="feature-text-box">
              <h3>Track Progress</h3>
              <p>Keep learning consistently</p>
            </div>
          </div>

          <div className="feature-highlight-card">
            <div className="feature-icon-box amber">
              <FaBookmark />
            </div>
            <div className="feature-text-box">
              <h3>Save Bookmarks</h3>
              <p>Access your favorite algorithms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Algorithms Grid */}
      <section className="popular-algorithms-section">
        <div className="popular-container">
          <div className="popular-header">
            <div>
              <h2 className="popular-title">Popular Algorithms</h2>
              <p className="popular-subtitle">
                Explore foundational algorithms with detailed step controls and metrics.
              </p>
            </div>
            <Link to="/explore/sorting" className="link-view-all">
              View All <FaArrowRight />
            </Link>
          </div>

          <div className="popular-grid">
            {popularAlgorithms.map((algo) => (
              <Link
                key={algo.id}
                to={`/explore/${algo.category}/${algo.id}`}
                className="algo-showcase-card"
              >
                <div className="card-top-row">
                  <div className="card-mini-graphic">
                    {algo.bars.map((h, i) => (
                      <span key={i} className="mini-bar" style={{ height: `${h}%` }}></span>
                    ))}
                  </div>
                  <FaArrowRight className="card-arrow-icon" />
                </div>

                <div className="card-info">
                  <h3 className="card-algo-name">{algo.title}</h3>
                  <div className="card-badges-row">
                    <span className="badge-tag badge-green">{algo.level}</span>
                    <span className="badge-tag badge-blue">{algo.complexity}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
