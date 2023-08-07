import { push, replace } from 'connected-react-router';


export const WINDOW_RESIZE = 'WINDOW_RESIZE';
export const windowResize = () => {
	return { type: WINDOW_RESIZE };
};

export const SET_COMMUNITY_ADMIN_PROPS = 'SET_COMMUNITY_ADMIN_PROPS';
export const setCommunityAdminProps = (data) => {
	return { type: SET_COMMUNITY_ADMIN_PROPS, data };
};

export const SET_MOBILE_NAV_MODE = 'SET_MOBILE_NAV_MODE';
export const setMobileNavMode = (mode) => {
	return { type: SET_MOBILE_NAV_MODE, data: { mode } };
};

export const SET_MOBILE_MENU_OPEN = 'SET_MOBILE_MENU_OPEN';
export const setMobileMenuOpen = (open) => {
	return { type: SET_MOBILE_MENU_OPEN, data: { open } };
};

export const VIEW_SIDE_PANEL = 'VIEW_SIDE_PANEL';
export const viewSidePanel = (topMode, subMode) => {
	return (dispatch, getState) => {

		const { app } = getState();

		if (!app.mobile) {
			window.scrollTo({ top: 0 });
		}

		dispatch({ type: VIEW_SIDE_PANEL, data: { topMode, subMode } });
	};
};

export const DISPLAY_QR = 'DISPLAY_QR';
export const displayQR = (value) => {
	return { type: DISPLAY_QR, data: { value } };
};

export const SHOW_LANDING_PAGE = 'SHOW_LANDING_PAGE';
export const showLandingPage = (show) => {
	return { type: SHOW_LANDING_PAGE, data: { show } };
};

export const SET_DIRECTORY_SCROLL_POSITION = 'SET_DIRECTORY_SCROLL_POSITION';
export const setDirectoryScrollPosition = (dirScroll) => {
	return { type: SET_DIRECTORY_SCROLL_POSITION, data: { dirScroll } };
};

export const HOVER_ALIAS_MENU = 'HOVER_ALIAS_MENU';
export const hoverAliasMenu = (hovering) => {
	return { type: HOVER_ALIAS_MENU, data: { hovering } };
};

export const SET_MOBILE_DIMMER = 'SET_MOBILE_DIMMER';
export const setMobileDimmer = (active) => {
	return { type: SET_MOBILE_DIMMER, data: { active } };
};

export const SHOW_ALIAS_MENU_MOBILE = 'SHOW_ALIAS_MENU_MOBILE';
export const showAliasMenuMobile = (show) => {

	return (dispatch, getState) => {

		dispatch(setMobileDimmer(show));

		document.body.style['overflow-y'] = show ? 'hidden' : 'auto';

		const { app } = getState();

		dispatch({ type: SHOW_ALIAS_MENU_MOBILE, data: { show, mobile: app.mobile } });
	};
}; 

export const SET_PUB_SCROLL_STATE = 'SET_PUB_SCROLL_STATE';
export const setPubScrollState = (active) => {
	return { type: SET_PUB_SCROLL_STATE, data: { active } };
};

export const SET_CONTENT_TOP = 'SET_CONTENT_TOP';
export const setContentTop = (scrollTop) => {

	return (dispatch) => {

		let headerElement = null;

		headerElement = document.getElementById('pub_header');

		if (!headerElement) {
			
			headerElement = document.getElementById('thread_header');
		}

		let contentTop = null;
		if (headerElement) {

			const { bottom } = headerElement.getBoundingClientRect();

			contentTop = bottom + scrollTop;

			dispatch({ type: SET_CONTENT_TOP, data: { contentTop } });
		}
	};
};

export const SET_DIR_LAYOUT_EXPANDED = 'SET_DIR_LAYOUT_EXPANDED';
export const setDirectoryLayoutExpanded = (expanded) => {
	return { type: SET_DIR_LAYOUT_EXPANDED, data: { expanded } };
};

export const navigate = (path, options = {}) => {
	return (dispatch) => {
		dispatch(options.replace ? replace(path) : push(path));
	};
};

export const LOAD_ROUTE = 'LOAD_ROUTE';
export const loadRoute = (prev, route) => {
	return async (dispatch, getState) => {

		const { app } = getState();
		const c = route.split('/');

		const hash = window.location.hash ? window.location.hash.slice(1) : '';

		dispatch({ type: LOAD_ROUTE, data: { route, components: c, hash } });

		if (!app.mobile) {

			if (route === '/' || c[1] === 'register' || c[1] === 'thread' || (c[1] === 'media' && typeof c[3] !== 'undefined')) {
				
				document.body.style['overflow-y'] = 'hidden';

				if (c[1] !== 'media') {
					window.scrollTo(0, 0);
				}

			} else {
				document.body.style['overflow-y'] = 'auto';
			}

		}
	};
};
