import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Results.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Results = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchElections();
  }, [user, navigate]);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data);
      
      // Select the first ended or active election
      const defaultElection = res.data.find(e => e.status === 'ended') || res.data.find(e => e.status === 'active');
      if (defaultElection) {
        setSelectedElection(defaultElection._id);
        fetchResults(defaultElection._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch elections');
      setLoading(false);
    }
  };

  const fetchResults = async (electionId) => {
    try {
      setLoading(true);
      const res = await api.get(`/results/${electionId}`);
      setResults(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Results not available yet');
      setLoading(false);
    }
  };

  const handleElectionChange = (electionId) => {
    setSelectedElection(electionId);
    setError('');
    fetchResults(electionId);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/vote-confirmation');
    }
  };

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  const barChartData = results ? {
    labels: results.results.map(r => r.name),
    datasets: [
      {
        label: 'Votes',
        data: results.results.map(r => r.votes),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(23, 162, 184, 1)',
        ],
        borderWidth: 2
      }
    ]
  } : null;

  const pieChartData = results ? {
    labels: results.results.map(r => r.name),
    datasets: [
      {
        data: results.results.map(r => r.votes),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
        ],
        borderColor: 'white',
        borderWidth: 2
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Election Results',
        font: {
          size: 18
        }
      }
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>📊 Election Results</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div className="election-selector">
          <label className="form-label">Select Election:</label>
          <select
            className="form-input"
            value={selectedElection || ''}
            onChange={(e) => handleElectionChange(e.target.value)}
          >
            <option value="">Choose an election</option>
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.title} - {election.status}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {results && (
          <>
            <div className="results-summary">
              <h2>{results.election.title}</h2>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">Total Votes:</span>
                  <span className="summary-value">{results.totalVotes}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Status:</span>
                  <span className={`status-badge status-${results.election.status}`}>
                    {results.election.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="results-table">
              <h3>Results Breakdown</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>Party</th>
                    <th>Symbol</th>
                    <th>Votes</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((result, index) => (
                    <tr key={result.candidateId} className={index === 0 ? 'winner-row' : ''}>
                      <td>
                        {index === 0 && '🏆 '}
                        {index + 1}
                      </td>
                      <td><strong>{result.name}</strong></td>
                      <td>{result.party}</td>
                      <td className="symbol-cell">{result.symbol}</td>
                      <td><strong>{result.votes}</strong></td>
                      <td>
                        {results.totalVotes > 0
                          ? ((result.votes / results.totalVotes) * 100).toFixed(2)
                          : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="charts-section">
              <div className="chart-container">
                <h3>Bar Chart</h3>
                <div className="chart-wrapper">
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </div>
              <div className="chart-container">
                <h3>Pie Chart</h3>
                <div className="chart-wrapper">
                  <Pie data={pieChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        )}

        {!results && !error && (
          <div className="no-results">
            <p>Please select an election to view results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
