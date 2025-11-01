const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DiagnosticController = require('../controllers/diagnosticController');

router.get('/questions/:bodyPart', auth, DiagnosticController.getQuestions);
router.get('/outcomes/:bodyPart/:responseKey', auth, DiagnosticController.getOutcome);

module.exports = router;
