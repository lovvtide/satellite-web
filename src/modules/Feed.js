import { nip19 } from 'nostr-tools';


/* Model of a threaded feed of events */

class Feed {

	static sort (data, priority) {

		const measure = (item) => {

			let z = priority(item);

			for (let r of item.replies) {

				const _r = measure(r);

				if (_r._sort && (!z || _r._sort > z) && !_r.newpub) {
					z = _r._sort;
				}
			}

			if (z) {item._sort = z; }

			return item;
		}

		const compare = (items) => {

			for (let item of items) {

				if (item.replies.length > 0) {
					compare(item.replies);
				}
			}

			return items.sort((a, b) => {

				if (a._sort) {
					return b._sort ? b._sort - a._sort : -1;
				}

				if (b._sort) { return 1; }

				return b.event.created_at - a.event.created_at;
			});
		};

		return compare(data.map(item => { return measure(item); }));
	}

	constructor (options = {}) {

		// Feed is identified with a unique ID
		this.id = options.id || Math.random().toString(36).slice(2);

		// <name> : { <relay_url>: { req, ...<metadata> } }
		this.subscriptions = {};

		// <id_deleted> : event
		this.deleted = {};

		// <pubkey> : { <created_at>, { <name>, <display_name>, <about>, <nip05>, <website>, <picture>, <banner> } }
		this.metadata = {};

		// <pubkey> : { <created_at>, content, contacts: [ <following_pubkey>, ... ] }
		this.contacts = {};

		// <id> : { event, replies, ...<attrs> }
		this.items = {};

		// <id>: <bool>
		this.seen = {};

		// <id>: <bool>
		this._containsMention = {};

		// <d-ident:founder> : { <event> }
		//this.communities = [];

		// <pubkey> : <bool>
		this.metadataRequested = {};

		// <id> : <handler>
		this.itemListeners = {};

		// <pubkey> : <handler>
		this.metadataListeners = {};

		// <pubkey> : <handler>
		this.contactsListeners = {};

		// Attached update listeners
		this.observers = [];

		// List of profiles to build list feed
		this.surface = [];

		// Events newly posted by user
		this.newpubs = [];

		// Kind 4 direct messages
		this.dms = {};

		this._mod = 0;

	}

	/* Return an array of all items */
	list () {

		return Object.keys(this.items).map(id => {
			return this.items[id];
		});
	}

	/* Return a deduplicated array of authors' pubkeys */
	authors (options = {}) {

		const p = {};

		for (let item of this.list()) {

			if (!item.phantom) {

				p[item.event.pubkey] = true;

				for (let tag of item.event.tags) {

					if (tag[0] === 'p') {
						p[tag[1]] = true;
					}
				}
			}
		}

		return Object.keys(p);
	}

	/* Return a list of pubkeys whose metadata
	not been requested from the given relay */
	unknown (relay, pubkeys = []) {

		return pubkeys.filter(pubkey => {

			return !this.metadataRequested[pubkey] || !this.metadataRequested[pubkey][relay.url];
		});
	}

	subscribe (name, relay, filters = [], options = {}) {

		// Init feed object as necessary
		if (!this.subscriptions[name]) {
			this.subscriptions[name] = {};
		}

		if (this.subscriptions[name][relay.url]) { // Found active sub

			// Update filters with provided value
			this.subscriptions[name][relay.url].req.sub(filters, { skipVerification: true });

		} else { // Need to open a new sub

			const req = relay.sub(filters, {
				...options,
				skipVerification: true
			});

			// Pass received events to handler
			req.on('event', event => {

				if (this.eventListener) {
					this.eventListener(event);
				}
				
				this.update(event, relay, {
					subscription: name,
					listMode: options.listMode
				});
			});

			// Notify end of saved events
			req.on('eose', () => {

				const model = this.subscriptions[name];

				if (!model || !model[relay.url] || model[relay.url].eose) {
					return;
				}

				model[relay.url].eose = true;

				if (this.onEose) {
					this.onEose(relay, {
						subscription: name
					});
				}
			});

			// Add to subscriptions pool
			this.subscriptions[name][relay.url] = { req };
		}

		for (let filter of filters) {

			if (filter.kinds && filter.kinds.indexOf(0) !== -1) {

				this.flagMetadataRequested(relay, filter.authors);
			}
		}

		return this;
	}

