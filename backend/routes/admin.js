const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { protect, admin } = require('../middleware/auth');

// Get dashboard stats
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const votedCount = await User.countDocuments({ role: 'voter', hasVoted: true });
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });

    res.json({
      totalVoters,
      votedCount,
      pendingVoters: totalVoters - votedCount,
      totalElections,
      activeElections
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all voters
router.get('/voters', protect, admin, async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' }).select('-password');
    res.json(voters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add voter
router.post('/voters', protect, admin, async (req, res) => {
  try {
    const { voterId, name, password } = req.body;

    // Check if voter already exists
    const existingVoter = await User.findOne({ voterId });
    if (existingVoter) {
      return res.status(400).json({ message: 'Voter ID already exists' });
    }

    const voter = await User.create({
      voterId,
      name,
      password,
      role: 'voter'
    });

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'ADD_VOTER',
      details: `Added voter: ${voterId} (${name})`,
      ipAddress: req.ip
    });

    res.status(201).json({
      id: voter._id,
      voterId: voter.voterId,
      name: voter.name,
      role: voter.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete voter
router.delete('/voters/:id', protect, admin, async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'DELETE_VOTER',
      details: `Deleted voter: ${voter.voterId}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audit logs
router.get('/audit-logs', protect, admin, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name voterId')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset election (for testing)
router.post('/reset-election/:electionId', protect, admin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Delete all votes for this election
    await Vote.deleteMany({ election: req.params.electionId });

    // Reset all voters' hasVoted status
    await User.updateMany({ role: 'voter' }, { hasVoted: false });

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'RESET_ELECTION',
      details: `Reset election: ${election.title}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Election reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
