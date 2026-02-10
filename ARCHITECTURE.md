# E-Voting Platform Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Home    │  │  Voter   │  │  Admin   │  │ Results  │   │
│  │  Page    │  │  Portal  │  │  Panel   │  │  Page    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘          │
│                         │                                     │
│                    React Router                               │
│                         │                                     │
│                  Auth Context                                 │
│                         │                                     │
│                    Axios (API)                                │
└─────────────────────────┴─────────────────────────────────────┘
                          │
                     HTTP/HTTPS
                          │
┌─────────────────────────┴─────────────────────────────────────┐
│                    Backend (Express.js)                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              API Routes Layer                         │    │
│  │  /auth  /elections  /candidates  /votes  /results    │    │
│  │                    /admin                             │    │
│  └────────────────────┬──────────────────────────────────┘    │
│                       │                                        │
│  ┌────────────────────┴──────────────────────────────────┐   │
│  │           Middleware Layer                             │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │   │   CORS   │  │   Auth   │  │  Admin   │           │   │
│  │   │  Verify  │  │  Verify  │  │  Verify  │           │   │
│  │   └──────────┘  └──────────┘  └──────────┘           │   │
│  └────────────────────┬──────────────────────────────────┘   │
│                       │                                        │
│  ┌────────────────────┴──────────────────────────────────┐   │
│  │            Business Logic Layer                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  Vote    │  │  Audit   │  │  Result  │            │   │
│  │  │  Encrypt │  │  Logger  │  │  Counter │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘            │   │
│  └────────────────────┬──────────────────────────────────┘   │
│                       │                                        │
│  ┌────────────────────┴──────────────────────────────────┐   │
│  │              Data Models (Mongoose)                    │   │
│  │   User │ Election │ Candidate │ Vote │ AuditLog      │   │
│  └────────────────────┬──────────────────────────────────┘   │
└─────────────────────────┴─────────────────────────────────────┘
                          │
                     MongoDB Driver
                          │
┌─────────────────────────┴─────────────────────────────────────┐
│                     MongoDB Database                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  users   │  │elections │  │candidates│  │  votes   │     │
│  │collection│  │collection│  │collection│  │collection│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐                                                 │
│  │auditlogs │                                                 │
│  │collection│                                                 │
│  └──────────┘                                                 │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Voter Authentication Flow
```
┌──────┐     Login Request      ┌────────┐
│Voter │ ───────────────────────>│Backend │
└──────┘     (voterId, pwd)      └────┬───┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Verify User   │
                              │ Check Password│
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Generate JWT  │
                              │ Create Audit  │
                              └───────┬───────┘
                                      │
┌──────┐     JWT Token         ┌─────┴───┐
│Voter │ <─────────────────────│Backend  │
└──────┘     + User Data        └─────────┘
```

### Vote Casting Flow
```
┌──────┐     Cast Vote          ┌────────┐
│Voter │ ───────────────────────>│Backend │
└──────┘  (electionId,candidate) └────┬───┘
          + JWT Token                  │
                                       ▼
                              ┌────────────────┐
                              │ Verify JWT     │
                              │ Check hasVoted │
                              └────────┬───────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │ Encrypt Vote   │
                              │ (AES-256)      │
                              └────────┬───────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │ Store to DB    │
                              │ Update User    │
                              │ Create Audit   │
                              └────────┬───────┘
                                       │
┌──────┐     Success            ┌─────┴───┐
│Voter │ <─────────────────────│Backend  │
└──────┘     Confirmation        └─────────┘
```

### Results Calculation Flow
```
┌──────┐     Get Results        ┌────────┐
│Admin │ ───────────────────────>│Backend │
└──────┘     (electionId)        └────┬───┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Verify Admin  │
                              │ Check Status  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Fetch Votes   │
                              │ (encrypted)   │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Decrypt Votes │
                              │ Count by ID   │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Join with     │
                              │ Candidates    │
                              └───────┬───────┘
                                      │
┌──────┐     Results Data      ┌─────┴───┐
│Admin │ <─────────────────────│Backend  │
└──────┘     + Statistics       └─────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layer 1                       │
│                  Frontend Validation                     │
│  • Form Validation                                       │
│  • Route Protection (React Router)                       │
│  • Token Storage (localStorage)                          │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                   Security Layer 2                       │
│                  Authentication (JWT)                    │
│  • Token Verification                                    │
│  • User Session Management                               │
│  • Role-based Access Control                             │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                   Security Layer 3                       │
│                  Business Logic                          │
│  • One Vote Per Voter Check                              │
│  • Election Status Validation                            │
│  • Vote Encryption (AES)                                 │
│  • Audit Logging                                         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                   Security Layer 4                       │
│                  Data Persistence                        │
│  • Password Hashing (bcrypt)                             │
│  • Encrypted Vote Storage                                │
│  • Database Constraints                                  │
│  • Index Enforcement                                     │
└─────────────────────────────────────────────────────────┘
```

## Component Structure

