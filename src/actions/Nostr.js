import axios from 'axios';
import { Buffer } from 'buffer';
import { bech32 } from 'bech32';
import { requestProvider } from 'webln';
import { nip04, nip19, getPublicKey } from 'nostr-tools';
import Feed from '../modules/Feed';

import { DEFAULT_RELAYS, FEATURED_AUTHORS } from '../constants';
import { navigate } from './Layout';


// Try to get locally stored nostr private key
export const getLocalPrivateKey = () => {

	let privateKey = window._nostr_sk;

	if (!privateKey && window.localStorage) {

		privateKey = window.localStorage.getItem('nostr_sk');
	}

	return privateKey || '';
};

export const getLocalPublicKey = () => {

	let pubkey = window._nostr_pk;

	if (!pubkey && window.localStorage) {

		pubkey = window.localStorage.getItem('nostr_pk');
	}

	return pubkey || '';
};

// Store private key and derived pubkey in local storage
export const setLocalPrivateKey = (privateKey) => {

	window._nostr_sk = privateKey;

	if (window.localStorage) {

		try {

			window.localStorage.setItem('nostr_sk', privateKey);
		
		} catch (err) {}
	}

	setLocalPublicKey(getPublicKey(privateKey));
};

export const setLocalPublicKey = (pubkey) => {

	window._nostr_pk = pubkey;

	if (window.localStorage) {

		try {

			window.localStorage.setItem('nostr_pk', pubkey);
		
		} catch (err) {}
	}
};

export const REVOKE_DEVICE_AUTH = 'REVOKE_DEVICE_AUTH';
export const revokeDeviceAuth = (alias, options) => {

	return (dispatch) => {

		delete window._nostr_pk;
		delete window._nostr_sk;

		if (window.localStorage) {

			window.localStorage.removeItem('nostr_pk');
			window.localStorage.removeItem('nostr_sk');
		}

		dispatch({ type: REVOKE_DEVICE_AUTH });
	}
};

export const SHOW_ZAP_REQUEST = 'SHOW_ZAP_REQUEST';
export const handleZapRequest = (recipient = {}, event = {}, handlers = {}) => {

	return async (dispatch) => {

		const { lud06, lud16 } = recipient;

		let lnurl, request;

	  try {

	    if (lud06) {

	      const { words } = bech32.decode(lud06, 1000);
	      const data = bech32.fromWords(words);

	      lnurl = Buffer.from(data).toString();

	    } else if (lud16) {

	      const [ name, domain ] = lud16.split('@');

	      lnurl = `https://${domain}/.well-known/lnurlp/${name}`;
	    }

	  } catch (err) { // Failed to parse lnurl
	  	console.log('err', err);
	  }

	  if (lnurl) {

		  try {

		    const resp = await fetch(lnurl);

		    request = await resp.json();

		  } catch (err) { // Network error
		  	console.log('err', err);
		  }

		  if (request && request.allowsNostr && request.nostrPubkey) {

			  // Open zap request dialog in the UI
			  dispatch({
			  	type: SHOW_ZAP_REQUEST,
			  	data: { request, recipient, event }
			  });
		  }
	  }

  	if (handlers.onResolve) {
  		handlers.onResolve();
  	}
	};
};

export const dismissZapRequest = () => {
	return { type: SHOW_ZAP_REQUEST, data: null };
};

// Create a 9734 event and send it to the ln server
export const getZapInvoice = async (params) => {

	if (params.relays.length === 0) { return; }

	if (isNaN(parseInt(params.amount))) { return; }

	const millisats = parseInt(params.amount) * 1000;

	const tags = [
		[ 'relays', ...params.relays ],
		[ 'amount', String(millisats) ],
		[ 'p', params.pubkey ]
	];

	if (params.event) {

		tags.push([ 'e', params.event ]);
	}

	let event;

	try {

		event = await window.client.createEvent({
			content: (params.note || '').trim(),
			kind: 9734,
			tags
		}, {
			privateKey: getLocalPrivateKey()
		});

	} catch (err) {};

  if (!event) { return; }

  let invoice;

  try {

  	const resp = await axios.get(params.url + `?amount=${millisats}&nostr=${encodeURIComponent(JSON.stringify(event))}`);

  	invoice = resp.data;

  } catch (err) {

  	console.log('err fetching invoice', err);
  }

  return invoice;
};

