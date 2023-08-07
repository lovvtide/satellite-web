import { nip05, nip19, relayInit, getPublicKey, getEventHash, signEvent } from 'nostr-tools';

import Feed from './Feed';


class Client {

	constructor (env) {

		// Save reference to env interface (i.e. window)
		this.env = env;

		// Pool of connected relays
		this.relays = [];

		// Registered feeds
		this.subscriptions = {};
	}


	/* Core API */

	async disconnectFromRelay (params) {
		
		const url = params.url[params.url.length - 1] === '/' ? params.url.slice(0, -1) : params.url;

		// Prevent opening duplicate connection
		for (let _relay of this.relays) {

			if (_relay.url === url) {

				_relay.close();

				this.relays = this.relays.filter(item => {
					return url !== item.url;
				});

				if (this.relayStatusListener) {

					this.relayStatusListener({ url: params.url }, {
						close: true
					});
				}

				return;
			}
		}

	}

	// Connect to a relay
	async connectToRelay (params) {

		const url = params.url[params.url.length - 1] === '/' ? params.url.slice(0, -1) : params.url;

		// Prevent opening duplicate connection
		for (let _relay of this.relays) {

			if (_relay.url === url) {

				if (this.relayStatusListener && params.maintain) {
					this.relayStatusListener({ url: params.url }, { maintain: true });
				}

				return;
			}
		}

		let relay;

		try {

			relay = relayInit(url);

		} catch (err) {

		}

		relay.on('connect', () => {

			clearTimeout(relay._reconnectTimeout);
			relay._encounteredError = false;
			relay._reconnectMillsecs = 500;

			if (this.relayStatusListener) {

				const onConnectStatus = {
					error: false,
					connected: true,
					connecting: false
				};

				if (params.maintain) {

					onConnectStatus.maintain = true;
				}

				this.relayStatusListener(relay, onConnectStatus);
			}

			Object.keys(this.subscriptions).forEach(name => {

				const { feed, filters, options } = this.subscriptions[name];

				feed.subscribe(name, relay, filters, options);
			});
		});

		relay.on('error', () => {

			//console.log(`failed to connect to ${relay.url}`);

			relay._encounteredError = true;

			if (this.relayStatusListener) {

				this.relayStatusListener(relay, {
					connecting: false,
					connected: false,
					error: true
				});
			}

			if (relay._pendingReconnect) { return; }

			if (!relay._reconnectMillsecs) {

				relay._reconnectMillsecs = 500;
			}

			relay._reconnectMillsecs = relay._reconnectMillsecs * 2;

			clearTimeout(relay._reconnectTimeout);

			relay._pendingReconnect = true;

			// Attempt reconnect with an exponential backoff to avoid DDOSing relays
			relay._reconnectTimeout = setTimeout(async () => {

				relay._pendingReconnect = false;

				try {
					await relay.connect();
				} catch (err) {}

				relay._pendingReconnect = false;

			}, relay._reconnectMillsecs);

			//console.log(relay.url + ' reconnecting after ' + relay._reconnectMillsecs + ' ms. . .');

		});

		relay.on('disconnect', async () => {

			this.relayStatusListener(relay, {
				connected: false,
				connecting: true
			});

			if (!relay._encounteredError) {

				try {
					//console.log(relay.url + ' reconnecting. . .');
					await relay.connect();
				} catch (err) {}
			}

		});

		try {

			await relay.connect();

		} catch (err) {
			
		}

		this.relays.push(relay);
	}

	async createEvent (data, options = {}) {

		let event = {
			created_at: Math.floor(Date.now() / 1000),
			...data
		};

		if (options.privateKey) {

			const pubkey = getPublicKey(options.privateKey);

			if (event.pubkey && event.pubkey !== pubkey) {
				throw Error('Public key conflicts with existing');
			}

			event.pubkey = pubkey;
			event.id = getEventHash(event);
			event.sig = signEvent(event, options.privateKey);

		} else if (this.env.nostr) {

			event = await this.env.nostr.signEvent(event);

		} else {

			throw Error('Expected private key or external interface');
		}

		return event;
	}

