# Secure E-Voting Platform for Local Body Elections

A secure, user-friendly digital voting platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for conducting local body elections.

## 🌟 Features

### Core Functionality
- **Secure Voter Authentication**: Login using Voter ID and password
- **One Vote Per Voter**: System ensures each voter can vote only once
- **Encrypted Vote Storage**: All votes are encrypted before being stored in the database
- **Admin Panel**: Complete election management system
- **Audit Logs**: Comprehensive logging of all actions (without revealing vote choices)
- **Real-time Results**: Automatic vote counting with charts and graphs

### Pages
1. **Home Page** - Landing page with options for voter and admin login
2. **Voter Login Page** - Secure authentication for voters
3. **Vote Casting Page** - Interface to view candidates and cast votes
4. **Vote Confirmation Page** - Confirmation after successful vote submission
5. **Admin Login Page** - Secure authentication for administrators
6. **Admin Dashboard** - Complete election management interface
7. **Results Page** - Display election results with charts

### Security Features
- ✅ Password hashing using bcryptjs
- ✅ JWT-based authentication
- ✅ Vote encryption using AES encryption
- ✅ One vote per voter enforcement
- ✅ Audit logging for transparency
- ✅ Protected API routes

### UI/UX Features
- ✅ Clean, modern, and attractive design
- ✅ Mobile-friendly and responsive
- ✅ Back navigation on all pages
- ✅ Clear success/error messages
- ✅ Intuitive user interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Hack
```

2. **Set up the Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and secret keys
```

3. **Set up the Frontend**
```bash
cd ../frontend
npm install
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Start the Backend Server**
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

6. **Start the Frontend**
```bash
cd frontend
npm start
# App will run on http://localhost:3000
```

## 📋 Default Admin Account

To get started, you need to create an admin account in MongoDB:

```javascript
// Use MongoDB shell or MongoDB Compass
use evoting;

db.users.insertOne({
  voterId: "ADMIN001",
  name: "System Administrator",
  password: "$2a$10$YourHashedPasswordHere", // Hash "admin123" or your password
  role: "admin",
  hasVoted: false,
  createdAt: new Date()
});
```

Or use this script:
```bash
cd backend
node -e "
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  await User.create({
    voterId: 'ADMIN001',
    name: 'System Administrator',
    password: hashedPassword,
    role: 'admin'
  });
  
  console.log('Admin created successfully!');
  process.exit(0);
});
"
```

## 🎯 Usage

### For Administrators

1. **Login** at `/admin-login` with your admin credentials
2. **Create an Election**: Set title, description, start and end dates
3. **Add Candidates**: Add candidates with party names and symbols
4. **Add Voters**: Register voters with Voter IDs and passwords
5. **Start Election**: Change election status from "upcoming" to "active"
6. **Monitor**: View dashboard statistics and audit logs
7. **End Election**: Change status to "ended" when voting period is over
8. **View Results**: Access detailed results with charts and graphs

### For Voters

1. **Login** at `/voter-login` with your Voter ID and password
2. **View Candidates**: See all candidates for the active election
3. **Cast Vote**: Select your preferred candidate
4. **Confirmation**: Receive confirmation that your vote was recorded
5. **View Results**: After election ends, view the results

## 🛠️ Technology Stack

### Backend
- **Express.js**: Web application framework
- **MongoDB**: Database for storing all data
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **crypto-js**: AES encryption for votes
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Frontend
- **React.js**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Chart.js**: Data visualization
- **React-Chartjs-2**: React wrapper for Chart.js

## 📁 Project Structure

```
Hack/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Election.js
│   │   ├── Candidate.js
│   │   ├── Vote.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── elections.js
│   │   ├── candidates.js
│   │   ├── votes.js
│   │   ├── results.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── encryption.js
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── VoterLogin.js
│   │   │   ├── VoteCasting.js
│   │   │   ├── VoteConfirmation.js
│   │   │   ├── AdminLogin.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── Results.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## 🔒 Security Considerations

1. **Passwords**: All passwords are hashed using bcryptjs before storage
2. **Vote Encryption**: Votes are encrypted using AES encryption
3. **JWT Tokens**: Authentication uses JWT with expiration
4. **Vote Privacy**: Audit logs don't reveal vote choices
5. **One Vote Enforcement**: Database constraints prevent multiple votes
6. **Protected Routes**: Middleware ensures only authenticated users access protected endpoints

## 🧪 Testing the Application

### Test Scenario 1: Complete Voting Flow
1. Create admin account
2. Login as admin
3. Create an election
4. Add 3-4 candidates
5. Add 5-10 voters
6. Start the election
7. Login as different voters and cast votes
8. End the election
9. View results with charts

### Test Scenario 2: Security Verification
1. Try to vote twice with the same voter ID (should fail)
2. Try to access admin routes without admin credentials (should fail)
3. Verify votes are encrypted in database
4. Check audit logs for all actions

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Voter login
- `POST /api/auth/admin/login` - Admin login

### Elections
- `GET /api/elections` - Get all elections
- `GET /api/elections/active` - Get active election
- `POST /api/elections` - Create election (admin)
- `PUT /api/elections/:id/status` - Update status (admin)

### Candidates
- `GET /api/candidates/election/:electionId` - Get candidates
- `POST /api/candidates` - Add candidate (admin)

### Voting
- `POST /api/votes` - Cast vote
- `GET /api/votes/status` - Check vote status

### Results
- `GET /api/results/:electionId` - Get election results

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/voters` - Get all voters
- `POST /api/admin/voters` - Add voter
- `GET /api/admin/audit-logs` - Get audit logs

## 🎨 Design Features

- Modern gradient backgrounds
- Card-based UI components
- Hover effects and animations
- Responsive grid layouts
- Color-coded status indicators
- Interactive charts and graphs
- Clear visual hierarchy

## 📝 License

This project is created for educational purposes as a hackathon prototype.

## 👥 Support

For issues or questions, please open an issue in the repository.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for security and transparency
- Focused on user experience and accessibility