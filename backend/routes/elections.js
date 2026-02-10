const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');

// Get all elections
router.get('/', protect, async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active election
router.get('/active', protect, async (req, res) => {
  try {
    const election = await Election.findOne({ status: 'active' });
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get election by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create election (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'CREATE_ELECTION',
      details: `Created election: ${title}`,
      ipAddress: req.ip
    });

    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update election status (Admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    election.status = status;
    await election.save();

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'UPDATE_ELECTION_STATUS',
      details: `Changed election ${election.title} status to ${status}`,
      ipAddress: req.ip
    });

    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete election (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Delete related candidates and votes
    await Candidate.deleteMany({ election: election._id });
    await Vote.deleteMany({ election: election._id });
    await Election.findByIdAndDelete(req.params.id);

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      voterId: req.user.voterId,
      action: 'DELETE_ELECTION',
      details: `Deleted election: ${election.title}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
