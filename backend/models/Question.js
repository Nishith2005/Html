const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
  },
  order: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