	publishEvent (event, handleStatus) {

		// Send the event to each relay and
		// listen for status messages
		this.relays.forEach(relay => {

			const pub = relay.publish(event);

			for (let status of [ 'ok' ]) {
				
				pub.on(status, () => {

					handleStatus(status, relay);
				});
			}
		});
	}

	// Create ephemeral auth event per NIP-42
	createAuth ({ relay, challenge }, options = {}) {

		return this.createEvent({
			kind: 22242,
			content: '',
			tags: [
				['relay', relay],
				['challenge', challenge]
			]
		}, options);
	}

	registerFeed (name, feed, filters, options) {

		this.subscriptions[name] = { feed, filters, options };
	}

	unregisterFeed ({ id }) {

		let name;

		for (let key of Object.keys(this.subscriptions)) {

			const { feed } = this.subscriptions[key];

			if (feed.id === id) {
				name = key;
				break;
			}
		}

		if (name) {

			delete this.subscriptions[name];
		}
	}

	listenForRelayStatus (handler) {

		this.relayStatusListener = handler;
	};

	/* Get pubkey's metadata and contacts */
	listenForProfile (pubkey, handlers) {

		const feed = new Feed();

		const profileFeedName = `profile_${pubkey}`;
		const messageFeedName = `message_${pubkey}`;
		const notificationsFeedName = `notifications_${pubkey}`;

		// Listen for user's metadata
		if (handlers.onMetadata) {
			feed.listenForMetadata(pubkey, handlers.onMetadata);
		}

		// Listen for DM metadata too
		if (handlers.onWildcardMetadata) {

			feed.listenForMetadata('*', handlers.onWildcardMetadata);
		}

		if (handlers.onDM) {

			feed.listenForDM(handlers.onDM);
		}

		if (handlers.onCommunity) {

			feed.listenForCommunity(handlers.onCommunity)
		}

		if (handlers.onLoadedCommunityFollowingList) {

			feed.listenForCommunityFollowingList(handlers.onLoadedCommunityFollowingList);
		}

		// Listen for user's contacts
		feed.listenForContacts(pubkey, ({ contacts, content }) => {

			// When contacts are received, maybe also listen for
			// the metadata for each contact so the app can display
			// a profile and name in following list instead of just a key
			if (contacts.length > 0 && handlers.onContactMetadata) {

				for (let contact of contacts) {

					if (contact === pubkey) { continue; }

					// Pass the contact and its metadata to the handler
					feed.listenForMetadata(contact, metadata => {
						handlers.onContactMetadata(contact, metadata);
					});
				}

				this.subscribe(`contacts_metadata_${pubkey}`, feed, [{
					kinds: [ 0 ],
					authors: contacts.filter(contact => {
						return contact !== pubkey;
					})
				}]);
			}

			// Pass contact list to handler
			if (handlers.onContacts) {
				handlers.onContacts({ contacts, content });
			}

		});

		let communityIds = [];

		const detectNotification = (event) => {

			if (event.pubkey === pubkey) {
				return false;
			}

			if (([ 1, 6, 7 ]).indexOf(event.kind) === -1) {
				return false;
			}

			let notify;

			for (let tag of event.tags) {

				if (tag[0] === 'p' && tag[1] === pubkey) {
					return true;
				}
			}

			return false;
		};

		const detectCommunityPost = (event, cids) => {

			if (event.kind === 1 || event.kind === 4550) {

				for (let tag of event.tags) {

					if (tag[0] === 'a' && cids.indexOf(tag[1]) !== -1) {
						return true;
					}
				}
			}

			return false;
		};

		// Listen for end of saved direct messages
		feed.listenForEose((relay, options) => {

			if (options.subscription === profileFeedName) {

				communityIds = feed.list().filter(item => {
					return item.event.kind === 34550;
				}).map(item => {
					for (let tag of item.event.tags) {
						if (tag[0] === 'd') {
							return `34550:${item.event.pubkey}:${tag[1]}`;
						}
					}
				}).filter(id => {
					return id;
				});

				const now = Math.floor(Date.now() / 1000);

				// Pull notifications for user
				// this.subscribe(notificationsFeedName, feed, [{
				// 	kinds: [ 1, 6, 7 ],
				// 	'#p': [ pubkey ],
				// 	since: now - (86400 * 5)
				// }, {
				// 	kinds: [ 1, 4550 ],
				// 	'#a': communityIds,
				// 	since: now - (86400 * 5)
				// }]);

				feed.subscribe(notificationsFeedName, relay, [{
					kinds: [ 1, 7 ],
					'#p': [ pubkey ],
					since: now - (86400 * 5)
				}, {
					kinds: [ 1, 6, 7 ],
					authors: [ pubkey ],
					since: now - (86400 * 5)
				}, {
					kinds: [ 1, 4550 ],
					'#a': communityIds,
					since: now - (86400 * 5)
				}]);

				// this.subscribe(modqueFeedName, feed, [{
				// 	kinds: [ 1, 4550 ],
				// 	'#a': communityIds
				// }]);

			} else if (options.subscription === 'notifications_context') {

				const filters = [];
				const uniqueE = {};
				const uniqueP = {};

				const assignPubkey = (p) => {

					if (p && !feed.metadata[p]) {
						uniqueP[p] = true;
					}
				};

				const assignEventId = (e) => {

					if (e && (!feed.items[e] || feed.items[e].phantom)) {
						uniqueE[e] = true;
					}
				};

				for (let item of feed.list()) {

					const { ereply } = item;

					assignEventId(ereply);

					assignPubkey(item.event.pubkey);

					if (item.event.tags) {

						for (let tag of item.event.tags) {

							if (tag[0] === 'p') {
								assignPubkey(tag[1]);
							} else if (tag[0] === 'e' || tag[0] === 'q') {
								assignEventId(tag[1]);
							}
						}
					}

					if (item.event.content) {

						for (let _e of Object.keys(this.parseContentRefs(item.event.content)['e'])) {
							assignEventId(_e);
						}
					}
				}

				if (Object.keys(uniqueE).length > 0) {

					filters.push({
						ids: Object.keys(uniqueE)
					});
				}

				if (Object.keys(uniqueP).length > 0) {

					filters.push({
						authors: Object.keys(uniqueP),
						kinds: [ 0 ]
					});
				}

				if (filters.length > 0) {

					feed.subscribe(`notifications_context_extra`, relay, filters);
				}

			} else if (options.subscription === notificationsFeedName) {

				/* After initial batch of notifications
				is loaded, listen for additional */

				setTimeout(() => {

					if (!feed.eventListener) {

						feed.listenForEvent(event => {

							if (feed.items[event.id]) { return; }

							if (detectNotification(event)) {
								handlers.onNotify([ event ]);
							}

							if (detectCommunityPost(event, communityIds)) {
								handlers.onCommunityPost([ event ]);
							}

						});

						const listed = feed.list().map(item => {
							return item.event;
						});

						handlers.onNotify(listed.filter(event => {
							return detectNotification(event);
						}));

						handlers.onCommunityPost(listed.filter(event => {
							return detectCommunityPost(event, communityIds);
						}));
					}

					if (handlers.onLoadedModqueue) {

						handlers.onLoadedModqueue(feed, relay);
					}

				}, 1500);

			} else if (options.subscription === messageFeedName) {

				const p = {};

				for (let _id of Object.keys(feed.dms)) {

					const _message = feed.dms[_id];

					if (_message.pubkey !== pubkey) {
						p[_message.pubkey] = true;
					}

					for (let tag of _message.tags) {
						if (tag[0] === 'p' && tag[1] !== pubkey) {
							p[tag[1]] = true;
						}
					}
				}

				// this.subscribe(`dm_metadata_${pubkey}`, feed, [{
				// 	kinds: [ 0 ],
				// 	authors: Object.keys(p)
				// }]);

				feed.subscribe(`dm_metadata_${pubkey}`, relay, [{
					kinds: [ 0 ],
					authors: Object.keys(p)
				}]);
			}

		});

		// Pull metadata, contacts, communities, for user
		this.subscribe(profileFeedName, feed, [{
			authors: [ pubkey ],
			kinds: [ 0, 3, 34550, 30001 ]
		}, {
			'#p': [ pubkey ],
			kinds: [ 34550 ]
		}]);

		// Pull direct messages for user
		this.subscribe(messageFeedName, feed, [{
			'#p': [ pubkey ],
			kinds: [ 4 ],
			limit: 1000
		}, {
			authors: [ pubkey ],
			kinds: [ 4 ],
			limit: 1000
		}]);

		return feed;

	};

