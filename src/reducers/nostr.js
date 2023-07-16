import {
	RESOLVED_NOSTR_METADATA,
	RESOLVED_NOSTR_CONTACTS,
	RESOLVED_CONTACT_METADATA,
	OPEN_REPLY_MODAL,
	NOSTR_MAIN_INIT,
	NOSTR_PROFILE_INIT,
	SET_ROOT_POST_ITEM,
	SET_ROOT_POST_AUTHOR,
	SET_FRONTPAGE_MODE,
	RELAY_STATUS,
	RELAY_CLOSE,
	SET_PENDING_CONTACTS,
	SHOW_ZAP_REQUEST,
	LOAD_ACTIVE_NOSTR,
	REVOKE_DEVICE_AUTH,
	SET_PROFILE_PUBKEY,
	SET_NOTIFICATIONS_LAST_SEEN,
	RECEIVE_NOTIFICATIONS
} from '../actions';


const detectUnreadNotifications = (state, events) => {

	let unread = 0;

	for (let event of events) {

		if (
			event.pubkey === state.pubkey
			|| event.created_at < state.notificationsLastSeen
		) { continue; }

		unread++;
	}

	return state.unreadNotifications + unread;
};

const INITIAL_STATE = {
	unreadNotifications: 0
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case RECEIVE_NOTIFICATIONS:
			return {
				...state,
				unreadNotifications: detectUnreadNotifications(state, data.events)
			};

		case SET_NOTIFICATIONS_LAST_SEEN:
			return {
				...state,
				unreadNotifications: 0,
				notificationsLastSeen: data.timestamp
			};

		case LOAD_ACTIVE_NOSTR:
			return {
				...state,
				pubkey: data.pubkey,
				privateKey: data.privateKey,
				notificationsLastSeen: data.notificationsLastSeen
			};

		case REVOKE_DEVICE_AUTH:
			return {
				...state,
				pubkey: undefined,
				privateKey: undefined
			};

		case SHOW_ZAP_REQUEST:
			return data ? {
				...state,
				zapEvent: data.event,
				zapRequest: data.request,
				zapRecipient: data.recipient
			} : {
				...state,
				zapEvent: null,
				zapRequest: null,
				zapRecipient: null
			};

		case RELAY_STATUS:
			return {
				...state,
				relays: {
					...(state.relays || {}),
					[data.relay.url]: {
						...((state.relays || {})[data.relay.url] || {}),
						...data.status
					}
				}
			};

		case RELAY_CLOSE:

			const _relays = {};
			const _url = data.url[data.url.length - 1] === '/' ? data.url.slice(0, -1) : data.url;

			for (let url of Object.keys(state.relays || {})) {
				if (url !== _url) {
					_relays[url] = state.relays[url];
				}
			}

			return {
				...state,
				relays: _relays
			};

		case SET_PENDING_CONTACTS:
			return {
				...state,
				pendingContacts: true
			};

		case SET_FRONTPAGE_MODE:
			return {
				...state,
				mode: data.mode,
				pendingContacts: false
			};

		case RESOLVED_CONTACT_METADATA:
			return {
				...state,
				contactMetadata: {
					...(state.contactMetadata || {}),
					[data.pubkey]: data.metadata
				}
			};

		case RESOLVED_NOSTR_CONTACTS:

			const contacts = {};

			for (let contact of data.contacts) {
				contacts[contact] = true;
			}

			return {
				...state,
				type3Content: data.content,
				contacts: {
					...(state.contacts || {}),
					[data.pubkey]: contacts
				}
			};

		case SET_ROOT_POST_ITEM:
			return {
				...state,
				rootItem: data
			};

		case SET_ROOT_POST_AUTHOR:
			return {
				...state,
				rootAuthor: data
			};

		case NOSTR_PROFILE_INIT:
			return {
				...state,
				prof: data.feed
			};

		case NOSTR_MAIN_INIT:
			return {
				...state,
				main: data.main
			};

		case RESOLVED_NOSTR_METADATA:
			return {
				...state,
				metadata: {
					...(state.metadata || {}),
					[data.pubkey]: data.metadata
				}
			};

		case OPEN_REPLY_MODAL:
			return {
				...state,
				mobileEditor: data
			};

		case SET_PROFILE_PUBKEY:
			return {
				...state,
				profilePubkey: data.pubkey
			};

		default:
			return state;
	}
};
