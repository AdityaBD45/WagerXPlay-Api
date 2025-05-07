const DepositRequest = require('../models/DepositRequest')
const User = require('../models/User')

const uploadImageToCloudinary = require('../services/uploadToCloudinary');

// User creates a deposit request
exports.createDepositRequest = async (req, res) => {
  try {
    const { amount, screenshotBase64 } = req.body;
    console.log(req.body); // Log the incoming request body
    if (!amount || !screenshotBase64) {
      return res.status(400).json({ message: 'Amount and screenshot are required' });
    }

    const screenshotUrl = await uploadImageToCloudinary(screenshotBase64);

    const deposit = await DepositRequest.create({
      userId: req.user.id,
      amount,
      screenshotUrl,
    });

    res.status(201).json(deposit);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// Admin fetches all pending deposit requests
exports.getAllDepositRequests = async (req, res) => {
    try {
      const requests = await DepositRequest.find({ status: 'pending' }).populate('userId', 'username');
      res.status(200).json(requests);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch deposit requests' });
    }
  };

// Admin approves or rejects a deposit
exports.updateDepositStatus = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
  
      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const deposit = await DepositRequest.findById(requestId);
      if (!deposit) return res.status(404).json({ message: 'Request not found' });
  
      // If approved, update user's balance
      if (status === 'approved') {
        const user = await User.findById(deposit.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
  
        user.balance += deposit.amount;
        await user.save();
      }
  
      // Update the deposit status
      deposit.status = status;
      await deposit.save();
  
      res.status(200).json(deposit);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update request' });
    }
  };

  // User gets their own deposit history
exports.getUserDepositHistory = async (req, res) => {
    try {
      const deposits = await DepositRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json(deposits);
    } catch (err) {
      console.error('Error fetching deposit history:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