	/* Create a feed to display a user's profile */
	createProfileFeed (params, onEose, contacts = {}, handlers = {}) {

		const feed = new Feed({
			profile: { pubkey: params.pubkey }
		});

		let profileContacts = [];

		const primaryFeedName = `profile_primary_${params.pubkey}`;
		const contextFeedName = `profile_context_${params.pubkey}`;
		const quotedFeedName = `profile_quoted_${params.pubkey}`;

		const parsedEventId = {};
		const didParseEvent = {};

		// Listen for user's contacts
		feed.listenForContacts(params.pubkey, ({ contacts }) => {

			if (contacts.length > 0) {
				profileContacts = contacts;
			}
		});

		feed.listenForEose((relay, options) => {

			if (options.subscription === contextFeedName) {

				for (let item of feed.list()) {

					if (didParseEvent[item.event.id] || !item.event.content) { continue; }

					Object.assign(parsedEventId, this.parseContentRefs(item.event.content)['e']);
					didParseEvent[item.event.id] = true;
				}

				const ids = Object.keys(parsedEventId);

				if (ids.length > 0) {

					feed.subscribe(quotedFeedName, relay, [{
						ids
					}]);
				}

				return;
			}

			// Only create secondary subscriptions when
			// the end of the primary feed is reached
			if (options.subscription !== primaryFeedName) { return; }

			if (onEose) { onEose(relay, options); }

			const primaryFeedInfo = this.subscriptions[primaryFeedName];

			if (!primaryFeedInfo) { return; }

			const { until } = primaryFeedInfo.filters[0];

			const ref = this.contextRef(Object.keys(feed.items).map(id => {

				return feed.items[id].event;

			}).filter(event => {

				if (event.pubkey !== params.pubkey) {
					return false;
				}

				if (until && event.created_at >= until) {
					return false;
				}

				return true;

			}), undefined, feed.items);

			// Add signed in user's pubkey to people involved so
			// their replies will also show up in the feed
			if (params.active && ref.p.indexOf(params.active) === -1) {
				ref.p.push(params.active)
			}

			const whitelistPubkeys = [
				...Object.keys(contacts[params.active] || {}),
				...profileContacts
			];

			// Add people that signed in user is following as well as
			// people that the profile is following so that their replies
			// will show up too
			for (let contact of whitelistPubkeys) {
				if (ref.p.indexOf(contact) === -1) {
					ref.p.push(contact);
				}
			}

			const filters = this.contextFilters(feed, relay, ref, params);

			if (filters.length > 0) {

				//this.subscribe(contextFeedName, feed, filters);
				feed.subscribe(contextFeedName, relay, filters);
			}

		});

		// Pull the user's posts
		return this.subscribe(primaryFeedName, feed, [{
			authors: [ params.pubkey ],
			kinds: [ 1, 5, 6, 7, 9 ],
			limit: params.batch || 40,
		}, {
			authors: [ params.pubkey ],
			kinds: [ 0, 3 ]
		}]);
	}

