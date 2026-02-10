const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const User = require('../models/User');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const { encryptVote } = require('../utils/encryption');

// Cast vote
router.post('/', protect, async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    // Check if user has already voted
    if (req.user.hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Check if election is active
    const election = await Election.findById(electionId);
    if (!election || election.status !== 'active') {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if user already voted in this election
    const existingVote = await Vote.findOne({
      election: electionId,
      voterId: req.user.voterId
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Encrypt the vote
    const encryptedVote = encryptVote(candidateId);

    // Store encrypted vote
    const vote = await Vote.create({
      election: electionId,
      encryptedVote,
      voterId: req.user.voterId
    });

    // Update user's hasVoted status
    await User.findByIdAndUpdate(req.user._id, { hasVoted: true });

    // Create audit log (without revealing vote choice)
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'CAST_VOTE',
      details: `Vote cast in election: ${election.title}`,
      ipAddress: req.ip
    });

    res.status(201).json({ message: 'Vote cast successfully', voteId: vote._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user has voted
router.get('/status', protect, async (req, res) => {
  try {
    res.json({ hasVoted: req.user.hasVoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
