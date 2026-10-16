import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../assets/Algoverse LOGO.png';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './AuthModal.css';

// Global tracker to ensure Google Identity Services is only initialized once
let isGoogleIdentityInitialized = false;
let activeGoogleCredentialCallback = null;

const AuthModal = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalContext,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
    googleAuth,
    authError,
    setAuthError
  } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Safe Google account linking prompt
  const [linkAccountData, setLinkAccountData] = useState(null);
  const [linkPassword, setLinkPassword] = useState('');

  const googleBtnRef = useRef(null);
  const handleGoogleCredentialRef = useRef(null);

  // Keep callback ref updated with current component state
  handleGoogleCredentialRef.current = async (response) => {
    if (!response?.credential) return;

    setSubmitting(true);
    try {
      const res = await googleAuth(response.credential);

      if (!res.success && res.code === 'ACCOUNT_EXISTS_WITH_PASSWORD') {
        setLinkAccountData({
          credential: response.credential,
          email: res.email
        });
      }
    } catch (err) {
      console.warn('Google auth error:', err);
      setAuthError('Google Sign-In failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  activeGoogleCredentialCallback = (response) => {
    handleGoogleCredentialRef.current?.(response);
  };

  // Reset form when modal opens or mode changes
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setLinkPassword('');
    setShowPassword(false);
    setLinkAccountData(null);
    setSuccessMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  // Initialize Google Identity Services exactly once, and render button when open
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    let retryTimer;

    const setupGoogleSignIn = () => {
      if (cancelled) return;

      if (!window.google?.accounts?.id || !googleBtnRef.current) {
        retryTimer = window.setTimeout(setupGoogleSignIn, 200);
        return;
      }

      // Initialize Google Identity Services only once across the application lifecycle
      if (!isGoogleIdentityInitialized) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (activeGoogleCredentialCallback) {
              activeGoogleCredentialCallback(response);
            }
          }
        });
        isGoogleIdentityInitialized = true;
      }

      // Clean existing button and render button for current modal mode
      googleBtnRef.current.replaceChildren();

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: authModalMode === 'register' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        width: Math.min(320, googleBtnRef.current.clientWidth || 320)
      });
    };

    setupGoogleSignIn();

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
    };
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setAuthError(null);

    try {
      if (linkAccountData) {
        const res = await googleAuth(linkAccountData.credential, linkPassword);
        if (res.success) {
          setLinkAccountData(null);
        }
      } else if (authModalMode === 'login') {
        await login(email, password);
      } else if (authModalMode === 'register') {
        await register(name, email, password);
      } else if (authModalMode === 'forgot') {
        const res = await api.auth.forgotPassword(email);
        setSuccessMessage(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="auth-overlay-backdrop" onClick={closeAuthModal}>
        <motion.div
          className="auth-split-dialog"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close Icon Button */}
          <button className="auth-close-x" onClick={closeAuthModal} aria-label="Close dialog">
            <FaTimes />
          </button>

          {/* Left Brand Banner Column */}
          <div className="auth-brand-side">
            <div className="brand-logo-badge">
              <img src={logo} alt="AlgoVerse" className="brand-logo-img" />
              <span className="brand-title-text">AlgoVerse</span>
            </div>

            <div className="brand-welcome-copy">
              <h2 className="welcome-headline">Welcome Back</h2>
              <p className="welcome-subtext">
                Sign in to access your learning progress, saved bookmarks, and interactive quizzes.
              </p>
            </div>

            {authModalContext && (
              <div className="brand-context-note">
                {authModalContext}
              </div>
            )}
          </div>

          {/* Right Form Column */}
          <div className="auth-form-side">
            {/* Nav Tabs */}
            {!linkAccountData && (
              <div className="auth-tabs-row">
                <button
                  type="button"
                  className={`auth-tab-link ${authModalMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthModalMode('login')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab-link ${authModalMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthModalMode('register')}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className={`auth-tab-link ${authModalMode === 'forgot' ? 'active' : ''}`}
                  onClick={() => setAuthModalMode('forgot')}
                >
                  Forgot Password
                </button>
              </div>
            )}

            {/* Google Continue Button */}
            {!linkAccountData && authModalMode !== 'forgot' && (
              <div className="google-oauth-container">
                <div ref={googleBtnRef}></div>
                {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                  <button
                    type="button"
                    className="btn-google-fallback"
                    onClick={() => {
                      setAuthError(
                        'Google Sign-In requires configuring VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID in your environment.'
                      );
                    }}
                  >
                    <FaGoogle className="icon-google" /> Continue with Google
                  </button>
                )}
                <div className="auth-or-separator">
                  <span>OR</span>
                </div>
              </div>
            )}

            {authError && <div className="auth-error-banner">{authError}</div>}
            {successMessage && <div className="auth-success-banner">{successMessage}</div>}

            {/* Credential Form */}
            <form className="auth-credential-form" onSubmit={handleSubmit}>
              {linkAccountData ? (
                <div className="input-field-group">
                  <label className="input-field-label">Current Password</label>
                  <input
                    type="password"
                    className="input-field-element"
                    placeholder="Enter your current password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <>
                  {authModalMode === 'register' && (
                    <div className="input-field-group">
                      <label className="input-field-label">Name</label>
                      <input
                        type="text"
                        className="input-field-element"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="input-field-group">
                    <label className="input-field-label">Email</label>
                    <input
                      type="email"
                      className="input-field-element"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {authModalMode !== 'forgot' && (
                    <div className="input-field-group">
                      <label className="input-field-label">Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="input-field-element password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-eye"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button type="submit" className="btn-auth-submit" disabled={submitting}>
                {submitting
                  ? 'Processing...'
                  : linkAccountData
                  ? 'Confirm & Link Account'
                  : authModalMode === 'login'
                  ? 'Sign In'
                  : authModalMode === 'register'
                  ? 'Create Account'
                  : 'Send Reset Instructions'}
              </button>
            </form>

            {/* Bottom Footer Switcher */}
            <div className="auth-bottom-switch">
              {authModalMode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="switch-link-btn"
                    onClick={() => setAuthModalMode('register')}
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="switch-link-btn"
                    onClick={() => setAuthModalMode('login')}
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
