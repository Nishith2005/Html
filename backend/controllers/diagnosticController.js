const Part = require('../models/Part');
const Question = require('../models/Question');
const Outcome = require('../models/Outcome');

exports.getQuestions = async (req, res) => {
  try {
    const part = await Part.findOne({ name: req.params.bodyPart });
    if (!part) {
      return res.status(404).json({ msg: 'Body part not found' });
    }
    const questions = await Question.find({ part: part._id }).sort('order');
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getOutcome = async (req, res) => {
  try {
    const outcome = await Outcome.findOne({
      bodyPart: req.params.bodyPart,
      responseKey: req.params.responseKey,
    });
    if (!outcome) {
      return res.status(404).json({ msg: 'Outcome not found' });
    }
    res.json(outcome);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
