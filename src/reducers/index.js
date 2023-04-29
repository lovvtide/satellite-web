import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import dm from './dm';
import app from './app';
import menu from './menu';
import nostr from './nostr';
import query from './query';

export default (history) => combineReducers({
	router: connectRouter(history),
	dm,
	app,
	menu,
	nostr,
	query
});