	/* Load Recent Threads */
	loadRecent (feed, feedName, options = {}) {

		const recent = feed.list().filter(item => {
			return item.recent === feedName;
		}).map(item => {
			return item.event;
		});

		const ref = this.contextRef(recent);

		const filters = this.contextFilters(feed, null, ref);

		if (filters.length > 0) {

			this.subscribe(`${feedName}_recent`, feed, filters, options);
		}

		for (let event of recent) {

			feed.items[event.id].recent = undefined;
		}
	}

	/* Load Older Threads */
	expandProfileFeed (feed, params = {}) {

		const primaryFeedName = `profile_primary_${params.pubkey}`;
		const primaryFeedSubs = feed.subscriptions[primaryFeedName];

		if (!primaryFeedSubs) { return; }

		let until;

		// Get the timestamp of the oldest event that
		// was created by the profile's pubkey. That
		// will be used to set "until" for new filter
		for (let id of Object.keys(feed.items)) {

			const { event } = feed.items[id];

			if (event.pubkey !== params.pubkey) { continue; }

			if (([ 1, 5, 6, 7 ]).indexOf(event.kind) === -1) { continue; }

			if (!until || event.created_at < until) {
				until = feed.items[id].event.created_at;
			}
		}

		if (!until) { return; }

		// Invalidate EOSE completion flag for each
		// relay so secondary subs can fire again
		for (let url of Object.keys(primaryFeedSubs)) {

			primaryFeedSubs[url].eose = false;
		}

		return this.subscribe(primaryFeedName, feed, [{
			authors: [ params.pubkey ],
			kinds: [ 1, 5, 6, 7 ],
			limit: 40,
			until
		}]);

	}

