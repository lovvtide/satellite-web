import {
	RECEIVE_NOTIFICATIONS
} from '../actions';


const INITIAL_STATE = {};

const receive = (state, { events }) => {

	const update = {};

	for (let event of events) {
		update[event.id] = true;
	}

	return {
		...state,
		...update
	}
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case RECEIVE_NOTIFICATIONS:
			return receive(state, data);

		default:
			return state;
	}
};
