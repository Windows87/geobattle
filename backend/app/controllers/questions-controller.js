const Question = require('../models/Question.js');
const questionsController = {};

function getAllQuestions() {
  return new Promise((next, reject) => {
  	Question.find({}).sort({ created_date: -1 }).exec((err, questions) => {
  	  if(err)
  	    reject(err);

  	  next(questions);
  	});
  });
}

function getQuestion(_id) {
  return new Promise((next, reject) => {
    Question.findOne({ _id }).exec((err, question) => {
      if(err)
        reject(err);

      next(question);
    });
  });  
}

questionsController.get = async (req, res) => {
  try {
  	const questions = await getAllQuestions();
  	res.json({ questions });
  } catch(err) {
  	return console.log('\x1b[31m', err.message);
  	res.status(500).json({ message: 'Error on Get Question' });
  }
}

questionsController.getUnique = async (req, res) => {
  const { _id } = req.params;

  try {
    const question = await getQuestion(_id);
    res.json({ question });
  } catch(err) {
    return console.log('\x1b[31m', err.message);
    res.status(500).json({ message: 'Error on Get Question' });
  }
}

questionsController.post = async (req, res) => {
  const { title, answers, correct_answer } = req.body;
  const created_date = new Date();

  try {
  	await Question.insert({ title, answers, correct_answer, created_date });
  	res.json({ success: true });
  } catch(err) {
  	return console.log('\x1b[31m', err.message);
  	res.status(500).json({ message: 'Error on Insert Question' });
  }
}

questionsController.delete = async (req, res) => {
  const { _id } = req.params;

  try {
    await Question.remove({ _id });
    res.json({ success: true });
  } catch(err) {
    return console.log('\x1b[31m', err.message);
    res.status(500).json({ message: 'Error on Delete Question' });
  }
}

module.exports = questionsController;