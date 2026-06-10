import { API_URL } from '../config';

export const apiService = {
  // Fetch all transactions
  getTransactions: async () => {
    const res = await fetch(`${API_URL}/api/transactions`);
    if (!res.ok) {
      throw new Error('Failed to retrieve transactions.');
    }
    return res.json();
  },

  // Manually create a transaction
  createTransaction: async (transactionData) => {
    const res = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
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
      body: formData,
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to update transaction.');
    }
    return res.json();
  },

  // Delete a transaction
  deleteTransaction: async (id) => {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to delete transaction.');
    }
    return res.json();
  }
};
