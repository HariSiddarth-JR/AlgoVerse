import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { algorithmsRegistry } from '../../algorithms';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract algoId from url if on explorer page
  const pathParts = location.pathname.split('/');
  const isExplore = pathParts[1] === 'explore';
  const currentCategory = isExplore ? pathParts[2] : '';
  const currentAlgoId = isExplore ? pathParts[3] : '';

  const getBreadcrumbs = () => {
    if (!isExplore) return null;

    const categoryTitle = currentCategory 
      ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) 
      : '';
      
    const algo = algorithmsRegistry[currentAlgoId];

    return (
      <div className="breadcrumbs">
        <Link to={`/explore/${currentCategory}`} className="breadcrumb-link">
          {categoryTitle} Algorithms
        </Link>
        {algo && (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{algo.title}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <nav className="glass-navbar">
      <Link to="/" className="nav-brand">
        <span className="logo-icon">▲</span>
        AlgoVerse <span className="version-badge">V2</span>
      </Link>
      
      <div className="nav-controls">
        {getBreadcrumbs()}
        {!isExplore && (
          <Link to="/" className="nav-link">
            Home
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
