const express = require('express')
const router = express.Router()
const {
  createDepositRequest,
  getAllDepositRequests,
  updateDepositStatus,
  getUserDepositHistory
} = require('../controllers/depositController')
const verifyToken = require('../middleware/verifyToken')
const verifyAdmin = require('../middleware/verifyAdmin')

// User creates deposit
router.post('/', verifyToken, createDepositRequest)

// Admin fetches all
router.get('/', verifyToken, verifyAdmin, getAllDepositRequests)

// Admin updates status
router.put('/:requestId', verifyToken, verifyAdmin, updateDepositStatus)

router.get('/history', verifyToken, getUserDepositHistory);

module.exports = router
