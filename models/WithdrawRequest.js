const mongoose = require('mongoose')

const withdrawRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  upiInfo: { type: String }, // could be UPI ID or phone number
  qrScreenshotUrl: { type: String }, // optional: if they upload a QR instead
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema)