export const payWithLightningWallet = async (params) => {

	let webln;

	try {

		webln = await requestProvider();

	} catch (err) {
		console.log(err);
	}

	if (webln) {

		try {

			await webln.sendPayment(params.invoice);

		} catch (err) {
			console.log(err);
		}
	}

	return;
};

export const SET_ACTIVE_DM_CHAT = 'SET_ACTIVE_DM_CHAT';
export const SET_ACTIVE_DM_CHAT_READY = 'SET_ACTIVE_DM_CHAT_READY';
export const setActiveDirectMessageChat = (chat) => {

	return (dispatch) => {

		dispatch({ type: SET_ACTIVE_DM_CHAT, data: { chat } });

		if (chat) {

			setTimeout(() => {
				dispatch({ type: SET_ACTIVE_DM_CHAT_READY });
			}, 100);
		}
	};
};

export const DECRYPT_DM = 'DECRYPT_DM';
export const decryptDirectMessage = (input, params) => {

	return async (dispatch) => {

		const events = Array.isArray(input) ? input : [ input ];

		const localPrivateKey = getLocalPrivateKey();

		const data = [];

		for (let event of events) {

			let decrypted, receiver;

			for (let tag of event.tags) {
				if (tag[0] === 'p') {
					receiver = tag[1];
					break;
				}
			}

			if (window.nostr) {

				try {

					decrypted = await window.nostr.nip04.decrypt(
						event.pubkey === params.pubkey ? receiver : event.pubkey,
						event.content
					);

				} catch (err) {

					console.log('Failed to decrypt message ' + event.id, err);
				}

			} else {

				try {

					// TODO test this to make sure it works
					decrypted = await nip04.decrypt(
						localPrivateKey,
						event.pubkey === params.pubkey ? receiver : event.pubkey,
						event.content
					);
						
				} catch (err) {

					//alert(err);
				}

			}

			if (!decrypted) {

				// TODO dispatch "failed to decrypt" action

				continue;
			}

			data.push({
				id: event.id,
				decrypted
			});
		}

		dispatch({
			type: DECRYPT_DM,
			data
		});
	};
};

export const RECEIVE_DM = 'RECEIVE_DM';
export const receiveDM = (data) => {
	return { type: RECEIVE_DM, data };
};

export const SET_PENDING_CONTACTS = 'SET_PENDING_CONTACTS';
export const LOAD_ACTIVE_NOSTR = 'LOAD_ACTIVE_NOSTR';
export const RECEIVE_DM_METADATA = 'RECEIVE_DM_METADATA';
export const RECEIVE_COMMUNITY_EVENT = 'RECEIVE_COMMUNITY_EVENT';
export const RECEIVE_COMMUNITY_METADATA = 'RECEIVE_COMMUNITY_METADATA';
export const loadActiveNostr = (callback) => { // load active address / alias

	return async (dispatch, getState) => {

		let pubkey, privateKey;

		// Check for saved private key first
		privateKey = getLocalPrivateKey();

		// If found, use it to derive public key
		if (privateKey) {

			pubkey = await getPublicKey(privateKey);

		} else { // Private key not found

			// Check for saved local public key
			pubkey = getLocalPublicKey();
		}

		// Only continue with loading profile data
		// if public key was able to be identified
		// Set the frontpage mode to show featured
		if (!pubkey) {

			dispatch(setFrontpageMode('featured'));
			return;

		} else {

			const { mode } = getState().nostr;

			if (!mode) {

				dispatch({ type: SET_PENDING_CONTACTS });
			}
		}

		dispatch({
			type: LOAD_ACTIVE_NOSTR,
			data: { pubkey, privateKey }
		});

		dispatch(nostrProfileInit(window.client.listenForProfile(pubkey, {

			onCommunity: (event) => {

				dispatch({
					type: RECEIVE_COMMUNITY_EVENT,
					data: { event, pubkey }
				});
			},

			onDM: (event) => {

				dispatch(receiveDM(event));
			},

			onWildcardMetadata: (_pubkey, metadata) => {

				dispatch({
					type: RECEIVE_DM_METADATA,
					data: {
						pubkey: _pubkey,
						metadata
					}
				});

			},

			// Got kind 0 metadata
			onMetadata: (metadata) => {

				dispatch(resolvedNostrMetadata({
					pubkey,
					metadata
				}));
			},

			// Got kind 3 contacts
			onContacts: ({ contacts, content }) => {

				let userRelays;

				try {

					const parsed = JSON.parse(content);

					if (typeof parsed === 'object') {

						userRelays = Object.keys(parsed).filter(url => {
							return url.indexOf('ws') === 0 && url.indexOf('://') !== -1;
						});
					}

				} catch (err){
					//console.log(err);
				}

				if (userRelays) {
					connectToRelays(userRelays, { maintain: true });
				}

				const _contacts = contacts.filter(p => {
					return p !== pubkey;
				});

				dispatch(resolvedNostrContacts({
					contacts: _contacts,
					content,
					pubkey
				}));

				// If the frontpage mode is not already set,
				// initialize it as soon as user's following
				// list is available
				const { mode } = getState().nostr;

				if (!mode) {

					dispatch(setFrontpageMode('following'/*, { pendingContacts: _contacts.length === 0 }*/));
				}
			},

			onContactMetadata: (contact, metadata) => {

				dispatch(resolvedContactMetadata({
					pubkey: contact,
					metadata
				}));
			}

		})));

		if (typeof callback === 'function') {

			callback();
		}
	};
};

