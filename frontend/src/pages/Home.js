import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <h1 className="home-title">🗳️ Secure E-Voting Platform</h1>
          <p className="home-subtitle">
            Empowering Democracy Through Secure Digital Voting
          </p>
        </div>

        <div className="home-cards">
          <div className="home-card voter-card">
            <div className="card-icon">👤</div>
            <h2>Voter Login</h2>
            <p>Cast your vote securely for local body elections</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/voter-login')}
            >
              Login as Voter
            </button>
          </div>

          <div className="home-card admin-card">
            <div className="card-icon">⚙️</div>
            <h2>Admin Panel</h2>
            <p>Manage elections, candidates, and view results</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/admin-login')}
            >
              Login as Admin
            </button>
          </div>
        </div>

        <div className="features">
          <h3>Key Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Encrypted Votes</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>One Vote Per Voter</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Real-time Results</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <span>Audit Logs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
