# Setup and Testing Guide

## Quick Setup

### Prerequisites Installation

1. **Install MongoDB** (if not already installed)
   
   For Ubuntu/Debian:
   ```bash
   # Import MongoDB public GPG key
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   
   # Add MongoDB repository
   echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   
   # Install MongoDB
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```
   
   For macOS:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```
   
   For Windows:
   - Download MongoDB Community Server from https://www.mongodb.com/try/download/community
   - Run the installer and follow the setup wizard
   - MongoDB will start automatically as a Windows service

2. **Install Node.js** (v14 or higher)
   - Download from https://nodejs.org/
   - Or use nvm: `nvm install --lts`

### Step-by-Step Setup

1. **Clone and Navigate**
   ```bash
   cd Hack
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # The .env file is already created with default values
   # Edit if you need to change MongoDB URI or ports
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Seed the Database**
   ```bash
   cd ../backend
   npm run seed
   ```
   
   This will create:
   - 1 Admin user: `ADMIN001` / `admin123`
   - 10 Voters: `VOTER001` to `VOTER010` / `voter123`
   - 1 Active election with 5 candidates

5. **Start the Application**
   
   Open two terminal windows:
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will open in browser at http://localhost:3000

## Testing Scenarios

### Test 1: Voter Flow

1. Go to http://localhost:3000
2. Click "Login as Voter"
3. Login with `VOTER001` / `voter123`
4. View the active election and candidates
5. Select a candidate
6. Click "Cast My Vote"
7. Confirm the vote
8. See the success confirmation page
9. Try to vote again - should be prevented
10. View results (will show error if election hasn't ended)

### Test 2: Admin Flow

1. Go to http://localhost:3000
2. Click "Login as Admin"
3. Login with `ADMIN001` / `admin123`
4. View Dashboard statistics
5. Navigate to Elections tab
6. View the active election
7. Create a new election (optional)
8. Navigate to Candidates tab
9. Add a new candidate (optional)
10. Navigate to Voters tab
11. View registered voters and their voting status
12. Navigate to Audit Logs tab
13. View all logged actions
14. End the election (change status to "ended")
15. View Results with charts and graphs

### Test 3: Security Verification

1. **Vote Encryption Test**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Switch to evoting database
   use evoting
   
   # View encrypted votes
   db.votes.find().pretty()
   ```
   You should see the `encryptedVote` field contains encrypted data, not plain candidate IDs.

2. **One Vote Per Voter Test**
   - Login as VOTER002
   - Cast a vote
   - Try to access /vote again - should redirect to confirmation
   - Try to submit another vote via API - should fail

3. **Authentication Test**
   - Try to access http://localhost:3000/vote without logging in
   - Try to access http://localhost:3000/admin/dashboard without logging in
   - Both should redirect to login pages

4. **Audit Logs Test**
   - Login as admin
   - View audit logs
   - Verify that all actions are logged:
     - Login events
     - Vote cast events (without vote choice)
     - Admin actions (create election, add candidate, etc.)

### Test 4: Results Dashboard

1. Login as admin
2. End the active election (change status to "ended")
3. Click "View Results" button
4. Verify:
   - Total vote count is correct
   - Each candidate's vote count is displayed
   - Bar chart shows correct data
   - Pie chart shows correct distribution
   - Winner is highlighted (top row in gold)

### Test 5: Multiple Elections

1. Login as admin
2. Create a new election with future dates
3. Add candidates to the new election
4. Start the new election (change status to "active")
5. Reset voter status if needed using the reset endpoint
6. Have voters cast votes in the new election
7. End election and view results

## API Testing with curl

### Voter Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"voterId":"VOTER001","password":"voter123"}'
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"voterId":"ADMIN001","password":"admin123"}'
```

### Get Active Election (requires token)
```bash
TOKEN="your-jwt-token-here"
curl -X GET http://localhost:5000/api/elections/active \
  -H "Authorization: Bearer $TOKEN"
```

### Cast Vote (requires token)
```bash
TOKEN="your-jwt-token-here"
ELECTION_ID="election-id-here"
CANDIDATE_ID="candidate-id-here"

curl -X POST http://localhost:5000/api/votes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"electionId":"'$ELECTION_ID'","candidateId":"'$CANDIDATE_ID'"}'
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check MongoDB URI in backend/.env
- Try connecting manually: `mongosh`

### Port Already in Use
- Backend (5000): Change PORT in backend/.env
- Frontend (3000): It will prompt to use a different port

### npm install fails
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json
- Run `npm install` again

### Frontend doesn't connect to backend
- Verify backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env
- Check browser console for CORS errors

### Votes not being encrypted
- Verify ENCRYPTION_KEY is set in backend/.env
- Check backend logs for encryption errors
- Ensure crypto-js is installed

## Performance Testing

### Load Testing Script
```bash
# Install artillery (load testing tool)
npm install -g artillery

# Create test config
cat > artillery-test.yml << EOF
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Login and vote"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            voterId: "VOTER001"
            password: "voter123"
EOF

# Run load test
artillery run artillery-test.yml
```

## Production Deployment Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Change ENCRYPTION_KEY to a strong 32-character key
- [ ] Use environment-specific MongoDB URI
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Add rate limiting
- [ ] Set up database backups
- [ ] Configure logging service
- [ ] Set up monitoring (CPU, memory, database)
- [ ] Add error tracking (e.g., Sentry)
- [ ] Review and harden security settings
- [ ] Perform security audit
- [ ] Load test the application
- [ ] Set up CI/CD pipeline
- [ ] Document disaster recovery procedures

## Additional Features to Consider

1. **OTP Authentication**: Integrate SMS/Email OTP for additional security
2. **Face Recognition**: Add biometric verification
3. **Blockchain**: Store vote hashes on blockchain for immutability
4. **Multi-language Support**: Add i18n for regional languages
5. **Accessibility**: Improve for screen readers and keyboard navigation
6. **PDF Reports**: Generate PDF reports of results
7. **Email Notifications**: Send confirmation emails after voting
8. **Two-Factor Authentication**: Add 2FA for admin accounts
9. **API Rate Limiting**: Prevent brute force attacks
10. **Comprehensive Testing**: Add unit, integration, and e2e tests