	// Send "CLOSE" messages for all active subs and
	// notify client to remove feed from its pool
	unsubscribe (client) {

		clearTimeout(this._updatePending);

		Object.keys(this.subscriptions).forEach(name => {
			Object.keys(this.subscriptions[name]).forEach(relay => {
				this.subscriptions[name][relay].req.unsub();
			});
		});

		client.unregisterFeed(this);

		return this;
	}

	normalize (items, surface = []) {

		// Recurse through the replies subtree of each
		// thread to get the most recent timestamp of
		// a top author reply, the total number of replies,
		// and the pubkey of the most recent top reply
		items.forEach(item => {

			let list_t = 0;
			let list_n = 0;
			let list_p;

			const info = (replies) => {

				list_n += replies.length;

				for (let reply of replies) {

					if (surface.indexOf(reply.event.pubkey) !== -1) {

						if (reply.event.created_at >= list_t && !reply.newpub) {

							list_t = reply.event.created_at;
							list_p = reply.event.pubkey;
						}
					}

					info(reply.replies);
				}
			};

			info(item.replies);

			item.list_t = list_t || item.event.created_at;
			item.list_n = list_n;

			if (list_p) {

				const _m = this.metadata[list_p];

				let _d;

				if (_m) {
					_d = _m.profile.display_name || _m.profile.name;
				}

				if (!_d) {
					_d = list_p.slice(0, 8) + '...' + list_p.slice(-4);
				}

				item.list_p = _d;
			}

		});

		return items;
	}

