import React, { Component } from 'react';
import './index.css';

class StartScreen extends Component {
  state = {
    selectingName: false,
    useThisUsernameForever: false,
    creatingPrivateRoom: false,
    enteringPrivateRoom: false,
    name: localStorage.getItem('username') || '',
    privateRoomName: ''
  };

  startPlay = () => {
  	const useThisUsernameForever = localStorage.getItem('useThisUsernameForever');

  	if(useThisUsernameForever === 'true')
  	  return this.props.history.push('/game');

  	this.setState({ selectingName: true });
  }

  onChangeName = event => {
  	const name = event.target.value;
  	this.setState({ name });
  }

  onChangeRoomName = event => {
    const privateRoomName = event.target.value;
    this.setState({ privateRoomName });
  }

  onChangeCheckbox = event => {
  	const useThisUsernameForever = event.target.checked;
  	this.setState({ useThisUsernameForever });
  }

  onSubmitName = event => {
    event.preventDefault();
    const { name, useThisUsernameForever, creatingPrivateRoom, enteringPrivateRoom } = this.state;

    if(!name.replace(' ', ''))
      return;

    localStorage.setItem('username', name);
    localStorage.setItem('useThisUsernameForever', useThisUsernameForever);

    if(!creatingPrivateRoom && !enteringPrivateRoom)
      return this.props.history.push('/game');

    this.setState({ selectingName: false });
  }

  onSubmitRoomName = event => {
    event.preventDefault();
    const { privateRoomName, enteringPrivateRoom } = this.state;

    if(!privateRoomName.replace(' ', ''))
      return;

    if(!enteringPrivateRoom)
      this.props.history.push(`/game/?creating&room=${privateRoomName}`);
    else
      this.props.history.push(`/game/?room=${privateRoomName}`);
  }

  createRoom = () => {
    this.setState({ creatingPrivateRoom: true, selectingName: true });
  }

  enterRoom = () => {
    this.setState({ enteringPrivateRoom: true, selectingName: true });
  }

  render() {
  	const { startPlay, onChangeName, onChangeRoomName, onChangeCheckbox, onSubmitName, onSubmitRoomName, createRoom, enterRoom } = this;
  	const { selectingName, name, useThisUsernameForever, creatingPrivateRoom, privateRoomName, enteringPrivateRoom } = this.state;
  	return (
  	  <div className="startScreen-imageBackground">
  	    <div className="startScreen">
  	      <h1>GeoBattle!</h1>

  	      { !selectingName && !creatingPrivateRoom && !enteringPrivateRoom ?
  	      	<div className="startScreen-menu">
  	          <span onClick={startPlay}>Jogar com um Jogador Aleatório</span>
              <span onClick={createRoom}>Criar Sala</span>
              <span onClick={enterRoom}>Entrar em uma Sala</span>
  	        </div> : null }

          { selectingName ?
            <div className="startScreen-selectName">
              <span>Escreva um Nome ou Apelido para Jogar</span>
              <form onSubmit={onSubmitName}>
                <input type="text" placeholder="Nome ou Apelido" onChange={onChangeName} value={name} />
                { !name.replace(' ', '') ? null :
                <div className="startScreen-checkboxContainer">
                  <input type="checkbox" onChange={onChangeCheckbox} checked={useThisUsernameForever} />
                  <span className={useThisUsernameForever ? 'startScreen-checkboxChecked' : ''}> Usar esse Nome Sempre </span>
                </div> }
                { !name.replace(' ', '') ? null : <button>Continuar</button> }
              </form>
            </div> : null}

          { !selectingName && (creatingPrivateRoom || enteringPrivateRoom) ?
            <div className="startScreen-createPrivateRoom">
              <span>Escreva o Nome da Sala</span>
              <form onSubmit={onSubmitRoomName}>
                <input type="text" placeholder="Nome da Sala" onChange={onChangeRoomName} value={privateRoomName} />
                { !privateRoomName.replace(' ', '') ? null : <button>Continuar</button> }
              </form>
            </div>
            : null}          
  	    </div>
  	  </div>
  	);
  }
}

export default StartScreen;