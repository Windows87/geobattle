const readline = require('readline-sync');
const fetch = require('node-fetch');
const log = console.log;

const insertQuestion = (title, answers, correct_answer) => {
  const body = JSON.stringify({ title, answers, correct_answer });

  return new Promise(async (next, reject) => {
  	try {
      const call = await fetch('http://localhost/api/questions/', {
  	    method: 'post',
  	    headers: {
  	      'Content-Type': 'application/json'
  	    },
  	    body
      });
      const response = await call.json();

      if(call.status === 200)
        return next();

    console.log('\x1b[31m', `Erro: ${JSON.stringify(response)}`);
  	  reject();
    } catch(error) {
      console.log('\x1b[31m', `Erro: ${error.message}`);
    }
   });
}

const start = async () => {
  while(true) {
    const question = readline.question('Qual o titulo da questao? ');
    const numberOfAnswers = readline.question('Qual o numero de respostas disponiveis? ');
    const answers = [];

    for(let c = 0; c < numberOfAnswers; c++) {
  	  const answer = readline.question(`Pergunta ${c + 1}: `);
  	  answers.push(answer);
    }

    const correctNumberAnswer = readline.question('Qual o numero resposta certa? ');
    const correctAnswer = answers[correctNumberAnswer - 1];

    try {
      await insertQuestion(question, answers, correctAnswer);
      log('\x1b[32m', 'Successo ao Criar a Questao');
      log('\x1b[0m', '');
    } catch(error) {
      log('\x1b[31m', 'Erro ao criar Questao');
      log('\x1b[0m', '');
    }
  }
}

start();