const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/:bodyPart', (req, res) => {
  try {
    const { bodyPart } = req.params;
    const filePath = path.join(__dirname, '..', 'questions.json');
    const questionsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const data = questionsData.find(item => item.bodyPart === bodyPart);

    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ msg: 'Diagnostic data not found for the specified body part.' });
    }
  } catch (error) {
    console.error('Error fetching diagnostic data:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;