export const connectToRelays = (relays, params = {}) => {

	for (let url of relays) {

		try {

			// Connect to Satellite relay
			window.client.connectToRelay({ url, ...params });

		} catch (err) {

			console.log(err);
		}
	}
};

export const RELAY_STATUS = 'RELAY_STATUS';
export const RELAY_CLOSE = 'RELAY_CLOSE';
export const NOSTR_MAIN_INIT = 'NOSTR_MAIN_INIT';
export const RELAY_CONNECTED = 'RELAY_CONNECTED';
export const SHOW_NAV_ACTIONS = 'SHOW_NAV_ACTIONS';
export const nostrMainInit = () => {

	return (dispatch, getState) => {

		window.client.listenForRelayStatus((relay, status) => {

			if (status.close) {

				dispatch({ type: RELAY_CLOSE, data: relay });

			} else {

				dispatch({ type: RELAY_STATUS, data: { relay, status } });
			}

		});

		// Connect to default relays
		connectToRelays(DEFAULT_RELAYS, { maintain: true });

		const main = new Feed();
		
		main.listenForEose((relay, options) => {

			if (options.subscription.indexOf('post_') === 0) {

				const unknown = main.unknown(relay, main.authors());

				if (unknown.length > 0) {

					main.subscribe(`frontpage_metadata`, relay, [{
						authors: unknown,
						kinds: [ 0 ]
					}]);
				}

				const rootId = options.subscription.slice(5);
				const rootItem = main.items[rootId];

				if (rootItem && rootItem.replies) {

					main.subscribe(`thread_quoted_${rootId}`, relay, [{
						ids: window.client.getThreadRefs(rootItem)
					}]);
				}

				return;
			}

			if (options.subscription === 'community_index') {

				main.listenForMetadata('*', (pubkey, profile) => {

					dispatch({
						type: RECEIVE_COMMUNITY_METADATA,
						data: {
							pubkey,
							profile
						}
					});

				});

				const { communities } = getState();

				main.subscribe(`community_index_metadata`, relay, [{
					authors: communities.list.map(item => {
						return item.event.pubkey;
					}),
					kinds: [ 0 ]
				}]);

				return;
			}

			// Only create secondary subscriptions when
			// the end of the primary feed is reached
			if (options.subscription.indexOf('frontpage_primary') !== 0) { return; }

			const primaryFeedInfo = window.client.subscriptions[options.subscription];

			if (!primaryFeedInfo) { return; }

			let surface;
			let listMode;

			if (options.subscription === 'frontpage_primary_featured') {

				surface = FEATURED_AUTHORS;
				listMode = 'featured';

			} else if (options.subscription === 'frontpage_primary_following') {

				const { nostr } = getState();

				if (!nostr.pubkey) { return; }

				surface = Object.keys(nostr.contacts[nostr.pubkey] || {});
				listMode = 'following';
			}

			if (!surface || surface.length === 0) { return; }

			const { until } = primaryFeedInfo.filters[0];

			const ref = window.client.contextRef(Object.keys(main.items).map(id => {

				return main.items[id];

			}).filter(item => {

				//console.log('listmode', listMode, item.labels);

				if (item.labels && !item.labels[listMode]) { return false; }

				if (surface.indexOf(item.event.pubkey) === -1) {
					return false;
				}

				if (until && item.event.created_at >= until) {
					return false;
				}

				return true;

			}).map(item => {
				return item.event;
			}), { rootOnly: true }, main.items);

			const filters = window.client.contextFilters(main, relay, ref);

			if (filters.length > 0) {

				//console.log('context filters', filters);

				main.subscribe(`context_${options.subscription}`, relay, filters, {
					listMode
				});
			}
		});

		main.listenForCommunity(community => {

			dispatch({
				type: RECEIVE_COMMUNITY_EVENT,
				data: { event: community }
			});

			// dispatch({
			// 	type: DETECTED_COMMUNITY
			// })

		});

		dispatch({ type: NOSTR_MAIN_INIT, data: { main } });

		dispatch(loadActiveNostr());

		//const { active } = getState();

		setTimeout(() => {
			dispatch({ type: SHOW_NAV_ACTIONS });
		}, 1500);
	};
};

