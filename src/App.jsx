import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Category from './pages/Category/Category';
import Explorer from './pages/Explorer/Explorer';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore/:category" element={<Category />} />
          <Route path="/explore/:category/:algoId" element={<Explorer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
