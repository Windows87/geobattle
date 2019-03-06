import React, { Component } from 'react';
import io from 'socket.io-client';
import './index.css';

class Game extends Component {
  socket = io(`http://${window.location.hostname}:8080/`);

  state = {
    waitingStart: true,
    started: false,
    answered: false,
    oponentAnswered: false,
    gameEnded: false,
    answerSelected: '',
    correctAnswer: '',
    player: { username: localStorage.getItem('username'), hits: 0 },
    anotherPlayer: {},
    question: {}
  };

  constructor(props) {
    super(props);

    const username = localStorage.getItem('username');
    if(!username)
      return this.props.history.push('/');

    if(window.location.search) {
      const isCreating = window.location.search.split('creating').length === 2;
      const roomName = window.location.search.split('room=')[1];

      if(isCreating)
        this.socket.emit('createRoom', { username, roomName });
      else
        this.socket.emit('enterTheRoom', { username, roomName });
    } else {
      this.socket.emit('startRandomGame', username);
    }

    this.socket.on('errorOccorred', error => {
      alert(error.message);
      this.props.history.push('/');
    });
    this.socket.on('anotherPlayerDisconnected', () => {
      alert('O outro jogador Desconectou');
      this.props.history.push('/');
    });
    this.socket.on('createdRoom', () => this.setState({ waitingStart: true }));
    this.socket.on('startGame', anotherPlayer => this.setState({ waitingStart: false, anotherPlayer: { name: anotherPlayer.name, hits: 0 } }));
    this.socket.on('questionStart', question => {
      const { started } = this.state;

      if(!started)
        this.setState({ question, oponentAnswered: false, answered: false, started: true, answerSelected: '', correctAnswer: '' });

      setTimeout(() => {
        this.setState({ question, oponentAnswered: false, answered: false, answerSelected: '', correctAnswer: '' });
      }, 3000);
    });
    this.socket.on('oponentAnswer', () => this.setState({ oponentAnswered: true }));
    this.socket.on('bothAnswer', data => this.setState({ correctAnswer: data.correctAnswer, player: data.player, anotherPlayer: data.anotherPlayer }));
    this.socket.on('endGame', data => this.setState({ gameEnded: true, player: data.player, anotherPlayer: data.anotherPlayer }));
  }

  onAnswerClick = answerSelected => {
    const { answered } = this.state;

    if(answered)
      return;

    this.setState({ answered: true, answerSelected });
    this.socket.emit('answer', answerSelected);
  }

  backToMenu = () => {
    this.props.history.push('/');
  }

  render() {
    const { waitingStart, question, anotherPlayer, player, answerSelected, correctAnswer, oponentAnswered, gameEnded } = this.state;
    const { onAnswerClick, backToMenu } = this;

  	return (
  	  <div className="game">
        { waitingStart ? <span className="game-waiting">Esperando Outro Player..</span> : null }
        
        { question.title && !gameEnded ?
           <div className="game-question">
             <div className="game-anotherPlayer">
               <span className="game-anotherPlayerName"> { anotherPlayer.name } </span>
               <span> { anotherPlayer.hits === 1 ? '1 Acertos' : `${anotherPlayer.hits} Acertos` } </span>
             </div>

             <div className="game-player">
               <span className="game-playerYou">Você</span>
               <span> { player.hits === 1 ? '1 Acertos' : `${player.hits} Acertos` } </span>
             </div>

             <h2> { question.title } </h2>
             { question.answers.map(answer => <button key={answer} 
              className={correctAnswer === answer ? 'correctAnswer' : (answerSelected === answer ? 'answerSelected' : '')}
               onClick={() => onAnswerClick(answer)}> { answer } </button>) }
             { oponentAnswered ? <span className="oponentAnswered"> { anotherPlayer.name } já respondeu! </span> : null }
           </div> 
        : null }

        { gameEnded ?
          <div className="game-ended">
            <h1>Fim da Rodada</h1>
            <h2>{ player.hits > anotherPlayer.hits ? `Você ganhou de ${anotherPlayer.name}` : (player.hits < anotherPlayer.hits ? `Você perdeu de ${anotherPlayer.name}` : `Você empatou com ${anotherPlayer.name}`) }</h2>
            <button onClick={backToMenu}>Voltar ao Menu</button>
          </div>
        : null }
  	  </div>
  	);
  }
}

export default Game;