### Frontend Components
```
src/
├── components/           # Reusable components
├── context/
│   └── AuthContext.js   # Global authentication state
├── pages/
│   ├── Home.js          # Landing page
│   ├── VoterLogin.js    # Voter authentication
│   ├── VoteCasting.js   # Vote selection interface
│   ├── VoteConfirmation.js  # Success confirmation
│   ├── AdminLogin.js    # Admin authentication
│   ├── AdminDashboard.js    # Admin control panel
│   └── Results.js       # Results with charts
├── services/
│   └── api.js           # API client configuration
├── App.js               # Main application router
└── index.js             # Application entry point
```

### Backend Structure
```
backend/
├── config/
│   └── db.js            # Database connection
├── middleware/
│   └── auth.js          # Authentication middleware
├── models/
│   ├── User.js          # User/Voter/Admin model
│   ├── Election.js      # Election model
│   ├── Candidate.js     # Candidate model
│   ├── Vote.js          # Encrypted vote model
│   └── AuditLog.js      # Audit trail model
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── elections.js     # Election management
│   ├── candidates.js    # Candidate management
│   ├── votes.js         # Voting endpoints
│   ├── results.js       # Results calculation
│   └── admin.js         # Admin operations
├── utils/
│   ├── auth.js          # JWT utilities
│   └── encryption.js    # Vote encryption/decryption
├── seed.js              # Database seeding script
└── server.js            # Express server setup
```

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "voterId": "String (unique)",
  "name": "String",
  "password": "String (hashed)",
  "role": "String (voter|admin)",
  "hasVoted": "Boolean",
  "createdAt": "Date"
}
```

### Elections Collection
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "startDate": "Date",
  "endDate": "Date",
  "status": "String (upcoming|active|ended)",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date"
}
```

### Candidates Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "party": "String",
  "symbol": "String (emoji)",
  "election": "ObjectId (ref: Election)",
  "description": "String",
  "createdAt": "Date"
}
```

### Votes Collection
```json
{
  "_id": "ObjectId",
  "election": "ObjectId (ref: Election)",
  "encryptedVote": "String (AES encrypted candidate ID)",
  "voterId": "String",
  "timestamp": "Date",
  "indexes": [
    { "election": 1, "voterId": 1 } // Unique compound index
  ]
}
```

### AuditLogs Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "voterId": "String",
  "action": "String",
  "details": "String",
  "ipAddress": "String",
  "timestamp": "Date"
}
```

## API Endpoints

### Authentication APIs
- `POST /api/auth/login` - Voter login
- `POST /api/auth/admin/login` - Admin login

### Election APIs
- `GET /api/elections` - List all elections
- `GET /api/elections/active` - Get active election
- `GET /api/elections/:id` - Get election by ID
- `POST /api/elections` - Create election (admin)
- `PUT /api/elections/:id/status` - Update status (admin)
- `DELETE /api/elections/:id` - Delete election (admin)

### Candidate APIs
- `GET /api/candidates/election/:electionId` - List candidates
- `POST /api/candidates` - Add candidate (admin)
- `PUT /api/candidates/:id` - Update candidate (admin)
- `DELETE /api/candidates/:id` - Delete candidate (admin)

### Voting APIs
- `POST /api/votes` - Cast vote
- `GET /api/votes/status` - Check vote status

### Results APIs
- `GET /api/results/:electionId` - Get election results

### Admin APIs
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/voters` - List all voters
- `POST /api/admin/voters` - Add voter
- `DELETE /api/admin/voters/:id` - Delete voter
- `GET /api/admin/audit-logs` - Get audit logs
- `POST /api/admin/reset-election/:electionId` - Reset election

## Technology Stack

### Frontend
- **React 18**: UI library
- **React Router 6**: Client-side routing
- **Axios**: HTTP client
- **Chart.js + react-chartjs-2**: Data visualization
- **CSS3**: Styling with gradients and animations

### Backend
- **Node.js**: JavaScript runtime
- **Express.js 5**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **crypto-js**: AES encryption for votes
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                      (nginx)                             │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼───────┐
│  Frontend      │         │   Backend API  │
│  (React Build) │         │   (Node.js)    │
│  Static Files  │         │   Express App  │
└────────────────┘         └────────┬───────┘
                                    │
                           ┌────────▼───────┐
                           │    MongoDB     │
                           │   Replica Set  │
                           └────────────────┘
```

## Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization
- Minification and bundling
- Caching strategies
- CDN for static assets

### Backend Optimization
- Database indexing
- Query optimization
- Connection pooling
- Caching with Redis (future)
- Horizontal scaling capability

### Database Optimization
- Compound indexes for queries
- Proper schema design
- Regular maintenance
- Replication for high availability
- Sharding for large-scale deployments

## Monitoring and Logging

### Application Monitoring
- Server health checks
- API response times
- Error rates
- Database performance
- User activity metrics

### Security Monitoring
- Failed login attempts
- Unauthorized access attempts
- Unusual voting patterns
- Database access logs
- System resource usage

## Disaster Recovery

### Backup Strategy
- Daily database backups
- Transaction log backups
- Application code versioning
- Configuration backups
- Disaster recovery testing

### Recovery Procedures
- Database restore process
- Application rollback
- Failover procedures
- Data integrity verification
- Communication protocols