	update (data, relay, options = {}) {

		const events = Array.isArray(data) ? data : [ data ];

		// Logic for building feed to pass to handlers,
		// If not option immediate, wait at least 750ms
		// between updates - this greatly improves perf
		const handleUpdate = (options = {}) => {

			const reflect = () => {

				this._mod++;

				for (let observer of Object.keys(this.observers)) {

					const { handler, buildOptions } = this.observers[observer];

					handler(this.build(buildOptions));
				}
			};

			if (options.immediate) {

				reflect();

			} else if (!this.updatePending) {

				this.updatePending = true;

				this._updatePending = setTimeout(() => {

					this.updatePending = false;

					reflect();

				}, 1000);
			}
		};

		for (let _event of events) {

			let event, approval;

			// If the event is a moderator approval event, parse the
			// content and treat that at the event (the one approved)
			if (_event.kind === 4550) {

				if (this.seen[_event.id]) { continue; }

				this.seen[_event.id] = true;

				event = JSON.parse(_event.content);

				// If the approved event already exists, save
				// the kind 4550 event on the item and continue
				if (this.items[event.id]) {

					this.items[event.id].approval = _event;
					continue;

				} else { // Otherwise save for when item is created

					approval = _event;
				}

			} else { // Proceed normally

				event = _event;

				if (this.items[event.id]) { // Already have event?

					// Still need to mark it with list mode
					if (options.listMode) {
						this.items[event.id].labels[options.listMode] = true;
					}

					// If not a phantom, it's a duplicate
					if (!this.items[event.id].phantom) {

						// Don't need to insert it though
						continue;
					}

					delete this.items[event.id];
				}
			}

			/* Handle special events */

			if (event.kind === 0) { // Parse and store most recent profile metadata

				if (!this.metadata[event.pubkey] || event.created_at > this.metadata[event.pubkey].created_at) {

					const profile = JSON.parse(event.content);

					this.metadata[event.pubkey] = {
						created_at: event.created_at,
						profile
					};

					for (let id of Object.keys(this.items)) {

						if (this.items[id].event.pubkey === event.pubkey) {

							this.items[id].author = this.metadata[event.pubkey].profile;
						}
					}

					if (this.metadataListeners[event.pubkey]) {

						this.metadataListeners[event.pubkey](profile);
					}

					if (this.metadataListeners['*']) {

						this.metadataListeners['*'](event.pubkey, profile);
					}

					handleUpdate();
				}

				continue;

			} else if (event.kind === 3) {

				if (!this.contacts[event.pubkey] || event.created_at > this.contacts[event.pubkey].created_at) {

					const contacts = event.tags.filter(tag => {
						return tag[0] === 'p';
					}).map(tag => {
						return tag[1];
					});
					
					this.contacts[event.pubkey] = {
						created_at: event.created_at,
						content: event.content || '',
						contacts
					};

					if (this.contactsListeners[event.pubkey]) {

						this.contactsListeners[event.pubkey](this.contacts[event.pubkey]);
					}
				}

			} else if (event.kind === 4) {

				if (!this.dms[event.id]) {

					this.dms[event.id] = event;

					if (this.dmListener) {

						this.dmListener(event);
					}
				}

				continue;

			} else if (event.kind === 5) { // Delete event

				// When a delete event is received, remove it
				// from replies array and delete from mapping.
				// Keep the delete event in `this.deleted` in
				// case event to be removed is yet received
				for (let tag of event.tags) {

					if (tag[0] === 'e') {

						this.deleted[tag[1]] = event;

						if (!this.items[tag[1]]) { continue; }

						this.items[tag[1]].deleted = event;

						// If the deleted event was a repost,
						// remove the "repost" flag from the
						// event that the repost was pointing
						// to, assuming that event is present
						if (
							this.items[tag[1]].event
							&& this.items[tag[1]].event.kind === 6
							&& this.isDeleted(this.items[tag[1]].event)
							&& this.items[this.items[tag[1]].eroot]
						) {

							this.items[this.items[tag[1]].eroot]._repost = null;
						}

						// If event was an upvote and there already
						// existed some event that it was reffering
						// to, remove from upvotes mapping of event
						if (
							this.items[tag[1]].event
							&& this.items[tag[1]].event.kind === 7
							&& this.items[this.items[tag[1]].ereply]
							&& this.items[this.items[tag[1]].ereply].upvotes
						) {

							this.items[this.items[tag[1]].ereply].upvotes[this.items[tag[1]].event.pubkey] = null
						}
					}
				}

				continue;

			} else if (event.kind === 34550) {

				if (this.communityListener) {

					this.communityListener(event);
				}

			} else if (event.kind === 30001) {

				for (let tag of event.tags) {

					if (tag[0] === 'd') {

						if (tag[1] === 'communities' && this.communityFollowingListListener) {
							this.communityFollowingListListener(event);
						}
					}
				}
			}

			let eroot, ereply

			const etags = [];

			// Find the "reply" e tag to allow for
			// comments to be threaded properly
			for (let tag of event.tags) {

				if (tag[0] === 'e') {

					if (tag[3] === 'root') {
						eroot = tag[1];
					} else if (tag[3] === 'reply') {
						ereply = tag[1];
					}

					etags.push(tag[1]);
				}
			}

			if (event.kind === 6) {

				ereply = eroot;
			}

			if (!eroot) {

				eroot = etags[0];
			}

			if (!ereply) {

				ereply = etags[1] || eroot;
			}

			const recent = (
				relay
				&& ([ 1, 7 ]).indexOf(event.kind) !== -1
				&& this.subscriptions[options.subscription]
				&& this.subscriptions[options.subscription][relay.url].eose
			) ? options.subscription : undefined;

			this.items[event.id] = {
				event,
				eroot,
				ereply,
				recent,
				replies: [],
				labels: {},
				author: this.metadata[event.pubkey] ? this.metadata[event.pubkey].profile : undefined
			};

			if (approval) {

				this.items[event.id].approval = approval;
			}

			if (options.listMode) {

				this.items[event.id].labels[options.listMode] = true;
			}

			// Insert phantom event implied by the ereply
			// of the item if it's not yet been found
			if (ereply && !this.items[ereply]) {

				this.items[ereply] = {
					event: { id: ereply },
					phantom: true,
					replies: [],
					labels: {},
					recent
				}
			}

			// Mark event as deleted if delete event present
			if (this.isDeleted(event)) {
				this.items[event.id].deleted = this.deleted[event.id];
			}

			// Add "newpub" flag to indicate that
			// this message was added to the feed
			// after being newly created by user
			// and push it into the newpubs array
			if (options.newpub) {
				this.items[event.id].newpub = true;
				this.newpubs.push(this.items[event.id]);
			}

			// Loop across existing events
			for (let id of Object.keys(this.items)) {

				// If an existing event refers to the new event
				if (this.items[id].ereply === event.id) {

					// If the existing event is a kind 6 repost
					// save a ref to the repost on the new event
					if (this.items[id].event.kind === 6) {

						if (this.isDeleted(this.items[id].event)) { continue; }

						this.items[event.id]._repost = this.items[id];

					} else {

						// Otherise push the existing event into
						// the replies array of the new event
						this.items[event.id].replies.push(this.items[id]);
					}

					if (this.items[id].event.kind === 7) { // Save upvotes on new item

						if (this.items[id].event.content !== '-') {

							if (!this.items[event.id].upvotes) {

								this.items[event.id].upvotes = {};
							}

							if (!this.items[event.id].upvotes[this.items[id].event.pubkey] || this.items[id].event.created_at > this.items[event.id].upvotes[this.items[id].event.pubkey].created_at) {

								this.items[event.id].upvotes[this.items[id].event.pubkey] = this.items[id].event;
							}
						}
					}
				}

				// If the new event refers to existing event
				if (id === ereply) {

					// If the new event is a kind 6 repost
					if (event.kind === 6) {

						if (this.isDeleted(event)) { continue; }

						// Save the new repost as a ref on the event
						this.items[id]._repost = this.items[event.id];

					} else {

						// Otherwise push the new event into the replies
						// array of the existing event it refers to
						if (options.newpub) {

							this.items[id].replies.unshift(this.items[event.id]);

						} else {

							this.items[id].replies.push(this.items[event.id]);
						}

						if (event.kind === 7) { // Save new upvote on existing item

							// If event is an upvote
							if (event.content !== '-') {

								if (!this.items[id].upvotes) {

									this.items[id].upvotes = {};
								}

								// If the upvote event is the most recent from a
								// pubkey, save a reference to the upvote event
								if (!this.items[id].upvotes[event.pubkey] || event.created_at > this.items[id].upvotes[event.pubkey].created_at) {

									this.items[id].upvotes[event.pubkey] = event;
								}
							}

						}
					}
				}
			}

			if (this.itemListeners[event.id]) {

				this.itemListeners[event.id](this.items[event.id]);
			}
		}

		handleUpdate({ immediate: options.newpub });
	}

