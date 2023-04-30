
import {
	INITIALIZE_EXC,
	INITIALIZE_RES,
	INITIALIZE_ERR,
	LOAD_ROUTE,
	HOVER_ALIAS_MENU,
	SET_DIR_LAYOUT_EXPANDED,
	SET_DIRECTORY_SCROLL_POSITION,
	VIEW_SIDE_PANEL,
	SHOW_ALIAS_MENU_MOBILE,
	SET_MOBILE_DIMMER,
	DISPLAY_QR,
	WINDOW_RESIZE,
	SHOW_NAV_ACTIONS,
	RELAY_CONNECTED,
	SET_PUB_SCROLL_STATE,
	SET_CONTENT_TOP
} from '../actions';

import { NAV_HEIGHT, MOBILE_BREAKPOINT } from '../constants';


const getClientHeight = () => {
	return window.clientHeight || document.documentElement.clientHeight;
};

const getClientWidth = () => {
	return window.clientWidth || document.documentElement.clientWidth;
};

const getInnerHeight = () => {
	return window.innerHeight || document.documentElement.innerHeight;
};

export default (state = {}, action) => {
	const { type, data } = action;
	switch (type) {

		case RELAY_CONNECTED:
			return {
				...state,
				relayConnected: true
			};

		case SHOW_NAV_ACTIONS:
			return {
				...state,
				showNavActions: true
			};

		case DISPLAY_QR:
			return {
				...state,
				displayQR: data.value
			};

		case SET_MOBILE_DIMMER:
			return {
				...state,
				mobileDimmer: data.active
			};

		case SHOW_ALIAS_MENU_MOBILE:

			return {
				...state,
				showAliasMenuMobile: data.show
			};

		case INITIALIZE_EXC:

			return {
				...state,
				dirExpanded: window.location.pathname === '/',
				minHeight: getClientHeight() - NAV_HEIGHT,
				clientHeight: getClientHeight(),
				mobile: getClientWidth() < MOBILE_BREAKPOINT,
				isChrome: window.navigator.userAgent.indexOf('Chrome') !== -1,
			};

		case SET_DIRECTORY_SCROLL_POSITION:
			return {
				...state,
				dirScroll: data.dirScroll
			};

		case SET_DIR_LAYOUT_EXPANDED:
			return {
				...state,
				dirExpanded: data.expanded
			};

		case HOVER_ALIAS_MENU:
			return {
				...state,
				hoverAliasMenu: data.hovering
			}

		case VIEW_SIDE_PANEL:
			return {
				...state,
				hoverAliasMenu: false,
				mobileDimmer: data.topMode != null
			};

		case LOAD_ROUTE:

			const update = {
				route: data.route,
				routeComponents: data.route.split('/').slice(1),
				minHeight: getClientHeight() - NAV_HEIGHT,
				clientHeight: getClientHeight(),
				hoverAliasMenu: false
			};

			if (data.route !== '/') {
				update.showLandingPage = false;
			}

			if (data.route === '/') {
				update.dirExpanded = true;
			} else if ((data.components[1] !== 'thread' && data.components[1] !== 'thread' ) || (data.components[1] === 'thread' && data.components[1] === 'thread' && !state.dirExpanded)) {
				update.dirExpanded = false;
			}

			return {
				...state,
				...update,
				preventCollapse: false,
				changeAddressDialog: false,
				setRecoveryDialog: false,
				recoverDialog: false,
				mobileDimmer: false
			};

		case INITIALIZE_RES:
			const clientWidth = getClientWidth();
			return {
				...state,
				initialized: true,
				minHeight: getClientHeight() - NAV_HEIGHT,
				clientHeight: getClientHeight(),
				clientWidth,
			};

		case WINDOW_RESIZE:
			return {
				...state,
				minHeight: getClientHeight() - NAV_HEIGHT,
				clientHeight: getClientHeight(),
				clientWidth: getClientWidth(),
				innerHeight: getInnerHeight()
			};

		case INITIALIZE_ERR:
			return {
				...state,
				error: 'Failed to initialize'
			}

		case SET_PUB_SCROLL_STATE:
			return {
				...state,
				showNavMeta: data.active
			};

		case SET_CONTENT_TOP:
			return {
				...state,
				contentTop: data.contentTop
			};

		default:
			return state;
	}
};
