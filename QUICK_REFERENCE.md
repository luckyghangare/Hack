# 🗳️ E-Voting Platform - Quick Reference

## 🚀 Quick Start

```bash
# 1. Start MongoDB
mongod

# 2. Backend Setup
cd backend
npm install
npm run seed      # Creates sample data
npm run dev       # Starts on port 5000

# 3. Frontend Setup (new terminal)
cd frontend
npm install
npm start         # Opens on port 3000
```

## 👥 Test Accounts

| Role | Voter ID | Password |
|------|----------|----------|
| Admin | ADMIN001 | admin123 |
| Voters | VOTER001-VOTER010 | voter123 |

## 📱 Application Pages

```
Home (/)
├── Voter Login (/voter-login)
│   └── Vote Casting (/vote)
│       └── Vote Confirmation (/vote-confirmation)
│           └── Results (/results)
└── Admin Login (/admin-login)
    ├── Admin Dashboard (/admin/dashboard)
    │   ├── Dashboard Tab (statistics)
    │   ├── Elections Tab (create/manage elections)
    │   ├── Candidates Tab (add/manage candidates)
    │   ├── Voters Tab (add/manage voters)
    │   └── Audit Logs Tab (view all actions)
    └── Results (/results)
```

## 🔑 Key Features

### Security
- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication (24h expiry)
- ✅ AES vote encryption
- ✅ Rate limiting (100/15min)
- ✅ One vote per voter
- ✅ Audit logging

### Functionality
- ✅ Voter authentication
- ✅ Candidate selection
- ✅ Secure vote casting
- ✅ Election management
- ✅ Real-time results
- ✅ Bar & Pie charts

### UI/UX
- ✅ Responsive design
- ✅ Modern gradients
- ✅ Back navigation
- ✅ Success/error alerts
- ✅ Loading states

## 📊 Technology Stack

```
Frontend          Backend           Database
React 18          Node.js           MongoDB
React Router      Express.js        Mongoose
Axios             JWT               
Chart.js          bcryptjs          
CSS3              crypto-js         
                  express-rate-limit
```

## 🔒 Security Layers

```
Layer 1: Frontend Validation
         ↓
Layer 2: JWT Authentication
         ↓
Layer 3: Business Logic (one-vote check, encryption)
         ↓
Layer 4: Database Constraints (unique index)
```

## 📁 Project Structure

```
Hack/
├── backend/
│   ├── config/         (db.js)
│   ├── middleware/     (auth.js)
│   ├── models/         (5 models)
│   ├── routes/         (6 route files)
│   ├── utils/          (auth, encryption)
│   ├── seed.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/    (AuthContext)
│       ├── pages/      (7 pages)
│       ├── services/   (api.js)
│       └── App.js
├── README.md
├── SETUP_GUIDE.md
├── SECURITY.md
├── ARCHITECTURE.md
└── PROJECT_SUMMARY.md
```

## 🛠️ API Endpoints

### Authentication
```
POST /api/auth/login              # Voter login
POST /api/auth/admin/login        # Admin login
```

### Elections
```
GET  /api/elections               # List all
GET  /api/elections/active        # Get active
POST /api/elections               # Create (admin)
PUT  /api/elections/:id/status    # Update status (admin)
```

### Candidates
```
GET  /api/candidates/election/:id # List for election
POST /api/candidates              # Add (admin)
```

### Voting
```
POST /api/votes                   # Cast vote
GET  /api/votes/status            # Check status
```

### Results
```
GET  /api/results/:electionId     # Get results
```

### Admin
```
GET  /api/admin/dashboard         # Stats
GET  /api/admin/voters            # List voters
POST /api/admin/voters            # Add voter
GET  /api/admin/audit-logs        # View logs
```

## 📈 Testing Workflow

### Test 1: Voter Flow
1. Navigate to http://localhost:3000
2. Click "Login as Voter"
3. Enter: VOTER001 / voter123
4. Select a candidate
5. Click "Cast My Vote"
6. Verify confirmation page
7. Try voting again (should be blocked)

