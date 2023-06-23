import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import communities from './communities';
import dm from './dm';
import app from './app';
import files from './files';
import media from './media';
import menu from './menu';
import nostr from './nostr';
import query from './query';

export default (history) => combineReducers({
	router: connectRouter(history),
	communities,
	dm,
	app,
	files,
	media,
	menu,
	nostr,
	query
});
