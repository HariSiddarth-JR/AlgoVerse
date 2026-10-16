import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaSearch, FaTimes, FaBars } from 'react-icons/fa';
import logo from '../../assets/Algoverse LOGO.png';
import { algorithmsRegistry } from '../../algorithms';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="nav-breadcrumbs">
        <Link to={`/explore/${currentCategory}`} className="breadcrumb-link">
          {categoryTitle}
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const matchedAlgo = Object.values(algorithmsRegistry).find(
      (algo) =>
        algo.title.toLowerCase().includes(query) ||
        algo.id.toLowerCase().includes(query) ||
        algo.category.toLowerCase().includes(query)
    );

    if (matchedAlgo) {
      navigate(`/explore/${matchedAlgo.category.toLowerCase()}/${matchedAlgo.id}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    } else {
      navigate(`/explore/sorting`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <img src={logo} alt="AlgoVerse" className="nav-logo-icon" />
            <span className="nav-brand-text">AlgoVerse</span>
          </Link>

          {/* Main Desktop Navigation Links */}
          <nav className="nav-links-desktop">
            <Link
              to="/"
              className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/explore/sorting"
              className={`nav-link-item ${location.pathname.startsWith('/explore') ? 'active' : ''}`}
            >
              Algorithms
            </Link>
            <Link
              to="/dashboard#quizzes"
              className={`nav-link-item ${location.pathname === '/dashboard' && location.hash === '#quizzes' ? 'active' : ''}`}
            >
              Quiz
            </Link>
            <Link
              to="/dashboard"
              className={`nav-link-item ${location.pathname === '/dashboard' && location.hash !== '#quizzes' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Center / Breadcrumb if exploring */}
        {isExplore && (
          <div className="nav-center-breadcrumbs">
            {getBreadcrumbs()}
          </div>
        )}

        {/* Right Controls */}
        <div className="nav-right">
          {/* Quick Search Bar */}
          <form className="nav-search-form" onSubmit={handleSearchSubmit}>
            <FaSearch className="nav-search-icon" />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search algorithms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <FaSun className="theme-icon sun" /> : <FaMoon className="theme-icon moon" />}
          </button>

          {/* User Auth Controls */}
          <div className="nav-auth-section">
            {isAuthenticated ? (
              <div className="nav-user-dropdown-wrapper">
                <Link to="/dashboard" className="nav-user-pill" title={user?.email}>
                  <div className="nav-user-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="nav-user-name">
                    {user?.name ? user.name.split(' ')[0] : 'Profile'}
                  </span>
                </Link>
                <button
                  type="button"
                  className="btn-nav-logout"
                  onClick={logout}
                  title="Sign out of AlgoVerse"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary nav-signin-btn"
                onClick={() => openAuthModal('login')}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <FaSearch className="nav-search-icon" />
            <input
              type="text"
              className="nav-search-input mobile"
              placeholder="Search algorithms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="mobile-nav-links">
            <Link
              to="/"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/explore/sorting"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sorting Algorithms
            </Link>
            <Link
              to="/explore/searching"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Searching Algorithms
            </Link>
            <Link
              to="/dashboard#quizzes"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Quiz &amp; Practice
            </Link>
            <Link
              to="/dashboard"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