	build (options) {

		if (options.mode === 'profile') { // Compile profile feed

			// Return sorted list of items filtered to exclude those
			// that are a direct reply to any other in the feed since
			// those will be found nested in the replies of other items
			return Feed.sort(this.list().filter(item => {

				if (([ 1, 5, 7 ]).indexOf(item.event.kind) === -1) { return false; }

				if (item._repost && item._repost.event.pubkey === options.pubkey) {
					return true;
				}

				/**********************/
				const containsMention = (event) => {

					if (!options.surfaceMentions) { return false; }

					// Cache result of parsing mentions for increased performance
					if (typeof this._containsMention[event.id] !== 'undefined') {
						return this._containsMention[event.id];
					}

					for (let s of event.content.split('nostr:')) {

						if (s.indexOf('npub1') === 0) {

							let pubkey;

							try {

								const decoded = nip19.decode(s.substring(0, 63));

								if (decoded.type === 'npub') {

									if (decoded.data === options.pubkey) {
										this._containsMention[event.id] = true;
										return true;
									}
								}

							} catch (err) {

								console.log('err', err);
							}
						}
					}

					this._containsMention[event.id] = false;
					return false;
				};

				if (
					item.event.pubkey !== options.pubkey
					&& !this.items[item.event.id]._nest
				) {

					const findNests = (parent) => {

						if (this.items[parent.event.id]._nest) {
							return true;
						}

						for (let reply of parent.replies) {

							if (reply.event.pubkey === options.pubkey || containsMention(reply.event)) {
								return true;
							}

							if (findNests(reply)) { return true; };
						}
					};

					if (!findNests(item)) {

						if (containsMention(item.event)) return true;

						return false;
					}

					this.items[item.event.id]._nest = true;
				}

				if (
					this.items[item.event.id]._nest
					&& (
						!this.items[item.ereply]
						|| this.items[item.ereply].phantom
						//|| containsMention(item.event)
					)
				) {
					return true;
				}

				// if (!this.items[item.event.id]._nest && containsMention(item.event)) {
				// 	return true;
				// }

				return !item.ereply || !this.items[item.ereply] || (
					this.items[item.ereply] && this.items[item.ereply].event.kind === 9
				)/* || containsMention(item.event)*/;

			}), item => {

				if (item.newpub) {

					return Infinity;
				}

				if (item._repost && options.pubkey === item._repost.event.pubkey) {

					return item._repost.event.created_at;
				}

				// Threads are sorted by the created_at timestamp
				// of the most recent nested feed owner's message
				if (options.pubkey === item.event.pubkey) {

					return item.event.created_at;
				}

			});

		} else if (options.mode === 'list') {

			// Get a list of items
			const items = this.list().filter(item => {

				if (item.phantom || item.eroot || item.event.kind !== 1) {
					return false;
				}

				if (!item.newpub && options.label && !item.labels[options.label]) {

					return false;
				}

				return true;

			});

			return this.normalize(items, options.surface).sort((a, b) => {

				// Messages posted by user should
				// appear at top of list for them
				if (a.newpub && !b.newpub) {
					return -1;
				}

				return b.list_t - a.list_t;

			});

		} else if (options.mode === 'post') { // Compile post feed

			const rootItem = this.items[options.id];

			return rootItem ? [ rootItem ] : [];
		}
	}

