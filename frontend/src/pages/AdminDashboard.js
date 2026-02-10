import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [electionForm, setElectionForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [candidateForm, setCandidateForm] = useState({
    name: '',
    party: '',
    symbol: '',
    description: '',
    election: ''
  });

  const [voterForm, setVoterForm] = useState({
    voterId: '',
    name: '',
    password: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [user, navigate, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'dashboard') {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } else if (activeTab === 'elections') {
        const res = await api.get('/elections');
        setElections(res.data);
      } else if (activeTab === 'candidates') {
        const [electionsRes, candidatesRes] = await Promise.all([
          api.get('/elections'),
          api.get('/elections').then(async (res) => {
            if (res.data.length > 0) {
              return api.get(`/candidates/election/${res.data[0]._id}`);
            }
            return { data: [] };
          })
        ]);
        setElections(electionsRes.data);
        setCandidates(candidatesRes.data);
      } else if (activeTab === 'voters') {
        const res = await api.get('/admin/voters');
        setVoters(res.data);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/audit-logs');
        setAuditLogs(res.data);
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/elections', electionForm);
      setSuccess('Election created successfully');
      setElectionForm({ title: '', description: '', startDate: '', endDate: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create election');
    }
  };

  const handleUpdateElectionStatus = async (electionId, status) => {
    try {
      await api.put(`/elections/${electionId}/status`, { status });
      setSuccess(`Election status updated to ${status}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update election status');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/candidates', candidateForm);
      setSuccess('Candidate added successfully');
      setCandidateForm({ name: '', party: '', symbol: '', description: '', election: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleAddVoter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/voters', voterForm);
      setSuccess('Voter added successfully');
      setVoterForm({ voterId: '', name: '', password: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add voter');
    }
  };

  const handleDeleteVoter = async (voterId) => {
    if (window.confirm('Are you sure you want to delete this voter?')) {
      try {
        await api.delete(`/admin/voters/${voterId}`);
        setSuccess('Voter deleted successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete voter');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderDashboard = () => (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-details">
          <h3>Total Voters</h3>
          <p className="stat-value">{stats.totalVoters || 0}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-details">
          <h3>Voted</h3>
          <p className="stat-value">{stats.votedCount || 0}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⏳</div>
        <div className="stat-details">
          <h3>Pending</h3>
          <p className="stat-value">{stats.pendingVoters || 0}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🗳️</div>
        <div className="stat-details">
          <h3>Total Elections</h3>
          <p className="stat-value">{stats.totalElections || 0}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🔴</div>
        <div className="stat-details">
          <h3>Active Elections</h3>
          <p className="stat-value">{stats.activeElections || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderElections = () => (
    <div className="admin-section">
      <h2>Create New Election</h2>
      <form onSubmit={handleCreateElection} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Election Title</label>
            <input
              type="text"
              className="form-input"
              value={electionForm.title}
              onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={electionForm.description}
              onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="datetime-local"
              className="form-input"
              value={electionForm.startDate}
              onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="datetime-local"
              className="form-input"
              value={electionForm.endDate}
              onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Create Election</button>
      </form>

      <h2 style={{ marginTop: '40px' }}>Manage Elections</h2>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.map((election) => (
              <tr key={election._id}>
                <td>{election.title}</td>
                <td>{election.description}</td>
                <td>{new Date(election.startDate).toLocaleString()}</td>
                <td>{new Date(election.endDate).toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${election.status}`}>
                    {election.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {election.status === 'upcoming' && (
                      <button
                        className="btn-small btn-success"
                        onClick={() => handleUpdateElectionStatus(election._id, 'active')}
                      >
                        Start
                      </button>
                    )}
                    {election.status === 'active' && (
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleUpdateElectionStatus(election._id, 'ended')}
                      >
                        End
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="admin-section">
      <h2>Add Candidate</h2>
      <form onSubmit={handleAddCandidate} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Candidate Name</label>
            <input
              type="text"
              className="form-input"
              value={candidateForm.name}
              onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Party</label>
            <input
              type="text"
              className="form-input"
              value={candidateForm.party}
              onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Symbol (Emoji)</label>
            <input
              type="text"
              className="form-input"
              value={candidateForm.symbol}
              onChange={(e) => setCandidateForm({ ...candidateForm, symbol: e.target.value })}
              placeholder="e.g., 🌟, 🦁, 🌺"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Election</label>
            <select
              className="form-input"
              value={candidateForm.election}
              onChange={(e) => setCandidateForm({ ...candidateForm, election: e.target.value })}
              required
            >
              <option value="">Select Election</option>
              {elections.map((election) => (
                <option key={election._id} value={election._id}>
                  {election.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-input"
            value={candidateForm.description}
            onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
            rows="3"
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Candidate</button>
      </form>

      <h2 style={{ marginTop: '40px' }}>Candidates List</h2>
      <div className="candidates-list">
        {candidates.map((candidate) => (
          <div key={candidate._id} className="candidate-item">
            <div className="candidate-symbol-large">{candidate.symbol}</div>
            <div className="candidate-info">
              <h3>{candidate.name}</h3>
              <p className="candidate-party">{candidate.party}</p>
              {candidate.description && <p>{candidate.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVoters = () => (
    <div className="admin-section">
      <h2>Add Voter</h2>
      <form onSubmit={handleAddVoter} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Voter ID</label>
            <input
              type="text"
              className="form-input"
              value={voterForm.voterId}
              onChange={(e) => setVoterForm({ ...voterForm, voterId: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={voterForm.name}
              onChange={(e) => setVoterForm({ ...voterForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={voterForm.password}
              onChange={(e) => setVoterForm({ ...voterForm, password: e.target.value })}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Add Voter</button>
      </form>

      <h2 style={{ marginTop: '40px' }}>Voters List</h2>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Voter ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {voters.map((voter) => (
              <tr key={voter._id}>
                <td>{voter.voterId}</td>
                <td>{voter.name}</td>
                <td>
                  <span className={`status-badge ${voter.hasVoted ? 'status-voted' : 'status-pending'}`}>
                    {voter.hasVoted ? 'Voted' : 'Not Voted'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDeleteVoter(voter._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="admin-section">
      <h2>Audit Logs</h2>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Voter ID</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.voterId}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <div className="header-actions">
          <span className="admin-info">Admin: {user?.name}</span>
          <button className="btn btn-secondary" onClick={() => navigate('/results')}>
            View Results
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-content">
        <div className="admin-sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'elections' ? 'active' : ''}`}
            onClick={() => setActiveTab('elections')}
          >
            🗳️ Elections
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            👤 Candidates
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'voters' ? 'active' : ''}`}
            onClick={() => setActiveTab('voters')}
          >
            👥 Voters
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📝 Audit Logs
          </button>
        </div>

        <div className="admin-main">
          <div className="card">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'elections' && renderElections()}
                {activeTab === 'candidates' && renderCandidates()}
                {activeTab === 'voters' && renderVoters()}
                {activeTab === 'logs' && renderAuditLogs()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
