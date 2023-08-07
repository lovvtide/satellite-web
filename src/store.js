import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import logger from 'redux-logger';

import reducers from './reducers';
import { PROD } from './constants';


export const history = createBrowserHistory();

export const INITIAL_STATE = {

	app: {
		contentTop: null,
		showNavMeta: false,
		dirExpanded: false,
		initialized: false,
		mobile: false,
		minHeight: null,
		route: null,
		routeComponents: [],
		mobileNavMode: 'network'
	},

	media: {
		sort: 'time'
	}
};

const middleware = [ thunk, routerMiddleware(history) ];

if (!PROD) {

	middleware.push(logger);
}

export default (initialState = INITIAL_STATE) => {
	return createStore(
		reducers(history),
		initialState,
		applyMiddleware(...middleware)
	);
};