	flagMetadataRequested (relay, authors = []) {

		for (let pubkey of authors) {

			if (!this.metadataRequested[pubkey]) {
				this.metadataRequested[pubkey] = {};
			}

			this.metadataRequested[pubkey][relay.url] = true;
		}
	}

	// Add update listener
	registerObserver (name, handler, options = {}) {

		this.observers[name] = {
			buildOptions: options,
			handler
		};

		handler(this.build(options));
	}

	// Remove update listener
	unregisterObserver (name) {

		delete this.observers[name];
	}

	// Handle metadata received for profile
	listenForMetadata (pubkey, handler) {

		this.metadataListeners[pubkey] = handler;

		if (this.metadata[pubkey]) {

			handler(this.metadata[pubkey].profile);
		}

		return this;
	}

	// Handle contacts received for profile
	listenForContacts (pubkey, handler) {

		this.contactsListeners[pubkey] = handler;

		if (this.contacts[pubkey]) {

			handler(this.contacts[pubkey]);
		}

		return this;
	}

	listenForEvent (handler) {

		this.eventListener = handler;
	}

	listenForItem (id, handler) {

		this.itemListeners[id] = handler;

		if (this.items[id]) {

			handler(this.items[id]);
		}

		return this;
	};

	listenForDM (handler) {

		this.dmListener = handler;
	}

	listenForCommunity (handler) {

		this.communityListener = handler;
	}

	listenForCommunityFollowingList (handler) {

		this.communityFollowingListListener = handler;
	}

	// Listen for relay EOSE notice
	listenForEose (handler) {
		this.onEose = handler;
		return this;
	}

	/* If valid delete message present for event */
	isDeleted (event) {

		return this.deleted[event.id] && this.deleted[event.id].pubkey === event.pubkey;
	}
}

export default Feed;
