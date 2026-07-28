import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCode, FaChartLine, FaBrain, FaArrowRight } from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-content"
        >
          <div className="badge">AlgoVerse V2</div>
          <h1 className="hero-title">
            Understand Algorithms <br/>
            <span className="text-gradient">Like Never Before</span>
          </h1>
          <p className="hero-subtitle">
            An interactive, beautifully crafted educational platform to visualize, control, and master Data Structures and Algorithms.
          </p>
          <div className="hero-cta" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore/sorting" className="btn-primary-large">
              Sorting Algorithms <FaArrowRight />
            </Link>
            <Link to="/explore/searching" className="btn-primary-large">
              Searching Algorithms <FaArrowRight />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card feature-card"
          >
            <div className="feature-icon"><FaCode /></div>
            <h3>Premium Visualization</h3>
            <p>Physics-based, fluid animations powered by Framer Motion. Every swap, comparison, and traversal feels incredible.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card feature-card"
          >
            <div className="feature-icon"><FaBrain /></div>
            <h3>Deep Understanding</h3>
            <p>Detailed time and space complexity analysis, real-time code highlighting, and step-by-step playback controls.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card feature-card"
          >
            <div className="feature-icon"><FaChartLine /></div>
            <h3>Plugin Architecture</h3>
            <p>A highly scalable registry system. Drop in a new algorithm plugin and watch the engines render it perfectly.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
