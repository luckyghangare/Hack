import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import VoterLogin from './pages/VoterLogin';
import VoteCasting from './pages/VoteCasting';
import VoteConfirmation from './pages/VoteConfirmation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/voter-login" element={<VoterLogin />} />
            <Route path="/vote" element={<VoteCasting />} />
            <Route path="/vote-confirmation" element={<VoteConfirmation />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
