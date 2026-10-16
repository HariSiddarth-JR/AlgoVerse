import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Auth modal management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [authModalContext, setAuthModalContext] = useState(null); // Optional context message (e.g. "Log in to bookmark")

  const openAuthModal = useCallback((mode = 'login', contextMessage = null) => {
    setAuthModalMode(mode);
    setAuthModalContext(contextMessage);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setAuthModalContext(null);
  }, []);

  // Restore authenticated session from HTTP-only cookie on application mount
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      // 401 on initial check simply means user is not logged in (guest)
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        closeAuthModal();
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg, code: err.code };
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await api.auth.register(name, email, password);
      if (res.success && res.user) {
        setUser(res.user);
        closeAuthModal();
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const googleAuth = async (credential, linkPassword = null) => {
    setAuthError(null);
    try {
      const res = await api.auth.googleAuth(credential, linkPassword);
      if (res.success && res.user) {
        setUser(res.user);
        closeAuthModal();
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Google sign-in failed' };
    } catch (err) {
      setAuthError(err.message);
      return {
        success: false,
        error: err.message,
        code: err.code,
        email: err.data?.email
      };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout warning:', err.message);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    authError,
    setAuthError,
    login,
    register,
    googleAuth,
    logout,
    refreshUser: checkSession,
    isAuthModalOpen,
    authModalMode,
    authModalContext,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