export const SET_ROOT_POST_ITEM = 'SET_ROOT_POST_ITEM';
export const rootPostItem = (data) => {
	return { type: SET_ROOT_POST_ITEM, data };
};

export const SET_ROOT_POST_AUTHOR = 'SET_ROOT_POST_AUTHOR';
export const rootPostAuthor = (data) => {
	return { type: SET_ROOT_POST_AUTHOR, data };
};

export const NOSTR_PROFILE_INIT = 'NOSTR_PROFILE_INIT';
export const nostrProfileInit = (feed) => {
	return { type: NOSTR_PROFILE_INIT, data: { feed } };
};

export const SET_FRONTPAGE_MODE = 'SET_FRONTPAGE_MODE';
export const setFrontpageMode = (mode, options = {}) => {

	return (dispatch, getState) => {

		const { nostr } = getState();

		let surface;

		if (mode === 'featured') {

			surface = FEATURED_AUTHORS;

		} else if (mode === 'following') {

			if (!nostr.pubkey) {

				dispatch({ type: SET_FRONTPAGE_MODE, data: { mode } });
				return;
			}

			surface = Object.keys(nostr.contacts ? nostr.contacts[nostr.pubkey] || {} : {});
		}

		nostr.main.surface = surface;

		dispatch({ type: SET_FRONTPAGE_MODE, data: { mode, ...options } });
	};
};

// Create subscription for top/sub feeds
export const loadFrontpageNostr = (feed, params) => {

	// Don't create a duplicate of the primary feed
	if (window.client.subscriptions[params.name]) {
		return;
	}

	window.client.subscribe(params.name, feed, [{
		authors: params.surface,
		kinds: [ 1 ],
		limit: 175
	}, {
		authors: params.surface,
		kinds: [ 0 ]
	}], {
		listMode: params.listMode,
		surface: params.surface
	});
};

export const QUERY_PROFILES = 'QUERY_PROFILES';
export const queryProfiles = (params) => {

	return (dispatch, getState) => {

		if (!params) {

			dispatch({ type: QUERY_PROFILES });
			return;
		}

		const { nostr } = getState();
		const { contactMetadata, main, prof } = nostr;

		const match = (s) => {
			return s.toLowerCase().indexOf(params.term.toLowerCase()) !== -1;
		};

		const m = {};
		const r = [];

		for (let pubkey of Object.keys(contactMetadata || {})) {
			if (!m[pubkey]) {
				m[pubkey] = contactMetadata[pubkey];
			}
		}

		for (let feed of [ main, prof, ...(params.feeds || []) ]) {

			if (!feed) { continue; }

			for (let pubkey of Object.keys(feed.metadata)) {
				if (!m[pubkey]) {
					m[pubkey] = feed.metadata[pubkey].profile;
				}
			}
		}

		for (let pubkey of Object.keys(m)) {

			const npub = nip19.npubEncode(pubkey);
			const profile = m[pubkey];
			const result = {};

			let include;

			if (npub === params.term || pubkey === params.term) {

				result.name = profile.display_name || profile.displayName || profile.name || profile.username;
				include = true;

			} else {

				for (let item of [ 'display_name', 'displayName', 'name', 'username' ]) {
					if (profile[item] && match(profile[item])) {
						result.name = profile[item];
						include = true;
						break;
					}
				}
			}

			if (profile.picture) {

				result.picture = profile.picture;
			}

			if (profile.nip05) {

				if (!include) {

					include = match(profile.nip05.split('@')[0]);
				}

				result.nip05 = profile.nip05;
			}

			if (profile.about) {

				result.about = profile.about
			}

			if (!include) { continue; }

			result.npub = npub;

			r.push(result);
		}

		dispatch({ type: QUERY_PROFILES, data: { results: r, context: params.context } });

	};
};

