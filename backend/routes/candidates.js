const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');

// Get candidates for an election
router.get('/election/:electionId', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add candidate (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, party, symbol, election, description } = req.body;

    const candidate = await Candidate.create({
      name,
      party,
      symbol,
      election,
      description
    });

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'ADD_CANDIDATE',
      details: `Added candidate: ${name} (${party})`,
      ipAddress: req.ip
    });

    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update candidate (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, party, symbol, description } = req.body;
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    candidate.name = name || candidate.name;
    candidate.party = party || candidate.party;
    candidate.symbol = symbol || candidate.symbol;
    candidate.description = description || candidate.description;

    await candidate.save();

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'UPDATE_CANDIDATE',
      details: `Updated candidate: ${candidate.name}`,
      ipAddress: req.ip
    });

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete candidate (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await Candidate.findByIdAndDelete(req.params.id);

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'DELETE_CANDIDATE',
      details: `Deleted candidate: ${candidate.name}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
