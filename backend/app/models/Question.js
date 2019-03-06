const nedb = require('nedb');
const Question = new nedb({ filename: 'question.db', autoload: true });
module.exports = Question;