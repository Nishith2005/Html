const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Part', PartSchema);
