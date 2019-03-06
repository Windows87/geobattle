const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const ip = require('ip');
const routes = require('./app/routes/');
const generateRandomNumber = require('./app/utils/generateRandomNumber.js');
const Question = require('./app/models/Question.js');

const app = express();
const myIp = ip.address();
const server = http.createServer(app);
const io = socketIo(server);

const maxQuestionsPerGame = 6;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + '/public'));

app.use('/api', routes);

app.get('/game', (req, res) => {
  res.redirect('/');
});

app.listen(80, err => {
  if(err)
  	return console.log('\x1b[31m', 'Erro ao Iniciar o Servidor');

  console.log('\x1b[32m', `Servidor Iniciado no IP ${myIp}`);
});

server.listen(8080, err => {
  if(err)
  	return console.log('\x1b[31m', 'Erro ao Iniciar o Servidor Socket');
});

let rooms = [];

function getRandomQuestion(oldQuestionsId) {
  return new Promise((next, reject) => {
	Question.count({}, (err, count) => {
	  if(err)
	  	return reject(err);

	  const skipCount = Math.floor(Math.random() * count);

	  Question.find({ _id: { $nin: oldQuestionsId } }).skip(skipCount).limit(1).exec((err2, questions) => {
	    if(err2)
	      return reject(err);

	    next(questions[0]);
	  });
	});
  });	
}

function connectPublicRoomNotStarted(user) {
  let publicRoom;

  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];

  	if(room.started === false & room.privateRoom === false && room.players.length === 1) {
  	  rooms[c].players.push({ socket: user.socketId, name: user.name, answered: false, hits: 0 });
  	  rooms[c].started = true;
  	  publicRoom = room;
  	  break;
  	}
  }

  return publicRoom;
}

function getRoom(playerId) {
  let returnRoom;

  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];
  	const playerPosition = room.players.map(e => e.socket).indexOf(playerId);

  	if(playerPosition !== -1) {
  	  returnRoom = room;
  	  break;
  	}
  }

  return returnRoom;	
}

function createRoom(user, privateRoom, roomName) {
  let alreadyExistsRoom = false;
  roomName = roomName || `random-${generateRandomNumber()}`;

  for(let c = 0; c < rooms.length; c++) {
    const room = rooms[c];
  	
  	if(room.name === roomName) {
  	  alreadyExistsRoom = true;
  	  break;
  	}
  }

  const room = {
  	name: roomName,
  	players: [{ socket: user.socketId, name: user.name, answered: false, hits: 0 }],
  	started: false,
  	privateRoom,
    oldQuestionsId: [],
  	atualQuestionNumber: 0
  };

  rooms.push(room);

  const error = alreadyExistsRoom ? 'A sala já existe' : false;

  return { error, room };
}

function enterRoom(user, roomName) {
  let roomToEnter;
  let roomExists = false;
  let error;

  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];

  	if(room.name === roomName && room.players.length) {
  	  roomExists = true;

  	  if(room.started || room.players.length < 1) {
  	  	error = 'O jogo já começou';
        break;
  	  }

  	  rooms[c].players.push({ socket: user.socketId, name: user.name, answered: false, hits: 0 });
  	  rooms[c].started = true;
  	  roomToEnter = room;
  	}
  }

  if(!roomExists)
  	error = 'A sala não existe';

  return { error, room: roomToEnter };
}

function setRoomInfo(roomName, toEdit, info) {
  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];

  	if(room.name === roomName) {
  	  rooms[c][toEdit] = info;
  	  break;
  	}
  }

  return;
}

function removeRoom(roomName) {
  rooms = rooms.filter( room => room.name !== roomName);
  return;	
}

function getPlayer(playerId) {
  let player;

  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];
  	const playerPosition = room.players.map(e => e.socket).indexOf(playerId);

  	if(playerPosition !== -1) {
  	  player = room.players[playerPosition];
  	  break;
  	}
  }

  return player;	
}

function setPlayerInfo(playerId, toEdit, info) {
  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];
  	const playerPosition = room.players.map(e => e.socket).indexOf(playerId);

  	if(playerPosition !== -1) {
  	  rooms[c].players[playerPosition][toEdit] = info;
  	  break;
  	}
  }

  return;
}

function getAnotherPlayer(playerId) {
  let anotherPlayer;

  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];
  	const playerPosition = room.players.map(e => e.socket).indexOf(playerId);

  	if(playerPosition !== -1) {
  	  anotherPlayer = !playerPosition ? room.players[1] : room.players[0];
  	  break;
  	}
  }

  return anotherPlayer;
}	

function setAnotherPlayerInfo(playerId, toEdit, info) {
  for(let c = 0; c < rooms.length; c++) {
  	const room = rooms[c];
  	const playerPosition = room.players.map(e => e.socket).indexOf(playerId);

  	if(playerPosition !== -1) {
  	  rooms[c].players[(!playerPosition ? 1 : 0)][toEdit] = info;
  	  break;
  	}
  }

  return;
}

