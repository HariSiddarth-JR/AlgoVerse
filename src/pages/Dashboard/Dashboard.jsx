import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaBookmark,
  FaCheckCircle,
  FaClock,
  FaTrash,
  FaPlay,
  FaLock,
  FaThLarge,
  FaCode,
  FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingData, setLoadingData] = useState(true);
  const [progressData, setProgressData] = useState({ stats: {}, progress: [] });
  const [bookmarks, setBookmarks] = useState([]);
  const [quizSummary, setQuizSummary] = useState({ summary: {} });
  const [quizHistory, setQuizHistory] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Handle URL hash changes (direct URL access and browser back/forward)
  useEffect(() => {
    const hash = location.hash;
    let targetTab = 'overview';
    let targetElementId = 'overview-section';

    if (hash === '#bookmarks') {
      targetTab = 'bookmarks';
      targetElementId = 'bookmarks-section';
    } else if (hash === '#quizzes' || hash === '#quiz') {
      targetTab = 'quizzes';
      targetElementId = 'quizzes-section';
    } else if (hash === '#overview' || !hash) {
      targetTab = 'overview';
      targetElementId = 'overview-section';
    }

    setActiveTab(targetTab);

    if (hash) {
      // Small timeout to ensure DOM has rendered
      const timer = setTimeout(() => {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    setLoadingData(true);
    setError(null);

    Promise.all([
      api.progress.getAll().catch(() => ({ stats: {}, progress: [] })),
      api.bookmarks.getAll().catch(() => ({ bookmarks: [] })),
      api.quizzes.getSummary().catch(() => ({ summary: {} })),
      api.quizzes.getHistory().catch(() => ({ history: [] })),
      api.system.getDBStatus().catch(() => null)
    ])
      .then(([prog, bmark, qSummary, qHistory, db]) => {
        if (!isMounted) return;
        setProgressData(prog);
        setBookmarks(bmark.bookmarks || []);
        setQuizSummary(qSummary);
        setQuizHistory(qHistory.history || []);
        if (db && db.database) setDbStatus(db.database);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load dashboard data.');
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleDeleteBookmark = async (algorithmId) => {
    try {
      await api.bookmarks.delete(algorithmId);
      setBookmarks((prev) => prev.filter((b) => b.algorithmId !== algorithmId));
    } catch (err) {
      alert(`Could not remove bookmark: ${err.message}`);
    }
  };

  // Recent Activity synthesized from bookmarks, progress, and quizzes
  const recentActivities = useMemo(() => {
    const list = [];
    bookmarks.forEach((b) => {
      list.push({
        id: `bm-${b._id || b.algorithmId}`,
        type: 'bookmark',
        text: `Saved a bookmark for ${b.title || b.algorithmId}`,
        date: b.createdAt ? new Date(b.createdAt) : new Date(),
        icon: <FaBookmark className="activity-icon-amber" />
      });
    });
    quizHistory.forEach((q) => {
      list.push({
        id: `qz-${q._id}`,
        type: 'quiz',
        text: `Completed a quiz on ${q.algorithmId} (${q.score}/${q.totalQuestions})`,
        date: q.createdAt ? new Date(q.createdAt) : new Date(),
        icon: <FaGraduationCap className="activity-icon-blue" />
      });
    });
    (progressData.progress || []).forEach((p) => {
      list.push({
        id: `pr-${p._id || p.algorithmId}`,
        type: 'progress',
        text: `Explored ${p.algorithmId}`,
        date: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        icon: <FaCheckCircle className="activity-icon-green" />
      });
    });

    list.sort((a, b) => b.date - a.date);
    return list.slice(0, 5);
  }, [bookmarks, quizHistory, progressData.progress]);

  // Logged-out state
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="dashboard-page">
        <motion.div
          className="card-clean logged-out-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="locked-icon-wrapper">
            <FaLock />
          </div>
          <h2 className="locked-title">Personal Learning Dashboard</h2>
          <p className="locked-desc">
            Sign in to AlgoVerse to save bookmarks, persist algorithm completion status, track study time, and record quiz results.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openAuthModal('login', 'Sign in to access your dashboard')}
          >
            Sign In / Register
          </button>
        </motion.div>
      </div>
    );
  }

  const stats = progressData.stats || {};
  const summary = quizSummary.summary || {};
  const totalAlgos = progressData.totalAlgorithms || 10;
  const completedAlgos = stats.completed || 0;
  const progressPercent = Math.min(100, Math.round((completedAlgos / totalAlgos) * 100));

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout">
        {/* Left Navigation Sidebar */}
        <aside className="dashboard-nav-sidebar">
          <nav className="dash-nav-menu">
            <button
              type="button"
              className={`dash-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                navigate('/dashboard#overview');
                const el = document.getElementById('overview-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <FaThLarge /> Dashboard
            </button>
            <button
              type="button"
              className="dash-nav-btn"
              onClick={() => navigate('/explore/sorting')}
            >
              <FaCode /> Algorithms
            </button>
            <button
              type="button"
              className={`dash-nav-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => {
                navigate('/dashboard#quizzes');
                const el = document.getElementById('quizzes-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <FaGraduationCap /> Quiz
            </button>
            <button
              type="button"
              className={`dash-nav-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => {
                navigate('/dashboard#bookmarks');
                const el = document.getElementById('bookmarks-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <FaBookmark /> Bookmarks
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-area">
          <div id="overview-section">
          {/* Header with User Info and DB Pill */}
          <div className="dashboard-hero-header">
            <div className="user-profile-summary">
              <div className="user-avatar-circle">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  (user?.name ? user.name.charAt(0).toUpperCase() : 'U')
                )}
              </div>
              <div className="user-details-col">
                <h1 className="user-greeting-title">
                  Welcome back, {user?.name || 'Explorer'}!
                </h1>
                <p className="user-meta-subtext">
                  {user?.email} • Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '10/15/2026'}
                </p>
              </div>
            </div>

            {/* DB Status Badge */}
            {dbStatus && (
              <div className="db-cloud-badge" title={`Connected to ${dbStatus.host || 'database'}`}>
                <span
                  className={`db-indicator-dot ${
                    dbStatus.provider === 'atlas'
                      ? 'atlas'
                      : dbStatus.provider === 'local-fallback'
                      ? 'fallback'
                      : 'disconnected'
                  }`}
                />
                <span>
                  DB: {dbStatus.provider === 'atlas' ? 'MongoDB Atlas (Cloud)' : 'Local Fallback (In-Memory)'}
                </span>
              </div>
            )}
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          {/* 4 Stat Cards */}
          <div className="dash-metrics-grid">
            <div className="dash-stat-card">
              <div className="stat-circle-icon green">
                <FaCheckCircle />
              </div>
              <div className="stat-numbers">
                <span className="stat-digit-value">{completedAlgos} / {totalAlgos}</span>
                <span className="stat-digit-label">Mastered Algorithms</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="stat-circle-icon blue">
                <FaClock />
              </div>
              <div className="stat-numbers">
                <span className="stat-digit-value">
                  {Math.round((stats.totalTimeSpentSeconds || 0) / 60)} min
                </span>
                <span className="stat-digit-label">Time Spent Learning</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="stat-circle-icon purple">
                <FaGraduationCap />
              </div>
              <div className="stat-numbers">
                <span className="stat-digit-value">{summary.passRatePercentage || 0}%</span>
                <span className="stat-digit-label">Quiz Pass Rate</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="stat-circle-icon amber">
                <FaBookmark />
              </div>
              <div className="stat-numbers">
                <span className="stat-digit-value">{bookmarks.length}</span>
                <span className="stat-digit-label">Saved Bookmarks</span>
              </div>
            </div>
          </div>

          {/* Two-Column Overview: Learning Progress & Recent Activity */}
          <div className="dash-overview-split">
            {/* Learning Progress Card */}
            <div className="card-clean learning-progress-card">
              <h3 className="overview-card-title">Learning Progress</h3>
              <div className="progress-ring-container">
                <div className="circular-meter">
                  <svg className="meter-svg" viewBox="0 0 100 100">
                    <circle
                      className="meter-bg"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className="meter-fill"
                      cx="50"
                      cy="50"
                      r="40"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                    />
                  </svg>
                  <div className="meter-text">
                    <span className="meter-percent">{progressPercent}%</span>
                  </div>
                </div>

                <div className="progress-bar-details">
                  <p className="mastered-count-text">
                    {completedAlgos} of {totalAlgos} algorithms mastered
                  </p>
                  <div className="linear-progress-track">
                    <div
                      className="linear-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="card-clean recent-activity-card">
              <h3 className="overview-card-title">Recent Activity</h3>
              {recentActivities.length === 0 ? (
                <p className="no-activity-text">
                  No activity recorded yet. Run a visualizer or take a quiz to get started!
                </p>
              ) : (
                <div className="activity-items-list">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="activity-row-item">
                      <div className="activity-icon-container">
                        {act.icon}
                      </div>
                      <div className="activity-info">
                        <span className="activity-desc">{act.text}</span>
                        <span className="activity-time">
                          {act.date.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Section: Bookmarked Algorithms */}
          <section id="bookmarks-section" className="dash-section-panel">
            <div className="section-header-row">
              <h2 className="dash-section-title">
                <FaBookmark className="title-icon-amber" /> Saved Bookmarks
              </h2>
            </div>

            {loadingData ? (
              <div className="loading-state-text">Loading bookmarks...</div>
            ) : bookmarks.length === 0 ? (
              <div className="empty-dash-card">
                <p>You haven't bookmarked any algorithms yet.</p>
                <Link to="/explore/sorting" className="btn-primary">
                  Explore Algorithms <FaPlay style={{ fontSize: '0.75rem' }} />
                </Link>
              </div>
            ) : (
              <div className="dash-bookmarks-grid">
                {bookmarks.map((bm) => (
                  <div key={bm._id} className="card-clean bookmark-item-card">
                    <div className="bookmark-card-top">
                      <h4 className="bookmark-name">{bm.title}</h4>
                      <span className="badge-tag badge-blue">{bm.category}</span>
                    </div>

                    <div className="bookmark-card-bottom">
                      <Link
                        to={`/explore/${(bm.category || 'sorting').toLowerCase()}/${bm.algorithmId}`}
                        className="btn-launch-visualizer"
                      >
                        Launch Visualizer <FaPlay style={{ fontSize: '0.75rem' }} />
                      </Link>
                      <button
                        type="button"
                        className="btn-delete-bookmark"
                        onClick={() => handleDeleteBookmark(bm.algorithmId)}
                        title="Remove bookmark"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Quiz History */}
          <section id="quizzes-section" className="dash-section-panel">
            <div className="section-header-row">
              <h2 className="dash-section-title">
                <FaGraduationCap className="title-icon-purple" /> Quiz History
              </h2>
            </div>

            {loadingData ? (
              <div className="loading-state-text">Loading quiz history...</div>
            ) : quizHistory.length === 0 ? (
              <div className="empty-dash-card">
                <p>No quizzes taken yet. Test your knowledge on any algorithm page!</p>
              </div>
            ) : (
              <div className="card-clean quiz-history-table-wrapper">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizHistory.slice(0, 8).map((q) => (
                      <tr key={q._id}>
                        <td className="table-algo-col">{q.algorithmId}</td>
                        <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                        <td>{q.score} / {q.totalQuestions}</td>
                        <td className="table-pct-col">{q.percentage}%</td>
                        <td>
                          <span className={`badge-tag ${q.passed ? 'badge-green' : 'badge-amber'}`}>
                            {q.passed ? 'PASSED' : 'PRACTICE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
