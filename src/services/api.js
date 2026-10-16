// Resolve API base URL robustly across production and local environments
let API_BASE_URL;

if (import.meta.env.PROD) {
  const prodEnvUrl = import.meta.env.VITE_API_URL;
  if (prodEnvUrl && typeof prodEnvUrl === 'string' && prodEnvUrl.trim() && !prodEnvUrl.includes('localhost') && !prodEnvUrl.includes('127.0.0.1')) {
    const trimmed = prodEnvUrl.trim().replace(/\/+$/, '');
    API_BASE_URL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  } else {
    API_BASE_URL = 'https://algoverse-api-iuah.onrender.com/api';
  }
} else {
  const devEnvUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (devEnvUrl && typeof devEnvUrl === 'string' && devEnvUrl.trim()) {
    const trimmed = devEnvUrl.trim().replace(/\/+$/, '');
    API_BASE_URL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  } else {
    API_BASE_URL = 'http://localhost:5000/api';
  }
}

/**
 * Core HTTP request helper with credentialed cookies, bearer token fallback, and JSON parsing.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('algoverse_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include' // Always send/receive HTTP-only session cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('algoverse_token');
      }
      const error = new Error(data.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.code = data.code;
      error.data = data;
      throw error;
    }

    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('algoverse_token', data.token);
    }

    return data;
  } catch (err) {
    // Distinguish network/connection failures from server errors
    if (!err.status) {
      err.message = 'Unable to connect to AlgoVerse server. Please ensure the backend is running.';
      err.code = 'NETWORK_ERROR';
    }
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (name, email, password) => 
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      }),

    login: (email, password) => 
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    googleAuth: (credential, linkPassword = null) => 
      request('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential, linkPassword })
      }),

    logout: async () => {
      try {
        return await request('/auth/logout', { method: 'POST' });
      } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('algoverse_token');
        }
      }
    },

    getMe: () => 
      request('/auth/me', { method: 'GET' }),

    forgotPassword: (email) => 
      request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      }),

    resetPassword: (token, newPassword) => 
      request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      })
  },

  // Learning Progress
  progress: {
    getAll: () => 
      request('/progress', { method: 'GET' }),

    getByAlgorithm: (algorithmId) => 
      request(`/progress/${algorithmId}`, { method: 'GET' }),

    update: (algorithmId, data) => 
      request(`/progress/${algorithmId}`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Bookmarks
  bookmarks: {
    getAll: () => 
      request('/bookmarks', { method: 'GET' }),

    check: (algorithmId) => 
      request(`/bookmarks/check/${algorithmId}`, { method: 'GET' }),

    create: (algorithmId, notes = '') => 
      request('/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ algorithmId, notes })
      }),

    delete: (algorithmId) => 
      request(`/bookmarks/${algorithmId}`, { method: 'DELETE' })
  },

  // Quizzes
  quizzes: {
    getQuestions: (algorithmId) => 
      request(`/quizzes/${algorithmId}`, { method: 'GET' }),

    submit: (algorithmId, answers) => 
      request(`/quizzes/${algorithmId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      }),

    getHistory: () => 
      request('/quizzes/history', { method: 'GET' }),

    getSummary: () => 
      request('/quizzes/summary', { method: 'GET' })
  },

  // System & Database Health
  system: {
    getHealth: () => 
      request('/health', { method: 'GET' }),

    getDBStatus: () => 
      request('/db-status', { method: 'GET' })
  }
};
