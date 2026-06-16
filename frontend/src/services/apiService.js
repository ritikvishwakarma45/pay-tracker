import { API_URL } from '../config';

// Helper to construct authorization headers
const getHeaders = (contentType = 'application/json') => {
  const token = localStorage.getItem('pay_tracker_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
};

export const apiService = {
  // --- AUTH SERVICES ---
  
  // Login user
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to log in.');
    }
    return res.json();
  },

  // Register user
  signup: async (name, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to register account.');
    }
    return res.json();
  },

  // Get current user profile
  getMe: async () => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: getHeaders(null)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to fetch user profile.');
    }
    return res.json();
  },


  // --- TRANSACTION SERVICES ---

  // Fetch all transactions for the authenticated user
  getTransactions: async () => {
    const res = await fetch(`${API_URL}/api/transactions`, {
      method: 'GET',
      headers: getHeaders(null)
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve transactions.');
    }
    return res.json();
  },

  // Manually create a transaction
  createTransaction: async (transactionData) => {
    const res = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify(transactionData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to create transaction.');
    }
    return res.json();
  },

  // Scan transaction receipt / statement
  scanReceipt: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/transactions/scan`, {
      method: 'POST',
      headers: getHeaders(null), // Let browser set Content-Type with boundary for FormData
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to scan receipt.');
    }
    return res.json();
  },

  // Update a transaction
  updateTransaction: async (id, transactionData) => {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders('application/json'),
      body: JSON.stringify(transactionData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to update transaction.');
    }
    return res.json();
  },

  // Delete a transaction
  // Delete a transaction
  deleteTransaction: async (id) => {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(null)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to delete transaction.');
    }
    return res.json();
  },

  // Export transactions to CSV
  exportTransactions: async () => {
    const res = await fetch(`${API_URL}/api/transactions/export`, {
      method: 'GET',
      headers: getHeaders(null)
    });
    if (!res.ok) {
      throw new Error('Failed to export transactions.');
    }
    return res.blob();
  },

  // Chat with AI assistant
  chatWithAI: async (message) => {
    const res = await fetch(`${API_URL}/api/transactions/chat`, {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to get AI response.');
    }
    return res.json();
  },

  // Update user profile details (name, email, password)
  updateProfile: async (profileData) => {
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getHeaders('application/json'),
      body: JSON.stringify(profileData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to update profile.');
    }
    return res.json();
  },

  // Scan multiple receipt files in bulk
  scanReceiptBulk: async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    const res = await fetch(`${API_URL}/api/transactions/scan-bulk`, {
      method: 'POST',
      headers: getHeaders(null),
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to scan receipts in bulk.');
    }
    return res.json();
  }
};
