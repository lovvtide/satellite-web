import {
	QUERY_PROFILES,
	LOAD_ROUTE
} from '../actions';


const INITIAL_STATE = {
	active: '',
	results: []
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case QUERY_PROFILES:
			return data ? {
				...state,
				active: data.context,
				results: data.results
			} : INITIAL_STATE;

		case LOAD_ROUTE:
			return INITIAL_STATE;

		default:
			return state;
	}
};
