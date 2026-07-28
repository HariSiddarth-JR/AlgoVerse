import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { algorithmsRegistry } from '../../algorithms';
import { FaClock, FaDatabase, FaPlay } from 'react-icons/fa';
import './Category.css';

const Category = () => {
  const { category } = useParams();

  // Validate category
  const validCategories = ['sorting', 'searching'];
  if (!validCategories.includes(category?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  // Filter algorithms by category
  const algorithms = useMemo(() => {
    return Object.values(algorithmsRegistry).filter(
      (algo) => algo.category.toLowerCase() === category.toLowerCase()
    );
  }, [category]);

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Algorithms';

  return (
    <div className="category-container">
      <motion.div 
        className="category-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{categoryTitle}</h1>
        <p>Select an algorithm below to launch the interactive visualizer and explore its mechanics.</p>
      </motion.div>

      <div className="category-grid">
        {algorithms.map((algo, index) => (
          <motion.div 
            key={algo.id}
            className="glass-card algo-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
          >
            <div className="algo-card-content">
              <h2>{algo.title}</h2>
              <p className="algo-description">
                {algo.info.description.length > 120 
                  ? algo.info.description.substring(0, 120) + '...' 
                  : algo.info.description}
              </p>
              
              <div className="algo-metrics">
                <div className="metric-badge">
                  <FaClock /> <span>{algo.info.averageCase}</span>
                </div>
                <div className="metric-badge">
                  <FaDatabase /> <span>{algo.info.spaceComplexity}</span>
                </div>
              </div>
            </div>

            <Link to={`/explore/${category.toLowerCase()}/${algo.id}`} className="btn-primary-full">
              Visualize <FaPlay style={{ fontSize: '0.8em', marginLeft: '0.5rem' }} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Category;