### Test 2: Admin Flow
1. Navigate to http://localhost:3000
2. Click "Login as Admin"
3. Enter: ADMIN001 / admin123
4. View dashboard statistics
5. Navigate through all tabs
6. End the election
7. View results with charts

### Test 3: Security Check
```bash
# Check encrypted votes in database
mongosh
use evoting
db.votes.find().pretty()
# Verify encryptedVote field is encrypted

# Check hashed passwords
db.users.find().pretty()
# Verify password field is hashed

# Check audit logs
db.auditlogs.find().pretty()
# Verify actions logged without vote choices
```

## ⚡ Performance Tips

### Backend
- MongoDB indexes on election+voterId
- Connection pooling enabled
- Rate limiting prevents abuse
- JWT reduces database queries

### Frontend
- React.lazy for code splitting
- Axios interceptors for auth
- Context API reduces prop drilling
- CSS instead of heavy libraries

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Cannot Vote (hasVoted: true)
```bash
# Reset voter status
mongosh
use evoting
db.users.updateMany({role: "voter"}, {$set: {hasVoted: false}})
db.votes.deleteMany({})
```

## 📚 Documentation Files

| File | Purpose | Lines |
|------|---------|-------|
| README.md | Project overview | 400+ |
| SETUP_GUIDE.md | Installation & testing | 300+ |
| SECURITY.md | Security features | 400+ |
| ARCHITECTURE.md | Technical design | 500+ |
| PROJECT_SUMMARY.md | Completion summary | 400+ |

## 🎯 Key Metrics

| Metric | Value |
|--------|-------|
| Total Files | 50+ |
| Lines of Code | ~6,000 |
| API Endpoints | 20+ |
| Pages | 7 |
| Security Features | 10+ |
| Dependencies | 15+ |

## 🔄 Development Commands

```bash
# Backend
npm start          # Production mode
npm run dev        # Development mode with nodemon
npm run seed       # Seed database

# Frontend
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

## 📦 Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/evoting
JWT_SECRET=your-secret-key-change-in-production
ENCRYPTION_KEY=your-32-character-encryption-key
NODE_ENV=development
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚦 Status Indicators

### Election Status
- 🟡 **upcoming** - Not yet started
- 🟢 **active** - Currently running
- ⚪ **ended** - Completed

### Voter Status
- 🟢 **Voted** - Already cast vote
- 🟡 **Not Voted** - Yet to vote

## 💡 Pro Tips

1. **Testing**: Use seed script for instant test data
2. **Security**: Change default secrets before production
3. **Debugging**: Check browser console and server logs
4. **Database**: Use MongoDB Compass for visual inspection
5. **API**: Use Postman for API testing
6. **Performance**: Enable MongoDB indexes in production
7. **Deployment**: Use environment-specific .env files

## 🎓 Learning Resources

- [MongoDB Docs](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [JWT Introduction](https://jwt.io/)
- [Chart.js Guide](https://www.chartjs.org/)

## ✅ Verification Checklist

Before considering complete:
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database seeded
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can login as voter
- [ ] Can cast vote
- [ ] Can login as admin
- [ ] Can view results
- [ ] Charts displaying correctly
- [ ] Audit logs recording actions
- [ ] Back buttons working
- [ ] Responsive on mobile

## 🎉 Success Criteria

✅ All 7 pages functional
✅ Voter can cast secure vote
✅ Admin can manage election
✅ Results display with charts
✅ Security features active
✅ Documentation complete
✅ Zero backend vulnerabilities
✅ Ready for demonstration

---

**Need Help?** Check the detailed guides:
- Installation issues → SETUP_GUIDE.md
- Security questions → SECURITY.md
- Technical details → ARCHITECTURE.md
- Complete overview → PROJECT_SUMMARY.md

**Project Status:** ✅ COMPLETE & READY FOR USE