	subscribe (name, feed, filters, options) {

		// Create a subscription on each relay
		this.relays.forEach(relay => {

			feed.subscribe(name, relay, filters, options);
		});

		this.registerFeed(name, feed, filters, options);

		return feed;
	}

	/* Get profile info from NIP-19 or NIP-05 identifier */
	async identify (s, options = {}) {

		const profile = {};

		try {

			if (s.indexOf('npub') === 0 && s.length === 63) { 

				const _npub = nip19.decode(s);

				if (_npub.data) {
					profile.pubkey = _npub.data;
				}

			} else if (s.indexOf('nprofile') === 0 && s.length > 20) {

				const _nprofile = nip19.decode(s);

				if (_nprofile.data.pubkey) {
					profile.pubkey = _nprofile.data.pubkey;
				}

				if (_nprofile.data.relays) {

					profile.relays = _nprofile.data.relays;
				}

			} else if (s.length === 64) { // Unencoded pubkey?

				profile.pubkey = s;

			} else { // NIP-05?

				let _nip05;

				if (s.indexOf('@') !== -1 || s.indexOf('.') !== -1) { // Domain specified

					_nip05 = s;

				} else if (options.defaultDomain) { // Use default domain if provided

					_nip05 = `${s}@${options.defaultDomain}`;
				}

				if (_nip05) { // Try to look up info if it exists

					const info = await nip05.queryProfile(_nip05);

					if (info.pubkey) {

						profile.pubkey = info.pubkey;
						profile.nip05 = s;

						if (info.relays && info.relays.length > 0) {
							profile.relays = info.relays;
						}
					}
				}
			}

		} catch (err) {

			console.log('Failed to parse identifier', err);
		}

		return profile;
	}


	/* Event Composers  */

	type0 (post) {

		return {
			...post,
			kind: 0,
			tags: []
		};
	}

	/* Text Note */
	type1 (post, params) {

		const tags = this.populateReplyTags(params);

		const content = this.populateMentionTags(tags, post.content);

		return {
			...post,
			kind: 1,
			content,
			tags
		};
	}

	type3 (post, params) {

		return {
			...post,
			kind: 3,
			tags: params.contacts.map(contact => {
				return [ 'p', contact ];
			})
		};
	}

	/* Delete */
	type5 (post, remove) {

		return {
			...post,
			kind: 5,
			tags: remove.map(item => {
				return [ 'e', item.event.id ];
			})
		};
	}
	
