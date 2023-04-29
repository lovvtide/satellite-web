import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import reducers from './reducers';
//import { DEV } from './constants';

export const history = createBrowserHistory();

export const INITIAL_STATE = {

	app: {
		dirExpanded: false,
		initialized: false,
		mobile: false,
		minHeight: null,
		route: null,
		routeComponents: []
	}
};

const middleware = [ thunk, routerMiddleware(history) ];

// if (DEV) {
// 	const { logger } = require('redux-logger');
// 	middleware.push(logger);
// }

export default (initialState = INITIAL_STATE) => {
	return createStore(
		reducers(history),
		initialState,
		applyMiddleware(...middleware)
	);
};
