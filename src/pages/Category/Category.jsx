import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { algorithmsRegistry } from '../../algorithms';
import './Category.css';

const Category = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(category ? category.toLowerCase() : 'all');

  useEffect(() => {
    setActiveTab(category ? category.toLowerCase() : 'all');
  }, [category]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'searching', label: 'Searching' },
    { id: 'datastructures', label: 'Data Structures' },
    { id: 'graph', label: 'Graph Algorithms' },
    { id: 'dp', label: 'Dynamic Programming' }
  ];

  const allAlgorithms = useMemo(() => {
    const seen = new Set();
    return Object.values(algorithmsRegistry).filter((algo) => {
      if (seen.has(algo.title)) return false;
      seen.add(algo.title);
      return true;
    });
  }, []);

  const filteredAlgorithms = useMemo(() => {
    if (activeTab === 'all') return allAlgorithms;
    return allAlgorithms.filter(
      (algo) => algo.category.toLowerCase() === activeTab
    );
  }, [activeTab, allAlgorithms]);

  const handleTabChange = (catId) => {
    setActiveTab(catId);
    if (catId === 'all') {
      navigate('/explore/sorting');
    } else {
      navigate(`/explore/${catId}`);
    }
  };

  return (
    <div className="catalogue-page">
      <div className="catalogue-container">
        {/* Header */}
        <div className="catalogue-header">
          <h1 className="catalogue-title">All Algorithms</h1>
          <p className="catalogue-subtitle">
            Explore sorting, searching, and data structure algorithms with interactive visualizations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="catalogue-tabs-bar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`catalogue-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => handleTabChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Algorithms Cards Grid */}
        <div className="catalogue-grid">
          {filteredAlgorithms.length === 0 ? (
            <div className="empty-catalogue-box">
              <p>No algorithms found in this category yet. Check out our sorting and searching visualizers!</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleTabChange('sorting')}
              >
                Browse Sorting Algorithms
              </button>
            </div>
          ) : (
            filteredAlgorithms.map((algo) => (
              <motion.div
                key={algo.id}
                className="catalogue-card"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  to={`/explore/${algo.category.toLowerCase()}/${algo.id}`}
                  className="catalogue-card-inner"
                >
                  <div className="catalogue-card-left">
                    {/* Mini bar chart illustration */}
                    <div className="card-bars-icon">
                      <span className="cbar h40"></span>
                      <span className="cbar h70"></span>
                      <span className="cbar h55"></span>
                      <span className="cbar h90"></span>
                    </div>

                    <div className="catalogue-card-details">
                      <h3 className="catalogue-algo-title">{algo.title}</h3>
                      <div className="catalogue-badges-row">
                        <span className="badge-tag badge-green">Beginner</span>
                        <span className="badge-tag badge-blue">{algo.info.averageCase}</span>
                      </div>
                    </div>
                  </div>

                  <div className="catalogue-card-arrow">
                    <FaArrowRight />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