io.on('connection', socket => {
  socket.on('startRandomGame', async username => {
  	const user = { socketId: socket.id, name: username };
  	let room = connectPublicRoomNotStarted(user);

    try {

  	if(room) {
  	  const anotherPlayer = room.players[0];
  	  const randomQuestion = await getRandomQuestion([]);

  	  setRoomInfo(room.name, 'question', randomQuestion);

	  socket.emit('startGame', { name: anotherPlayer.name });
	  socket.emit('questionStart', { icon: randomQuestion, title: randomQuestion.title, answers: randomQuestion.answers });
	  
    setRoomInfo(room.name, 'oldQuestionsId', [randomQuestion._id]);

	  io.sockets.connected[anotherPlayer.socket].emit('startGame', { name: username });
	  io.sockets.connected[anotherPlayer.socket].emit('questionStart', { icon: randomQuestion, title: randomQuestion.title, answers: randomQuestion.answers });

	  return;
  	}
  	
  	room = createRoom(user, false);
  	console.log('\x1b[32m', `Numero de Salas: ${rooms.length}`);
	  socket.emit('createdRoom', room.name);
    } catch(err) {
      console.log(err);
    }
  });

  socket.on('createRoom', data => {
  	const user = { socketId: socket.id, name: data.username };
  	const create = createRoom(user, true, data.roomName);

  	console.log('\x1b[32m', `Numero de Salas: ${rooms.length}`);
  	
  	if(create.error)
  	  return socket.emit('errorOccorred', { message: 'A Sala já existe' });

  	socket.emit('createdRoom', create.room.name);
  });

  socket.on('enterTheRoom', async data => {
  	const user = { socketId: socket.id, name: data.username };
  	const enter = enterRoom(user, data.roomName);

  	if(enter.error)
  		return socket.emit('errorOccorred', { message: enter.error });

    const anotherPlayer = enter.room.players[0];
    const randomQuestion = await getRandomQuestion([]);

    setRoomInfo(enter.room.name, 'question', randomQuestion);
    setRoomInfo(enter.room.name, 'oldQuestionsId', [...enter.room.oldQuestionsId, randomQuestion._id]);

	  socket.emit('startGame', { name: anotherPlayer.name });
	  socket.emit('questionStart', { icon: randomQuestion, title: randomQuestion.title, answers: randomQuestion.answers });
	  
	  io.sockets.connected[anotherPlayer.socket].emit('startGame', { name: data.username });
	  io.sockets.connected[anotherPlayer.socket].emit('questionStart', { icon: randomQuestion, title: randomQuestion.title, answers: randomQuestion.answers });
  });

  socket.on('answer', async answer => {
  	const anotherPlayer = getAnotherPlayer(socket.id);

  	setPlayerInfo(socket.id, 'answer', answer);
  	setPlayerInfo(socket.id, 'answered', true);

  	if(!anotherPlayer.answered) {
  	  io.sockets.connected[anotherPlayer.socket].emit('oponentAnswer', true);
  	  return;
  	}

  	const room = getRoom(socket.id);
  	const player = getPlayer(socket.id);
  	let playerHit = false;
  	let anotherPlayerHit = false;

    if(player.answer === room.question.correct_answer) {
      player.hits++;
      setPlayerInfo(socket.id, 'hits', player.hits);
      playerHit = true;
    }

    if(anotherPlayer.answer === room.question.correct_answer) {
      anotherPlayer.hits++;
      setAnotherPlayerInfo(socket.id, 'hits', anotherPlayer.hits);
      anotherPlayerHit = true;
    }

  	socket.emit('bothAnswer', { correctAnswer: room.question.correct_answer, player, anotherPlayer });
  	io.sockets.connected[anotherPlayer.socket].emit('bothAnswer', { correctAnswer: room.question.correct_answer, player: anotherPlayer, anotherPlayer: player });

    if(room.atualQuestionNumber + 1 === maxQuestionsPerGame) {
      socket.emit('endGame', { player, anotherPlayer });
      io.sockets.connected[anotherPlayer.socket].emit('endGame', { player: anotherPlayer, anotherPlayer: player });
      removeRoom(room.name);
      console.log('\x1b[31m', `Numero de Salas: ${rooms.length}`);
      return;
    }

    setRoomInfo(room.name, 'atualQuestionNumber', room.atualQuestionNumber + 1);
    setPlayerInfo(socket.id, 'answered', false);
    setAnotherPlayerInfo(socket.id, 'answered', false);

  	let randomQuestion = await getRandomQuestion(room.oldQuestionsId);

  	setRoomInfo(room.name, 'question', randomQuestion);
    setRoomInfo(room.name, 'oldQuestionsId', [...room.oldQuestionsId, randomQuestion._id]);

  	socket.emit('questionStart', { icon: randomQuestion, title: randomQuestion.title, answers: randomQuestion.answers });
  	io.sockets.connected[anotherPlayer.socket].emit('questionStart', { icon: randomQuestion, title: randomQuestion.title, answers: randomQuestion.answers });
  });

  socket.on('disconnect', () => {
  	const room = getRoom(socket.id);
  	const player = getPlayer(socket.id);
  	const anotherPlayer = getAnotherPlayer(socket.id);

  	if(!room)
  	  return;

  	removeRoom(room.name);
  	console.log('\x1b[31m', `Numero de Salas: ${rooms.length}`);

  	if(anotherPlayer)
  	  io.sockets.connected[anotherPlayer.socket].emit('anotherPlayerDisconnected', { player, anotherPlayer });
  });
});