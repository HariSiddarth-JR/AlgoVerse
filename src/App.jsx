import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Category from './pages/Category/Category';
import Explorer from './pages/Explorer/Explorer';
import Dashboard from './pages/Dashboard/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthModal from './components/AuthModal/AuthModal';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explore/:category" element={<Category />} />
              <Route path="/explore/:category/:algoId" element={<Explorer />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <AuthModal />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
