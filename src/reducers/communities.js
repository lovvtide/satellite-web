import { nip19 } from 'nostr-tools';

import {
	RECEIVE_COMMUNITY_EVENT,
	RECEIVE_COMMUNITY_METADATA,
	RECEIVE_COMMUNITY_POST,
	RECEIVE_COMMUNITY_POST_APPROVAL,
	RECEIVE_COMMUNITY_FOLLOWING_LIST,
	RECEIVE_COMMUNITY_FOLLOWING_LIST_COUNT,
	COMMUNITY_INDEX_EOSE,
	SET_COMMUNITIES_NAV_MODE
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
			} else if (tag[0] === 'rank_mode') {
				item.rankMode = tag[1];
			} else if (tag[0] === 'rank_batch') {
				item.rankBatch = parseInt(tag[1]);
			}
		}
	//}

	return item;
};

// Deduplicate and sort list of replacable community events
const receiveCommunityEvent = (state, { event, pubkey }) => {

	const d = getIdentifier(event);
	const existing = state.list[`${event.pubkey}:${d}`];
	const add = {};

	if (
		!existing
		|| (
			existing.event.created_at < event.created_at
			&& existing.event.pubkey === event.pubkey
			&& d === getIdentifier(existing.event)
		)
	) {

		add[`${event.pubkey}:${d}`] = contextualize(event, { pubkey });
	}

	return {
		...state,
		list: {
			...state.list,
			...add
		}
	};
};

const receiveCommunityPostApproval = (state, { event }) => {

	let coord;

	for (let tag of event.tags) {
		if (tag[0] === 'a') {
			coord = tag[1];
		}
	}

	if (coord && !state.activeTimestamp[coord] || state.activeTimestamp[coord] < event.created_at) {

		return {
			...state,
			activeTimestamp: {
				...state.activeTimestamp,
				[coord]: event.created_at
			}
		};
	}

	return state;
};

const receiveCommunityPost = (state, { events }) => {

	const coord = ({ tags }) => {

		let e, a;

		for (let tag of tags) {
			if (tag[0] === 'e') {
				e = tag[1];
			} else if (tag[0] === 'a') {
				a = tag[1]
			}
		}

		if (e && a) {
			return `${e}:${a}`;
		}
	};

	const modqueue = {};
	const approvals = {};

	for (let event of events) {

		if (event.kind === 4550) {

			const c = coord(event);

			if (!approvals[c]) {
				approvals[c] = [];
			}

			let add = true;

			for (let _approval of approvals[c]) {
				if (_approval.id === event.id) {
					add = false;
					break;
				}
			}

			if (add) {
				approvals[c].push(event);
			}

		} else {

			for (let tag of event.tags) {

				if (tag[0] === 'a') {

					const _a = tag[1].split(':');

					modqueue[`${event.id}:${tag[1]}`] = {
						event,
						coord: `${event.id}:${tag[1]}`,
						postedTo: {
							owner: nip19.npubEncode(_a[1]),
							name: tag[1].slice(tag[1].lastIndexOf(':') + 1)
						}
					};
				}
			}
		}
	}

	let update = {};

	if (Object.keys(modqueue).length > 0) {
		update = {
			...update,
			modqueue: {
				...state.modqueue,
				...modqueue
			}
		}
	}

	if (Object.keys(approvals).length > 0) {
		update = {
			...update,
			approvals: {
				...state.approvals,
				...approvals
			}
		}
	}

	return Object.keys(update).length > 0 ? {
		...state,
		...update
	} : state;
};

const receiveCommunityFollowingList = (state, { event }) => {

	if (event.created_at > state.followingListTimestamp) {

		const update = {
			followingListTimestamp: event.created_at,
			followingList: {}
		};

		for (let tag of event.tags) {

			if (tag[0] === 'a') {
				update.followingList[tag[1]] = true;
			}
		}

		return {
			...state,
			...update
		};
	}

	return state;
};

const countCommunityFollowers = (state, { event }) => {

	const c = state.followingMap;

	for (let tag of event.tags) {

		if (tag[0] === 'a') {

			const a = tag[1];

			if (!c[a]) {
				c[a] = {};
			}

			c[a][event.pubkey] = true;
		}
	}

	return { ...state, followingMap: c };
};

const INITIAL_STATE = {
	forks: {},
	list: {},
	approvals: {},
	modqueue: {},
	metadata: {},
	followingList: {},
	activeTimestamp: {},
	followingListTimestamp: 0,
	followingMap: {},
	eoseCount: 0,
	navMode: 'active'
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case SET_COMMUNITIES_NAV_MODE:
			return {
				...state,
				navMode: data.mode
			};

		case RECEIVE_COMMUNITY_FOLLOWING_LIST_COUNT:
			return countCommunityFollowers(state, data);

		case RECEIVE_COMMUNITY_POST_APPROVAL:
			return receiveCommunityPostApproval(state, { event: data });

		case RECEIVE_COMMUNITY_FOLLOWING_LIST:
			return receiveCommunityFollowingList(state, data);

		case RECEIVE_COMMUNITY_POST:
			return receiveCommunityPost(state, data);

		case RECEIVE_COMMUNITY_EVENT:
			return receiveCommunityEvent(state, data);

		case RECEIVE_COMMUNITY_METADATA:
			return {
				...state,
				metadata: {
					...state.metadata,
					[data.pubkey]: data.profile
				}
			};

		case COMMUNITY_INDEX_EOSE:
			return {
				...state,
				forks: data.forks,
				eoseCount: state.eoseCount + 1
			};

		default:
			return state;
	}
};
