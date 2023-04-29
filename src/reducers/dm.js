import {
	DECRYPT_DM,
	RECEIVE_DM,
	RECEIVE_DM_METADATA,
	LOAD_ACTIVE_NOSTR,
	SET_ACTIVE_DM_CHAT,
	SET_ACTIVE_DM_CHAT_READY,
	VIEW_SIDE_PANEL
} from '../actions';


const receiveDM = (state, data) => {

	if (!state.active) { return state; }

	let receiver, topic;

	for (let tag of data.tags) {
		if (tag[0] === 'p') {
			receiver = tag[1];
			break;
		}
	}

	if (!receiver) { return state; }

	if (receiver === state.active) {
		topic = data.pubkey;
	} else if (data.pubkey === state.active) {
		topic = receiver;
	}

	if (!topic) { return state; }

	const update = {
		...state,
		chats: {
			...state.chats,
			[topic]: {
				...(state.chats[topic] || {}),
				[data.id]: true
			}
		}
	};

	if (!state.chats[topic] || !state.chats[topic][data.id]) {
		update.messages = [
			...(state.messages || []),
			{ topic, data }
		];
	}

	if (!update.metadata[topic]) {

		update.metadata[topic] = {};
	}

	return update;
};

const receiveMetadata = (state, data) => {

	const name = data.metadata.display_name || data.metadata.name;

	return name ? {
		...state,
		metadata: {
			...state.metadata,
			[data.pubkey]: {
				...(state.metadata[data.pubkey] || {}),
				picture: data.metadata.picture,
				name
			}
		}
	} : state;
};

const INITIAL_STATE = {
	activeChatReady: false,
	activeChat: null,
	decrypted: {},
	metadata: {},
	messages: [],
	chats: {}
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case SET_ACTIVE_DM_CHAT_READY:

			return {
				...state,
				activeChatReady: true
			};

		case SET_ACTIVE_DM_CHAT:

			return {
				...state,
				activeChat: data.chat,
				activeChatReady: false
			};

		case DECRYPT_DM:

			const _decrypted = {};

			for (let item of data) {

				_decrypted[item.id] = item.decrypted;
			}

			return {
				...state,
				decrypted: {
					...state.decrypted,
					..._decrypted
				}
			};

		case RECEIVE_DM:

			return receiveDM(state, data);

		case RECEIVE_DM_METADATA:

			return receiveMetadata(state, data);

		case VIEW_SIDE_PANEL:
			return {
				...state,
				activeChat: null,
				activeChatReady: false
			};

		case LOAD_ACTIVE_NOSTR:

			return {
				...INITIAL_STATE,
				active: data.pubkey
			};

		default:
			return state;
	}
};
