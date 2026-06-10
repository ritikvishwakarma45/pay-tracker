const Transaction = require('../models/Transaction');
const { analyzeReceipt } = require('../utils/geminiHelper');

// @desc    Scan receipt and save transaction
// @route   POST /api/transactions/scan
// @access  Public
const scanTransaction = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image or PDF statement.' });
    }

    // Call Gemini helper to analyze receipt
    const transactionData = await analyzeReceipt(req.file.buffer, req.file.mimetype);

    // Save to Database
    const newTransaction = new Transaction(transactionData);
    const savedTransaction = await newTransaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).json({ error: error.message || 'Error occurred during receipt scanning.' });
  }
};

// @desc    Manually create a new transaction
// @route   POST /api/transactions
// @access  Public
const createTransaction = async (req, res) => {
  try {
    const { amount, merchantName, date, category, paymentMode } = req.body;
    
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount.' });
    }
    if (!merchantName || !merchantName.trim()) {
      return res.status(400).json({ error: 'Please enter a merchant/receiver name.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Please select a date.' });
    }

    const newTransaction = new Transaction({
      amount: Number(amount),
      merchantName: merchantName.trim(),
      date: new Date(date),
      category: category || 'Others',
      paymentMode: paymentMode || 'UPI',
      isAIGenerated: false
    });

    console.log('Manually inserting transaction:', newTransaction);

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error creating manual transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
};

// @desc    Fetch all transactions sorted by date (newest first)
// @route   GET /api/transactions
// @access  Public
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
};

// @desc    Update transaction for manual corrections
// @route   PUT /api/transactions/:id
// @access  Public
const updateTransaction = async (req, res) => {
  try {
    const { amount, merchantName, date, category, paymentMode, isAIGenerated } = req.body;
    
    // Normalize fields
    const updateData = {
      amount: Number(amount),
      merchantName,
      date: new Date(date),
      category,
      paymentMode,
      isAIGenerated: isAIGenerated !== undefined ? isAIGenerated : false
    };

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Public
const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully.', id: req.params.id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
};

module.exports = {
  scanTransaction,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
};