	/* Repost */
	type6 (post, repost) {

		return {
			...post,
			kind: 6,
			tags: [
				[ 'e', repost.event.id, '', 'root'],
				[ 'p', repost.event.pubkey ],
				...repost.event.tags.map(tag => {

					if (tag[0] === 'e' && tag[1] !== repost.event.id) {
						return [ 'e', tag[1] ];
					} else if (tag[0] === 'p' && tag[1] !== repost.event.pubkey) {
						return [ 'p', tag[1] ];
					}

				}).filter(tag => { return tag; })
			]
		};
	}

	type7 (post, params) {

		const tags = this.populateReplyTags(params);

		return {
			...post,
			kind: 7,
			tags
		};
	}

	/* Community */
	type34550 (post, params) {

		const tags = [ [ 'd', params.name ] ];

		if (params.description) {
			tags.push([ 'description', params.description ]);
		}

		if (params.image) {
			tags.push([ 'image', params.image ]);
		}

		if (params.rules) {
			tags.push([ 'rules', params.rules ]);
		}

		if (params.rankMode) {

			if (([ 'votes', 'zaps' ]).indexOf(params.rankMode) !== -1) {
				tags.push([ 'rank_mode', params.rankMode ])
			}
		}

		if (params.rankBatch) {

			tags.push([ 'rank_batch', String(params.rankBatch) ]);

		} else {

			tags.push([ 'rank_batch', '0' ]);
		}

		for (let pubkey of params.moderators) {
			tags.push([ 'p', pubkey, '', 'moderator' ]);
		}

		return {
			...post,
			kind: 34550,
			tags
		};
	}


	/* Helpers */

	contextRef (events, options = {}, items = {}) {

		const e = {};
		const p = {};
		const ids = {};

		for (let event of events) {

			e[event.id] = true;
			p[event.pubkey] = true;

			// Get notes to pubkeys and events from tags
			for (let tag of (event.tags || [])) {

				let gotRoot;

				if (tag[0] === 'p') {
					p[tag[1]] = true;
				} else if (tag[0] === 'e' || tag[0] === 'q') {

					if (!options.rootOnly || !gotRoot) {
						e[tag[1]] = true;
						gotRoot = true;
					}

					if (items[tag[1]] && items[tag[1]].event) {
						if (items[tag[1]].event.pubkey) {
							p[items[tag[1]].event.pubkey] = true;
						}

						if (items[tag[1]].event.tags) {
							for (let _tag of items[tag[1]].event.tags) {
								if (_tag[0] === 'p') {
									p[_tag[1]] = true;
								}
							}
						}
					}
				}
			}

			Object.assign(ids, this.parseContentRefs(event.content)['e']);
		}

		return {
			e: Object.keys(e),
			p: Object.keys(p),
			ids: Object.keys(ids)
		};
	}

	contextFilters (feed, relay, ref, params = {}) {

		const filters = [];

		if (ref.e.length > 0) {

			const ids = ref.e.filter(id => {
				return !feed.items[id] || feed.items[id].phantom;
			});

			if (ids.length > 0) {

				// Fetch referenced posts
				filters.push({
					kinds: [ 1 ],
					ids 
				});
			}

			if (ref.p.length > 0) {

				// Fetch replies to main posts from
				// other people who were involved
				filters.push({
					'authors': ref.p,
					'#e': ref.e,
					'kinds': [ 1 ]
				});

				if (params.active) {

					// Fetch reactions only from signed in user
					filters.push({
						'authors': [ params.active ],
						'#e': ref.e,
						'kinds': [ 7 ]
					});
				}

				const requestMetadata = relay ? feed.unknown(relay, ref.p) : ref.p;

				if (requestMetadata.length > 0) {

					filters.push({
						authors: requestMetadata,
						kinds: [ 0 ]
					});
				}
			}
		}

		if (ref.ids.length > 0) {

			filters.push({
				ids: ref.ids
			});
		}

		return filters;
	}

