const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  wiki: { type: String },
});

const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
});

const diagnosticDataSchema = new mongoose.Schema({
  bodyPart: { type: String, required: true, unique: true },
  questions: [questionSchema],
  outcomes: { type: Map, of: [outcomeSchema] },
});

module.exports = mongoose.model('DiagnosticData', diagnosticDataSchema);