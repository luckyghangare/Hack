const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../utils/auth');

// Voter Login
router.post('/login', async (req, res) => {
  try {
    const { voterId, password } = req.body;

    const user = await User.findOne({ voterId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create audit log
    await AuditLog.create({
      userId: user._id,
      voterId: user.voterId,
      action: 'LOGIN',
      details: `${user.role} logged in`,
      ipAddress: req.ip
    });

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: {
        id: user._id,
        voterId: user.voterId,
        name: user.name,
        role: user.role,
        hasVoted: user.hasVoted
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { voterId, password } = req.body;

    const user = await User.findOne({ voterId, role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Create audit log
    await AuditLog.create({
      userId: user._id,
      voterId: user.voterId,
      action: 'ADMIN_LOGIN',
      details: 'Admin logged in',
      ipAddress: req.ip
    });

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: {
        id: user._id,
        voterId: user.voterId,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
