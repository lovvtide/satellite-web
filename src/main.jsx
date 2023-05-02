import React from 'react'
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import * as ReactDOMClient from 'react-dom/client';

//import logo from './assets/logo.png';
import store, { history } from './store';
import App from './App'
import './index.css'

const Store = store();

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={Store}>
    <ConnectedRouter history={history}>
      <App store={Store} />
    </ConnectedRouter>
  </Provider>
);
