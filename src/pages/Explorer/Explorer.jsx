import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaBookmark, FaRegBookmark, FaGraduationCap, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { algorithmsRegistry } from '../../algorithms';
import { useVisualizer } from '../../hooks/useVisualizer';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Components
import SortingEngine from '../../engines/SortingEngine/SortingEngine';
import SearchingEngine from '../../engines/SearchingEngine/SearchingEngine';
import Controls from '../../components/Controls/Controls';
import Statistics from '../../components/Statistics/Statistics';
import CurrentAction from '../../components/CurrentAction/CurrentAction';
import AlgorithmInfo from '../../components/AlgorithmInfo/AlgorithmInfo';
import CodePanel from '../../components/CodePanel/CodePanel';
import QuizModal from '../../components/QuizModal/QuizModal';

import './Explorer.css';

const Explorer = () => {
  const { algoId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Validate algorithm exists, else fallback to bubble sort
  useEffect(() => {
    if (!algorithmsRegistry[algoId]) {
      navigate('/explore/sorting/bubble', { replace: true });
    }
  }, [algoId, navigate]);

  const currentAlgo = useMemo(() => algorithmsRegistry[algoId] || algorithmsRegistry['bubble'], [algoId]);

  // Visualizer hook
  const {
    array,
    activeIndices,
    stepType,
    currentStep,
    currentStepIndex,
    totalSteps,
    isPlaying,
    speed,
    setSpeed,
    arraySize,
    setArraySize,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    comparisons,
    swaps,
    progress
  } = useVisualizer(currentAlgo);

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkMessage, setBookmarkMessage] = useState(null);

  // Quiz modal state
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // List of algorithms in the same category for the left sidebar (deduplicated by title)
  const categoryAlgorithms = useMemo(() => {
    const cat = currentAlgo?.category?.toLowerCase() || 'sorting';
    const seen = new Set();
    return Object.values(algorithmsRegistry).filter((algo) => {
      if (algo.category.toLowerCase() !== cat) return false;
      if (seen.has(algo.title)) return false;
      seen.add(algo.title);
      return true;
    });
  }, [currentAlgo]);

  // Check bookmark status on load or user change
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && algoId) {
      api.bookmarks
        .check(algoId)
        .then((res) => {
          if (isMounted) setIsBookmarked(Boolean(res.isBookmarked));
        })
        .catch(() => {
          if (isMounted) setIsBookmarked(false);
        });
    } else {
      setIsBookmarked(false);
    }
    return () => {
      isMounted = false;
    };
  }, [algoId, isAuthenticated]);

  // Toggle bookmark handler
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Sign in to bookmark algorithms for quick review.');
      return;
    }

    setBookmarkLoading(true);
    setBookmarkMessage(null);
    try {
      if (isBookmarked) {
        await api.bookmarks.delete(algoId);
        setIsBookmarked(false);
        setBookmarkMessage({ type: 'info', text: 'Bookmark removed.' });
      } else {
        await api.bookmarks.create(algoId);
        setIsBookmarked(true);
        setBookmarkMessage({ type: 'success', text: 'Algorithm bookmarked!' });
      }
      setTimeout(() => setBookmarkMessage(null), 3500);
    } catch (err) {
      console.warn('Bookmark action failed:', err.message);
      setBookmarkMessage({ type: 'error', text: err.message || 'Failed to update bookmark.' });
      setTimeout(() => setBookmarkMessage(null), 4000);
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Background learning progress synchronization
  const lastRecordedStepRef = useRef(-1);
  useEffect(() => {
    if (!isAuthenticated || !algoId) return;

    // Record completed progress when final step is reached
    if (totalSteps > 1 && currentStepIndex === totalSteps - 1 && lastRecordedStepRef.current !== currentStepIndex) {
      lastRecordedStepRef.current = currentStepIndex;
      api.progress
        .update(algoId, {
          status: 'completed',
          incrementVisualized: true,
          lastStepIndex: currentStepIndex
        })
        .catch(() => {});
    }
  }, [currentStepIndex, totalSteps, algoId, isAuthenticated]);

  if (!currentAlgo) return null;

  return (
    <div className="explorer-page">
      {/* Top Breadcrumb and Actions Bar */}
      <div className="explorer-topbar">
        <div className="explorer-breadcrumbs">
          <Link
            to={`/explore/${currentAlgo.category.toLowerCase()}`}
            className="breadcrumb-back-link"
          >
            <FaArrowLeft /> Algorithms
          </Link>
          <span className="breadcrumb-chevron">&gt;</span>
          <span className="breadcrumb-cat">{currentAlgo.category}</span>
          <span className="breadcrumb-chevron">&gt;</span>
          <span className="breadcrumb-active">{currentAlgo.title}</span>
        </div>

        <div className="explorer-topbar-actions">
          <button
            type="button"
            className={`btn-topbar-action ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this algorithm'}
          >
            {isBookmarked ? <FaBookmark className="icon-amber" /> : <FaRegBookmark />}
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            type="button"
            className="btn-topbar-action btn-quiz"
            onClick={() => setIsQuizOpen(true)}
            title="Take a quick knowledge quiz on this algorithm"
          >
            <FaGraduationCap />
            <span>Quiz</span>
          </button>
        </div>
      </div>

      {bookmarkMessage && (
        <div
          className={`badge-tag ${
            bookmarkMessage.type === 'error'
              ? 'badge-amber'
              : bookmarkMessage.type === 'success'
              ? 'badge-green'
              : 'badge-blue'
          }`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          {bookmarkMessage.text}
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="explorer-3col-layout">
        {/* Left Column: Category Algorithms Sidebar */}
        <aside className="explorer-left-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">{currentAlgo.category} Algorithms</h3>
          </div>
          <nav className="sidebar-algo-list">
            {categoryAlgorithms.map((algo) => {
              const isActive = algo.id === currentAlgo.id;
              return (
                <button
                  key={algo.id}
                  type="button"
                  className={`sidebar-algo-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(`/explore/${algo.category.toLowerCase()}/${algo.id}`)}
                >
                  <span className="algo-item-bullet"></span>
                  <span className="algo-item-title">{algo.title}</span>
                  {isActive && <FaCheck className="algo-active-check" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center Column: Visualizer Canvas & Information */}
        <main className="explorer-center-area">
          {/* Algorithm Info Header */}
          <div className="card-clean algo-header-card">
            <h1 className="algo-display-title">{currentAlgo.title}</h1>
            <p className="algo-display-desc">{currentAlgo.info.description}</p>
            <div className="algo-tags-row">
              <span className="badge-tag badge-green">Beginner</span>
              <span className="badge-tag badge-blue">{currentAlgo.info.averageCase}</span>
              <span className="badge-tag badge-amber">{currentAlgo.info.inPlace ? 'In-place' : 'Auxiliary'}</span>
              <span className="badge-tag badge-purple">{currentAlgo.info.stable ? 'Stable' : 'Unstable'}</span>
            </div>
          </div>

          {/* Visualizer Canvas Engine */}
          <div className="canvas-wrapper-outer">
            {currentAlgo.category === 'Sorting' && (
              <SortingEngine
                array={array}
                activeIndices={activeIndices}
                stepType={stepType}
                metadata={currentStep?.metadata}
              />
            )}
            {currentAlgo.category === 'Searching' && (
              <SearchingEngine
                array={array}
                activeIndices={activeIndices}
                stepType={stepType}
                metadata={currentStep?.metadata}
              />
            )}
          </div>

          {/* Code Panel Display */}
          <div className="codepanel-wrapper-outer">
            <CodePanel code={currentAlgo.code} activeLine={-1} />
          </div>
        </main>

        {/* Right Column: Controls, Statistics, and Current Action */}
        <aside className="explorer-right-sidebar">
          <Controls
            isPlaying={isPlaying}
            play={play}
            pause={pause}
            reset={reset}
            stepForward={stepForward}
            stepBackward={stepBackward}
            speed={speed}
            setSpeed={setSpeed}
            arraySize={arraySize}
            setArraySize={setArraySize}
            progress={progress}
          />

          <Statistics
            comparisons={comparisons}
            swaps={swaps}
            currentStepNumber={currentStepIndex + 1}
            totalSteps={totalSteps}
            timeComplexity={currentAlgo.info.averageCase}
            spaceComplexity={currentAlgo.info.spaceComplexity}
          />

          <CurrentAction step={currentStep} />

          <AlgorithmInfo info={currentAlgo.info} />
        </aside>
      </div>

      {/* Interactive Quiz Modal */}
      <QuizModal
        algorithmId={algoId}
        algorithmTitle={currentAlgo.title}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />
    </div>
  );
};

export default Explorer;
