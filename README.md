# 🏏 WagerXPlay API

This is the backend API for **WagerXPlay**, a **cricket sport betting simulation platform**. It is built with **Node.js**, **Express**, and **MongoDB**. This project aims to help us improve our **backend development skills**, **logical thinking**, and understand how real-world applications handle betting systems.

> ⚠️ **Disclaimer**: This project is for **educational and skill-building purposes only**. It is not intended for real-money gambling or commercial use.


check here a how this website looks :
🔗 **Live Site:** [https://wagerxplay.onrender.com](https://wagerxplay.onrender.com)
---

## 🔧 Core Features

### ✅ JWT Authentication
- Secure login/register.
- Middleware-based route protection.

### 🏏 Cricket Match Betting System
- Users place bets on upcoming matches with odds.
- Bets are locked once the match begins.
- Admin declares the result manually.
- Bets are then updated to either **won** or **lost** based on user selection.

### 💰 Deposit & Withdrawal Management
- Users request deposits and withdrawals.
- Admins review, approve, or reject requests.
- User balances are updated accordingly.
- Each transaction is tracked in a deposit/withdrawal history log.

### 📊 Odds Management
- Admin or cron script updates odds in the database every few hours.
- Users see real-time odds when placing bets.
- Odds are linked to match IDs and teams.

---

## 🧠 Logic Breakdown

### 🔐 Authentication Logic
- Users register with hashed passwords (`bcrypt`).
- JWT token is created on login and stored client-side.
- Middleware checks token for protected routes.

### 📥 Deposit Logic
- Users send a deposit request with the amount.
- Admin views all pending deposits and approves/rejects.
- On approval, user's balance is updated and history is logged.

### 💸 Withdrawal Logic
- Users can request withdrawals based on current balance.
- Admin manually approves or rejects.
- Approved withdrawals deduct the amount from user balance and are recorded in history.

### 🏆 Betting Logic
- Bets are only allowed on matches marked as "upcoming".
- When placing a bet:
  - The system checks user balance.
  - Bet amount is deducted immediately.
  - Winnings are calculated based on odds when result is declared.
  - Admin declares the winner (team), and all bets for that match are resolved.

### 📁 History Tracking
- Every deposit and withdrawal is saved in user-specific history collections.
- Users can view their past transactions through dedicated endpoints.

### 🗃 Odds Logic
- Matches are stored with:
  - Team names
  - Match IDs
  - Associated odds (win rates)
- Cron job or manual upload updates odds data.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcrypt
- **File Uploads**: Multer, Cloudinary *(optional)*
- **Cron Jobs**: node-cron
- **Miscellaneous**: dotenv, cors, cookie-parser, cheerio *(optional)*

---

## 📁 Folder Structure

backend/
├── controllers/ # Business logic for each feature
├── models/ # Mongoose schemas
├── routes/ # API route handlers
├── middlewares/ # JWT + Admin verification
├── services/ # Includes cloudinary, odds updater, image upload
├── server.js # Entry point


---

## 🚀 Getting Started

### 1. Clone the repo:

```bash
git clone https://github.com/AdityaBD45/WagerXPlay-Api.git

2. Install dependencies:
bash
Copy code
npm install

3. Create a .env file and configure:
env
Copy code
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

4. Start the server:
bash
Copy code
npm run dev


📝 License
This project is licensed under the MIT License – meaning you're free to use, copy, modify, merge, publish, and distribute with attribution.