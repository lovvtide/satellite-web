import {
	// INITIALIZE,
	// HANDLE_RESIZE,
	GET_MEDIA_RES,
	VIEW_DETAILS,
	PROMPT_DELETE_FILE,
	VIEW_SIDE_PANEL,
	DELETE_FILE_START,
	DELETE_FILE_COMPLETE,
	SEARCH_FILES,
	SET_FILES_SORT,
	SET_ADD_CREDIT_MODAL_OPEN
} from '../actions';

//import { MOBILE_BREAKPOINT } from '../constants';


// const Layout = () => {

// 	const clientWidth = window.clientWidth || document.documentElement.clientWidth;

// 	return {
// 		clientHeight: window.clientHeight || document.documentElement.clientHeight,
// 		mobile: clientWidth < MOBILE_BREAKPOINT,
// 		clientWidth
// 	};
// };

const INITIAL_STATE = {
	sort: 'time'
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case SET_ADD_CREDIT_MODAL_OPEN:
			return {
				...state,
				addCreditModalOpen: data.open
			};

		case SET_FILES_SORT:
			return {
				...state,
				sort: data.sort
			};

		case SEARCH_FILES:
			return {
				...state,
				query: data.query
			};

		case DELETE_FILE_START:
			return state.promptDeleteFile ? {
				...state,
				promptDeleteFile: {
					...state.promptDeleteFile,
					pendingDelete: true
				}
			} : state;

		case DELETE_FILE_COMPLETE:
			return {
				...state,
				promptDeleteFile: null
			};

		case GET_MEDIA_RES:
			return {
				...state,
				initialized: true
			};

		case VIEW_DETAILS:
			return {
				...state,
				viewDetails: data
			};

		case PROMPT_DELETE_FILE:
			return {
				...state,
				promptDeleteFile: data
			};

		case VIEW_SIDE_PANEL:
			return {
				...state,
				viewDetails: null,
				promptDeleteFile: null
			}

		// case INITIALIZE:
		// 	return {
		// 		...state,
		// 		...Layout(),
		// 		initialized: true,
		// 	};

		// case HANDLE_RESIZE:
		// 	return {
		// 		...state,
		// 		...Layout()
		// 	};

		default:
			return state;
	}
};
