import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './index.css';

import StartScreen from './components/StartScreen';
import Game from './components/Game';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route component={StartScreen} path="/" exact />
      <Route component={Game} path="/game" exact />
    </Switch>
  </BrowserRouter>
, document.getElementById('root'));
serviceWorker.unregister();
