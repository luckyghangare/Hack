const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { protect, admin } = require('../middleware/auth');
const { decryptVote } = require('../utils/encryption');

// Get results for an election
router.get('/:electionId', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Only show results if election has ended or user is admin
    if (election.status !== 'ended' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Results not available yet' });
    }

    // Get all votes for this election
    const votes = await Vote.find({ election: req.params.electionId });

    // Decrypt and count votes
    const voteCounts = {};
    votes.forEach(vote => {
      try {
        const candidateId = decryptVote(vote.encryptedVote);
        voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
      } catch (error) {
        console.error('Error decrypting vote:', error);
      }
    });

    // Get candidate details and combine with vote counts
    const candidates = await Candidate.find({ election: req.params.electionId });
    const results = candidates.map(candidate => ({
      candidateId: candidate._id,
      name: candidate.name,
      party: candidate.party,
      symbol: candidate.symbol,
      votes: voteCounts[candidate._id.toString()] || 0
    }));

    // Sort by votes in descending order
    results.sort((a, b) => b.votes - a.votes);

    res.json({
      election: {
        id: election._id,
        title: election.title,
        status: election.status
      },
      totalVotes: votes.length,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