	parseContentRefs (content) {

		const alphanum = '0123456789abcdefghijklmnopqrstuvwxyz';
		const e = {};

		// Parse references to events from content string
		content.split('nostr:').forEach(s => {

			let parsed;

			if (s.indexOf('note1') === 0) {

				parsed = s.substring(0, 63);

			} else if (s.indexOf('nevent1') === 0) {

				for (let c = 0; c < s.length; c++) {

					if (alphanum.indexOf(s[c]) === -1) {

						parsed = s.substring(0, c);
						break;
					}
				}

				if (!parsed) {
					parsed = s;
				}
			}

			if (parsed) {

				try {

					const decoded = nip19.decode(parsed);

					if (decoded.type === 'note') {
						e[decoded.data] = true;
					} else if (decoded.type === 'nevent') {
						e[decoded.data.id] = true;
					}

				} catch (err) {}
			}

		});

		return { e };
	}

	populateReplyTags (replyTo) {

		// The e tags for events being referenced
		const etags = [];

		// Public keys that must be added
		// as p tags to the tags array
		const pubk = [];

		if (replyTo) { // If replying to another item

			// Copy the root e tag of the item being
			// replied to is it exists
			if (replyTo.eroot && replyTo.eroot !== replyTo.event.id) {
				etags.push([ 'e', replyTo.eroot, '', 'root' ]);
			}

			// Add the id of the event being replied to as reply tag
			etags.push([ 'e', replyTo.event.id, '', 'reply' ]);

			// Copy over additional p tags from the event
			for (let tag of replyTo.event.tags) {
				if (tag[0] === 'p' && pubk.indexOf(tag[1]) === -1) {
					pubk.push(tag[1]);
				}
			}

			// Add the author of the event being replied to as p tag
			if (pubk.indexOf(replyTo.event.pubkey) === -1) {
				pubk.push(replyTo.event.pubkey);
			}
		}

		return [
			...etags,
			...pubk.map(pubkey => { return [ 'p', pubkey ]; })
		];
	}

	populateMentionTags (tags, content) {

		const mentioned = {};

		for (let s of content.split('nostr:')) {

			if (s.indexOf('npub1') === 0) {

				try {

					const decoded = nip19.decode(s.substring(0, 63));

					if (decoded.type === 'npub') {
						mentioned[decoded.data] = true;
					}

				} catch (err) {}
			}
		}

		const segments = [];

		for (let s of content.split('@npub1')) {

			let replace;

			try {

				const decoded = nip19.decode('npub1' + s.substring(0, 58));

				if (decoded.type === 'npub') {
					mentioned[decoded.data] = true;
					replace = decoded.data;
				}

			} catch (err) { console.log('err', err); }

			if (replace) {

				segments.push(`nostr:${'npub1' + s.substring(0, 58)}${s.slice(58)}`);

			} else {

				segments.push(s);
			}
		}

		for (let tag of tags) {

			if (tag[0] === 'p' && mentioned[tag[1]]) {
				delete mentioned[tag[1]]
			}
		}

		for (let p of Object.keys(mentioned)) {

			tags.push([ 'p', p ]);
		}

		return segments.join('');
	}

	getThreadRefs = (item, options = {}) => {

		const events = {};
		const parsed = {};

		const get = (replies) => {

			for (let reply of replies) {

				if (options.includeEventIds) {

					events[reply.event.id] = true;
				}

				if (options.includeParsedIds && reply.event.content) {
					Object.assign(parsed, this.parseContentRefs(reply.event.content)['e']);
				}

				get(reply.replies);
			}
		};

		get([ item ]);
		
		return { events, parsed };
	};

	normalizeKey (value) {

		let hex;

		if (value.substring(0, 4) === 'nsec' || value.substring(0, 4) === 'npub') {
			const decoded = nip19.decode(value);
			hex = decoded.data;
		}

		return hex || value;
	}

	pubkeyLabel (pubkey) {

		const encoded = nip19.npubEncode(pubkey);
		return encoded.slice(0, 8) + '...' + encoded.slice(-4);
	}
}

export default Client;
