const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Diagnosis = require('../models/Diagnosis');
const User = require('../models/User');

// @route   GET api/admin/all-diagnoses
// @desc    Get all diagnoses from all users
// @access  Private, Admin
router.get('/all-diagnoses', [auth, admin], async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find()
      .populate('user', ['email'])
      .sort({ date: -1 });
    res.json(diagnoses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;