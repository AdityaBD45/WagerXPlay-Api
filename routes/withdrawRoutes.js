const express = require('express')
const router = express.Router()
const {
  createWithdrawRequest,
  getAllWithdrawRequests,
  updateWithdrawStatus,
  getUserWithdrawHistory
} = require('../controllers/withdrawController')
const verifyToken = require('../middleware/verifyToken')
const verifyAdmin = require('../middleware/verifyAdmin')

// User creates withdraw
router.post('/', verifyToken, createWithdrawRequest)

// Admin fetches all withdraw requests
router.get('/', verifyToken, verifyAdmin, getAllWithdrawRequests)

// Admin updates status of withdraw request
router.put('/:requestId', verifyToken, verifyAdmin, updateWithdrawStatus)
router.get('/history', verifyToken, getUserWithdrawHistory);

module.exports = router
