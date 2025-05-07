const mongoose = require('mongoose')

const depositRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  screenshotUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('DepositRequest', depositRequestSchema)
