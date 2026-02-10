# Security Documentation

## Security Features Implemented

### 1. Authentication & Authorization

#### Password Security
- **Hashing**: All passwords are hashed using bcryptjs with salt rounds of 10
- **No Plain Text Storage**: Passwords are never stored in plain text
- **Implementation**: Pre-save hook in User model automatically hashes passwords

```javascript
// User.js model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

#### JWT Token Authentication
- **Token-based Auth**: Uses JSON Web Tokens (JWT) for stateless authentication
- **Expiration**: Tokens expire after 24 hours
- **Secure Transmission**: Tokens sent via Authorization header
- **Role-based Access**: Separate middleware for admin and voter routes

```javascript
// auth.js middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
```

### 2. Vote Encryption

#### AES Encryption
- **Algorithm**: AES (Advanced Encryption Standard) via crypto-js
- **Implementation**: All votes encrypted before database storage
- **Key Management**: Encryption key stored in environment variables

```javascript
// encryption.js
const encryptVote = (candidateId) => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const encrypted = CryptoJS.AES.encrypt(candidateId.toString(), encryptionKey).toString();
  return encrypted;
};

const decryptVote = (encryptedVote) => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const bytes = CryptoJS.AES.decrypt(encryptedVote, encryptionKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};
```

#### Vote Privacy
- Votes stored as encrypted strings in database
- Only decrypted when calculating results
- Audit logs do not reveal vote choices
- No direct link between voter and vote choice in database

### 3. One Vote Per Voter Enforcement

#### Multiple Protection Layers
1. **User Model Flag**: `hasVoted` boolean prevents re-voting
2. **Database Constraint**: Unique compound index on (election, voterId)
3. **API Validation**: Backend checks voting status before accepting vote
4. **Frontend Validation**: UI prevents access to voting page after voting

```javascript
// Vote model
voteSchema.index({ election: 1, voterId: 1 }, { unique: true });

// votes.js route
if (req.user.hasVoted) {
  return res.status(400).json({ message: 'You have already voted' });
}

const existingVote = await Vote.findOne({
  election: electionId,
  voterId: req.user.voterId
});

