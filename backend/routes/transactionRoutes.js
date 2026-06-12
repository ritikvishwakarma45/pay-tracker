const express = require('express');
const multer = require('multer');
const {
  scanTransaction,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
  chatWithAI
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

// Multer Config for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});

// Route mappings
router.get('/export', exportTransactions);
router.post('/chat', chatWithAI);
router.post('/scan', upload.single('file'), scanTransaction);
router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
