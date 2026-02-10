const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  encryptedVote: {
    type: String,
    required: true
  },
  voterId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

voteSchema.index({ election: 1, voterId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
