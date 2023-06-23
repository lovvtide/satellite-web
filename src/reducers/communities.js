import {
	RECEIVE_COMMUNITY_EVENT
} from '../actions';

// Get d-identifer community name
const getIdentifier = ({ tags }) => {

	for (let tag of tags) {

		if (tag[0] === 'd') {
			return tag[1];
		}
	}
};

// Detect founder/mod status
const contextualize = (event, { pubkey }) => {

	const item = {
		founder: event.pubkey === pubkey,
		moderator: event.pubkey === pubkey,
		moderators: [],
		event
	};

	//if (item.moderator) {

		for (let tag of event.tags) {

			if (tag[0] === 'p') {

				if (tag[1] === pubkey) {
					item.moderator = true;
				}

				item.moderators.push(tag[1]);

			} else if (tag[0] === 'd') {
				item.name = tag[1];
			} else if (tag[0] === 'image') {
				item.image = tag[1];
			} else if (tag[0] === 'description') {
				item.description = tag[1];
			} else if (tag[0] === 'rules') {
				item.rules = tag[1];
			}
		}
	//}

	return item;
};

// Deduplicate and sort list of replacable community events
const receiveCommunityEvent = (state, { event, pubkey }) => {

	const d = getIdentifier(event);
	const list = [];

	let added;

	for (let item of state.list) {

		if (item.event.pubkey === event.pubkey && getIdentifier(item.event) === d) {

			list.push(event.created_at > item.event.created_at ? contextualize(event, { pubkey }) : item);
			added = true;

		} else {

			list.push(item);
		}
	}

	if (!added) {

		list.push(contextualize(event, { pubkey }));
	}

	return {
		...state,
		list: list.sort((a, b) => {
			return b.event.created_at - a.event.created_at;
		})
	};
};

const INITIAL_STATE = {
	list: []
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case RECEIVE_COMMUNITY_EVENT:
			return receiveCommunityEvent(state, data);

		default:
			return state;
	}
};
