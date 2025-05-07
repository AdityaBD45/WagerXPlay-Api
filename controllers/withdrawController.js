const WithdrawRequest = require('../models/WithdrawRequest')
const User = require('../models/User')

const uploadImageToCloudinary = require('../services/uploadToCloudinary');


// User creates a withdraw request
exports.createWithdrawRequest = async (req, res) => {
  try {
    const { amount, screenshotBase64 } = req.body; // FIXED: expects screenshotBase64 now
    console.log(req.body);

    if (!amount || !screenshotBase64) {
      return res.status(400).json({ message: 'Amount and screenshot are required' });
    }

    const qrCodeUrl = await uploadImageToCloudinary(screenshotBase64); // FIXED: use screenshotBase64

    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const withdraw = await WithdrawRequest.create({
      userId: req.user.id,
      amount,
      qrScreenshotUrl: qrCodeUrl,
    });

    res.status(201).json(withdraw);
  } catch (err) {
    console.error('Error in createWithdrawRequest:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Admin fetches all pending withdraw requests
exports.getAllWithdrawRequests = async (req, res) => {
    try {
      const requests = await WithdrawRequest.find({ status: 'pending' }).populate('userId', 'username');
      res.status(200).json(requests);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch withdraw requests' });
    }
  };
  

// Admin approves/rejects a withdraw
exports.updateWithdrawStatus = async (req, res) => {
  try {
    const { requestId } = req.params
    const { status } = req.body

    const withdraw = await WithdrawRequest.findById(requestId)
    if (!withdraw) return res.status(404).json({ message: 'Request not found' })

    if (status === 'approved') {
      const user = await User.findById(withdraw.userId)
      if (user.balance < withdraw.amount) {
        return res.status(400).json({ message: 'Insufficient balance' })
      }
      user.balance -= withdraw.amount
      await user.save()
    }

    withdraw.status = status
    await withdraw.save()

    res.status(200).json(withdraw)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update request' })
  }
}

// User's own withdraw history
exports.getUserWithdrawHistory = async (req, res) => {
    try {
      const withdrawals = await WithdrawRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json(withdrawals);
    } catch (err) {
      console.error('Error fetching withdraw history:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
