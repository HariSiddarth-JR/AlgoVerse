import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaTimesCircle, FaTrophy, FaRedo } from 'react-icons/fa';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './QuizModal.css';

const QuizModal = ({ algorithmId, algorithmTitle, isOpen, onClose, onQuizCompleted }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [result, setResult] = useState(null); // { score, totalQuestions, percentage, passed, feedback }
  const [error, setError] = useState(null);

  const fetchQuestions = React.useCallback(() => {
    if (!algorithmId) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedAnswers({});

    api.quizzes
      .getQuestions(algorithmId)
      .then((data) => {
        setQuestions(data.questions || []);
      })
      .catch((err) => {
        if (err.status === 401) {
          setError('Please sign in to access algorithm quizzes.');
        } else {
          setError(err.message || 'Failed to load quiz questions.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [algorithmId]);

  // Fetch client-safe questions on modal open
  useEffect(() => {
    if (!isOpen || !algorithmId) return;
    fetchQuestions();
  }, [isOpen, algorithmId, fetchQuestions]);

  if (!isOpen) return null;

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return; // Prevent changing answers after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in to submit your quiz and save your progress.');
      return;
    }

    const answersPayload = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));

    if (answersPayload.length === 0) {
      setError('Please answer at least one question before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = await api.quizzes.submit(algorithmId, answersPayload);
      setResult(data);
      if (onQuizCompleted) {
        onQuizCompleted(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    fetchQuestions();
  };

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  return (
    <AnimatePresence>
      <div className="quiz-modal-overlay" onClick={onClose}>
        <motion.div
          className="quiz-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className="quiz-modal-header">
            <h2 className="quiz-modal-title">
              {algorithmTitle} Knowledge Check
            </h2>
            <button className="auth-modal-close" onClick={onClose} aria-label="Close quiz">
              <FaTimes />
            </button>
          </div>

          <div className="quiz-modal-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
                Loading quiz questions...
              </div>
            ) : error ? (
              <div className="auth-error-banner" style={{ margin: '1rem 0' }}>
                {error}
                {!isAuthenticated && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="auth-submit-btn"
                      onClick={() => openAuthModal('login', 'Sign in to access quizzes')}
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
              </div>
            ) : questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
                No questions available for this algorithm yet.
              </div>
            ) : (
              questions.map((q, qIndex) => {
                const feedbackItem = result?.feedback?.find((f) => f.questionId === q.id);

                return (
                  <div key={q.id} className="quiz-question-card">
                    <p className="quiz-question-text">
                      {qIndex + 1}. {q.question}
                    </p>

                    <div className="quiz-options-list">
                      {q.options.map((option, optIndex) => {
                        const isSelected = selectedAnswers[q.id] === optIndex;
                        let optionClass = 'quiz-option-btn';

                        if (result && feedbackItem) {
                          if (optIndex === feedbackItem.correctOption) {
                            optionClass += ' correct';
                          } else if (isSelected && !feedbackItem.isCorrect) {
                            optionClass += ' wrong';
                          }
                        } else if (isSelected) {
                          optionClass += ' selected';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            className={optionClass}
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            disabled={Boolean(result)}
                          >
                            <span style={{ fontWeight: 600, minWidth: '20px' }}>
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span style={{ flex: 1 }}>{option}</span>
                            {result && feedbackItem && (
                              <span>
                                {optIndex === feedbackItem.correctOption ? (
                                  <FaCheck style={{ color: '#34d399' }} />
                                ) : isSelected && !feedbackItem.isCorrect ? (
                                  <FaTimesCircle style={{ color: '#f87171' }} />
                                ) : null}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {result && feedbackItem && (
                      <div className="quiz-explanation-box">
                        <strong>Explanation:</strong> {feedbackItem.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="quiz-modal-footer">
            {result ? (
              <>
                <div className="quiz-result-score-box">
                  <div className={`score-badge ${result.passed ? 'passed' : 'failed'}`}>
                    <FaTrophy style={{ marginRight: '0.4rem' }} />
                    {result.score} / {result.totalQuestions} ({result.percentage}%) - {result.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-secondary" onClick={handleRetake}>
                    <FaRedo style={{ marginRight: '0.4rem' }} /> Retake
                  </button>
                  <button type="button" className="btn-primary" onClick={onClose}>
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  {Object.keys(selectedAnswers).length} of {questions.length} answered
                </div>

                <button
                  type="button"
                  className="btn-submit-quiz"
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting || loading}
                >
                  {submitting ? 'Evaluating...' : 'Submit Answers'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuizModal;
