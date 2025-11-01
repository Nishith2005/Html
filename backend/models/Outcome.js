const mongoose = require('mongoose');

const OutcomeSchema = new mongoose.Schema({
  bodyPart: {
    type: String,
    required: true
  },
  responseKey: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true
  },
  wiki: {
    type: String
  }
});

OutcomeSchema.index({ bodyPart: 1, responseKey: 1 }, { unique: true });

module.exports = mongoose.model('Outcome', OutcomeSchema);