export const nostrFollow = (target, follow) => {

	return async (dispatch, getState) => {

		const { nostr } = getState();

		if (!nostr.pubkey) { return; }

		let contacts = [ nostr.pubkey ];

		if (nostr.contacts && nostr.contacts[nostr.pubkey]) {
			contacts = Object.keys(nostr.contacts[nostr.pubkey]);
		}

		if (follow) { // Follow

			if (contacts.indexOf(target) === -1) { // Not already following

				contacts.push(target); // Add target

			} else { // Already following, terminate
				return;
			}

		} else { // Unfollow

			if (contacts.indexOf(target) !== -1) { 

				// Remove target from contacts
				contacts = contacts.filter(p => {
					return p !== target;
				});

			} else { // Not following, terminate
				return;
			}
		}

		if (contacts.indexOf(nostr.pubkey) === -1) {
			contacts.unshift(nostr.pubkey);
		}

		handleNostrPublish({
			kind: 3,
			content: nostr.type3Content || ''
		}, { contacts }, nostr.prof ? [ nostr.prof ] : []);
	};

};

export const handleNostrPublish = async (post, params, feeds = [], attached = {}) => {

	let data;

	if (typeof post.kind === 'undefined' || post.kind === 1) { // Default text note

		data = await window.client.type1(post, params, attached);

		const mediaItems = Object.keys(attached).map(filename => {
			return attached[filename];
		});

		for (let item of mediaItems) {

			window.client.publishEvent(item.event, (status, relay) => {
			});

			// Update local feeds with new event
			// before sending out to relays
			for (let feed of feeds) {

				if (!feed) { continue; }

				feed.update(item.event, null, { newpub: true });
			}
		}

	} else if (post.kind === 3) {

		data = await window.client.type3(post, params);

	} else if (post.kind === 6) { // Repost

		data = await window.client.type6(post, params);

	} else if (post.kind === 7) {

		data = await window.client.type7(post, params);

	} else if (post.kind === 5) { // Delete

		data = await window.client.type5(post, params);

	} else if (post.kind === 0) { // Metadata

		data = await window.client.type0(post);

	} else if (post.kind === 34550) { // Community definition

		data = await window.client.type34550(post, params);		
	}

	const event = await window.client.createEvent(data, {
		privateKey: getLocalPrivateKey()
	});

	if (!event) { return; }

	// Update local feeds with new event
	// before sending out to relays
	for (let feed of feeds) {

		if (!feed) { continue; }

		feed.update(event, null, { newpub: true });
	}

	return new Promise((resolve, reject) => {

		window.client.publishEvent(event, (status, relay) => {

			if (status === 'ok' || status === 'seen') {

				resolve();

			} else if (status === 'failed') {

				//reject();
			}

		});
	});
};

export const RESOLVED_NOSTR_METADATA = 'RESOLVED_NOSTR_METADATA';
export const resolvedNostrMetadata = (data) => {
	return { type: RESOLVED_NOSTR_METADATA, data };
};

export const RESOLVED_NOSTR_CONTACTS = 'RESOLVED_NOSTR_CONTACTS';
export const resolvedNostrContacts = (data) => {
	return { type: RESOLVED_NOSTR_CONTACTS, data };
};

export const RESOLVED_CONTACT_METADATA = 'RESOLVED_CONTACT_METADATA';
export const resolvedContactMetadata = (data) => {
	return { type: RESOLVED_CONTACT_METADATA, data };
};

export const SET_PROFILE_PUBKEY = 'SET_PROFILE_PUBKEY';
export const setProfilePubkey = (pubkey) => {
	return { type: SET_PROFILE_PUBKEY, data: { pubkey } }
};

// Open the reply modal
export const OPEN_REPLY_MODAL = 'OPEN_REPLY_MODAL';
export const openReplyModal = (data) => {

	return (dispatch, getState) => {

		const { nostr } = getState();

		if (nostr.pubkey) {
			dispatch({ type: OPEN_REPLY_MODAL, data });
		} else {
			dispatch(navigate(`/register`));
		}
	};
};

export const SET_NEW_POST_MODAL_OPEN = 'SET_NEW_POST_MODAL_OPEN';
export const setNewPostModalOpen = (open) => {
	return { type: SET_NEW_POST_MODAL_OPEN, data: { open } };
};
