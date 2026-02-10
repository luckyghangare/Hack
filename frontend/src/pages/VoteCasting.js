import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './VoteCasting.css';

const VoteCasting = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'voter') {
      navigate('/voter-login');
      return;
    }

    if (user.hasVoted) {
      navigate('/vote-confirmation');
      return;
    }

    fetchElectionData();
  }, [user, navigate]);

  const fetchElectionData = async () => {
    try {
      const electionRes = await api.get('/elections/active');
      if (!electionRes.data) {
        setError('No active election at the moment');
        setLoading(false);
        return;
      }

      setElection(electionRes.data);

      const candidatesRes = await api.get(`/candidates/election/${electionRes.data._id}`);
      setCandidates(candidatesRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load election data');
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    if (window.confirm('Are you sure you want to cast your vote? This action cannot be undone.')) {
      try {
        await api.post('/votes', {
          electionId: election._id,
          candidateId: selectedCandidate
        });

        updateUser({ ...user, hasVoted: true });
        navigate('/vote-confirmation');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cast vote');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="vote-container">
        <div className="loading">Loading election data...</div>
      </div>
    );
  }

  if (error && !election) {
    return (
      <div className="vote-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="vote-container">
      <div className="vote-header">
        <h1>🗳️ Cast Your Vote</h1>
        <div className="header-actions">
          <span className="voter-info">Voter ID: {user?.voterId}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="election-info card">
        <h2>{election?.title}</h2>
        <p>{election?.description}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="candidates-section">
        <h3>Select Your Candidate</h3>
        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div
              key={candidate._id}
              className={`candidate-card ${selectedCandidate === candidate._id ? 'selected' : ''}`}
              onClick={() => setSelectedCandidate(candidate._id)}
            >
              <div className="candidate-symbol">{candidate.symbol}</div>
              <h4>{candidate.name}</h4>
              <p className="candidate-party">{candidate.party}</p>
              {candidate.description && (
                <p className="candidate-description">{candidate.description}</p>
              )}
              {selectedCandidate === candidate._id && (
                <div className="selected-badge">✓ Selected</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="vote-actions">
        <button
          className="btn btn-success btn-large"
          onClick={handleVote}
          disabled={!selectedCandidate}
        >
          Cast My Vote
        </button>
      </div>
    </div>
  );
};

export default VoteCasting;
