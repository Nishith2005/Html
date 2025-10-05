const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Diagnosis = require('../models/Diagnosis');

// @route   POST api/diagnoses
// @desc    Create a diagnosis
// @access  Private
router.post('/', auth, async (req, res) => {
  const { bodyPart, condition, description, severity } = req.body;

  try {
    const newDiagnosis = new Diagnosis({
      user: req.user.id,
      bodyPart,
      condition,
      description,
      severity,
    });

    const diagnosis = await newDiagnosis.save();
    res.json(diagnosis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/diagnoses
// @desc    Get user's diagnoses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ user: req.user.id }).sort({ date: -1 });
    res.json(diagnoses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/diagnoses/:id
// @desc    Delete a diagnosis
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let diagnosis = await Diagnosis.findById(req.params.id);

    if (!diagnosis) return res.status(404).json({ msg: 'Diagnosis not found' });

    // Make sure user owns the diagnosis
    if (diagnosis.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Diagnosis.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Diagnosis removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Diagnosis not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;