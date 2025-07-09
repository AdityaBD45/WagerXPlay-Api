const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middleware/verifyToken');
const verifyAdmin = require('./middleware/verifyAdmin');
const oddsRoutes = require("./routes/oddsRoutes");
const betRoutes = require('./routes/betRoutes');
const depositRoutes = require('./routes/depositRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const cron = require("node-cron");
const updateOdds = require("./services/oddsUpdater");
require("dotenv").config();

// Schedule the job to run every 4 hours
cron.schedule("0 */4 * * *", () => {
  updateOdds();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'your-fallback-URI', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// ✅ Middleware
app.use(cors({
  origin: 'https://wagerxplay.onrender.com',
}));

// ✅ Increase payload size limit
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);

app.post('/api/admin/createMatch', verifyToken, verifyAdmin, (req, res) => {
  res.status(201).json({ message: 'Match created successfully' });
});

app.use("/api", oddsRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawRoutes);

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