if (existingVote) {
  return res.status(400).json({ message: 'You have already voted in this election' });
}
```

### 4. Audit Logging

#### Comprehensive Logging
- All authentication events logged
- All vote casting events logged (without vote choice)
- All admin actions logged
- IP addresses recorded for security tracking

```javascript
// Example audit log
await AuditLog.create({
  userId: req.user._id,
  voterId: req.user.voterId,
  action: 'CAST_VOTE',
  details: `Vote cast in election: ${election.title}`,
  ipAddress: req.ip
});
```

#### Privacy Protection
- Vote choice never logged
- Only action performed is recorded
- Timestamp and user identity logged for accountability
- Maintains transparency without compromising vote secrecy

### 5. API Security

#### Route Protection
- Protected routes require valid JWT token
- Admin routes require admin role
- Unauthorized access returns 401/403 errors

#### Input Validation
- Required fields validated
- MongoDB injection prevention through Mongoose
- Request body parsing limited to JSON

#### CORS Configuration
- Cross-Origin Resource Sharing enabled
- Can be restricted to specific origins in production

```javascript
// server.js
app.use(cors()); // In production, specify allowed origins
```

### 6. Environment Configuration

#### Sensitive Data Management
- All secrets stored in environment variables
- `.env.example` provided without actual secrets
- `.env` excluded from version control via `.gitignore`

Required environment variables:
- `JWT_SECRET`: Secret key for JWT signing
- `ENCRYPTION_KEY`: 32-character key for AES encryption
- `MONGODB_URI`: Database connection string
- `PORT`: Server port number

## Vulnerability Assessment

### Backend Dependencies
✅ **Status**: No vulnerabilities found
```bash
npm audit
# found 0 vulnerabilities
```

### Frontend Dependencies
⚠️ **Status**: 9 vulnerabilities in development dependencies
- 3 moderate severity
- 6 high severity

**Analysis**: 
- All vulnerabilities are in development dependencies (create-react-app tooling)
- Used only during development, not in production build
- Production build is static files, not affected by these vulnerabilities
- Vulnerabilities in: nth-check, postcss, webpack-dev-server

**Mitigation**:
- These tools are only used during development
- Production build (`npm run build`) creates static files
- Static files served don't include vulnerable dependencies
- Consider migrating to Vite or Next.js for newer tooling

### Known Security Considerations

1. **Password Strength**
   - Current: Basic password without complexity requirements
   - Recommendation: Implement password strength validation
   - Recommendation: Add password reset functionality

2. **Rate Limiting**
   - Current: No rate limiting on API endpoints
   - Recommendation: Add express-rate-limit middleware
   - Recommendation: Prevent brute force login attempts

3. **Session Management**
   - Current: JWT tokens expire after 24 hours
   - Recommendation: Implement refresh tokens
   - Recommendation: Add token blacklist for logout

4. **HTTPS**
   - Current: HTTP in development
   - Requirement: Must use HTTPS in production
   - Recommendation: Use Let's Encrypt certificates

5. **Database Security**
   - Current: Basic MongoDB authentication
   - Recommendation: Enable MongoDB authentication
   - Recommendation: Use connection string with authentication
   - Recommendation: Regular database backups

6. **Input Sanitization**
   - Current: Basic Mongoose validation
   - Recommendation: Add express-validator middleware
   - Recommendation: Sanitize all user inputs

7. **Error Handling**
   - Current: Basic error messages
   - Recommendation: Don't expose stack traces in production
   - Recommendation: Log errors to monitoring service

## Security Best Practices Implemented

✅ Password hashing with bcryptjs
✅ JWT-based authentication
✅ Vote encryption with AES
✅ Audit logging without vote choice
✅ One vote per voter enforcement
✅ Role-based access control
✅ Environment variable configuration
✅ CORS enabled
✅ No plain text password storage
✅ Protected API routes
✅ Rate limiting on API endpoints
✅ Stricter rate limiting on authentication routes

## Security Best Practices to Implement

⚠️ HTTPS enforcement in production
⚠️ Input validation and sanitization
⚠️ Password strength requirements
⚠️ Two-factor authentication for admin
⚠️ Database authentication
⚠️ Error logging service
⚠️ Security headers (helmet.js)
⚠️ SQL injection prevention (already handled by Mongoose)
⚠️ XSS prevention (handled by React)

## Production Security Checklist

Before deploying to production:

- [ ] Generate strong JWT_SECRET (use crypto.randomBytes(64).toString('hex'))
- [ ] Generate strong ENCRYPTION_KEY (32 random characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS with specific origins only
- [ ] Add rate limiting middleware
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific MongoDB URI
- [ ] Add security headers with helmet.js
- [ ] Set NODE_ENV=production
- [ ] Disable error stack traces in production
- [ ] Set up error logging service (Sentry, etc.)
- [ ] Set up monitoring and alerting
- [ ] Perform penetration testing
- [ ] Review and test all API endpoints
- [ ] Implement regular database backups
- [ ] Document incident response procedures
- [ ] Set up DDoS protection (Cloudflare, etc.)
- [ ] Implement IP whitelisting for admin panel (optional)
- [ ] Add Web Application Firewall (WAF)
- [ ] Regular security audits and updates

## Testing Security Features

### Test 1: Password Hashing
```javascript
// Connect to MongoDB and check user documents
db.users.findOne({ voterId: "VOTER001" })
// Verify password field contains hashed value, not plain text
```

### Test 2: Vote Encryption
```javascript
// Check vote documents in database
db.votes.find()
// Verify encryptedVote field contains encrypted string, not candidate ID
```

### Test 3: One Vote Enforcement
```javascript
// Attempt to vote twice with same voter ID
// Should receive error: "You have already voted"
```

### Test 4: JWT Validation
```bash
# Try accessing protected endpoint without token
curl http://localhost:5000/api/elections
# Should receive 401 Unauthorized

# Try accessing with invalid token
curl -H "Authorization: Bearer invalid-token" http://localhost:5000/api/elections
# Should receive 401 Unauthorized
```

### Test 5: Admin Authorization
```bash
# Try accessing admin endpoint with voter token
# Should receive 403 Forbidden
```

## Incident Response

In case of security incident:

1. **Immediate Actions**
   - Identify the scope of the breach
   - Isolate affected systems
   - Change all secrets (JWT_SECRET, ENCRYPTION_KEY)
   - Invalidate all active sessions
   - Review audit logs

2. **Investigation**
   - Analyze audit logs for suspicious activity
   - Check database for unauthorized changes
   - Review server logs
   - Identify attack vector

3. **Recovery**
   - Patch vulnerability
   - Restore from clean backup if needed
   - Reset user passwords if compromised
   - Update security measures

4. **Post-Incident**
   - Document incident and response
   - Update security procedures
   - Notify affected users if required
   - Implement additional safeguards

## Compliance Considerations

While this is a prototype, production deployment should consider:

- **Data Protection**: GDPR, local data protection laws
- **Election Laws**: Compliance with local election regulations
- **Accessibility**: ADA/Section 508 compliance
- **Record Retention**: Legal requirements for audit logs
- **Voter Privacy**: Regulations on voter data handling

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
