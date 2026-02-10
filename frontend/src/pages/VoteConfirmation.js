import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './VoteConfirmation.css';

const VoteConfirmation = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewResults = () => {
    navigate('/results');
  };

  if (!user) {
    navigate('/voter-login');
    return null;
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h1>Vote Cast Successfully!</h1>
        <p className="confirmation-message">
          Thank you for participating in the democratic process. Your vote has been
          securely recorded and encrypted.
        </p>

        <div className="confirmation-details">
          <div className="detail-item">
            <span className="detail-label">Voter ID:</span>
            <span className="detail-value">{user.voterId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-voted">Voted</span>
          </div>
        </div>

        <div className="confirmation-info">
          <h3>Important Information:</h3>
          <ul>
            <li>Your vote has been encrypted and securely stored</li>
            <li>You cannot vote again in this election</li>
            <li>Results will be displayed after the election ends</li>
            <li>Your vote choice remains confidential</li>
          </ul>
        </div>

        <div className="confirmation-actions">
          <button className="btn btn-primary" onClick={handleViewResults}>
            View Results
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteConfirmation;
