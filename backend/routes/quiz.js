const express = require('express');
const router = express.Router();
const diagnosisTree = require('../data/diagnosisTree');

router.get('/', (req, res) => {
  try {
    res.json(diagnosisTree);
  } catch (error) {
    console.error('Error fetching diagnosis tree:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;