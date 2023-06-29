import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { nip19 } from 'nostr-tools';

import Feed from './Feed';

import ContentNav from '../DirectoryPage/ContentNav';
import MobilePostButton from './MobilePostButton';

import { handleZapRequest, handleNostrPublish, openReplyModal, rootPostItem, rootPostAuthor, navigate, nostrFollow, queryProfiles } from '../../actions';


/* Render a post and its replies */
class PostFeed extends PureComponent {

	state = {
		postId: null,
		loadMorePending: true,
		showStickyHeader: false
	};

	componentDidMount = async () => {

		window.scrollTo(0, 0);

		this.handleLoad(this.props.postId);
	};

	componentDidUpdate = (prevProps) => {

		if (prevProps.postId !== this.props.postId) {

			if (prevProps.postId) {

				this.handleCleanup(prevProps.postId);
			}

			this.handleLoad(this.props.postId);
		}
	};

	componentWillUnmount = () => {

		clearTimeout(this._resetLoadMore);

		this.handleCleanup(this.props.postId);
	}

	handleCleanup = (postId) => {

		delete window.client.subscriptions[`post_${postId}`];

		this.props.main.unregisterObserver(`post_${postId}`);
	};

	handleLoad = (postId) => {

		if (!postId) { return; }

		this.setState({ updating: true });

		this.props.rootPostItem(null);
		this.props.rootPostAuthor(null);

		// Set a timeout so the feed unmounts and remounts,
		// triggering the handlers to unsub/sub
		setTimeout(() => {

			const filters = [];

			if (!this.props.main.items[postId] || this.props.main.items[postId].phantom) {

				filters.push({
					ids: [ postId ],
					limit: 1
				});
			}

			filters.push({
				'#e': [ postId ],
				kinds: [ 1 ]
			});

			if (this.props.active) {

				filters.push({
					authors: [ this.props.active ],
					'#e': [ postId ],
					kinds: [ 7 ]
				});
			}
			
			window.client.subscribe(`post_${postId}`, this.props.main, filters);

			// TODO listen for EOSE to load metadata for everyone involved

			this.setState({ updating: false });

			this.props.main.listenForItem(this.props.postId, (item) => {

				this.props.rootPostItem(item);

				this.props.main.listenForMetadata(item.event.pubkey, this.props.rootPostAuthor);
			});

		}, 100);
		
	};

	handlePost = (post, replyTo) => {

		return handleNostrPublish(post, replyTo, [ this.props.main ]);
	};

	handleLoadMore = () => {

		// TODO
	};

	handleMobileReply = (replyTo) => {

		const { main, active } = this.props;

		this.props.openReplyModal({
			author: { pubkey: active },
			open: true,
			replyTo,
			feed: main
		});
	};

	render = () => {

		return (
			<div style={styles.container(this.props)}>
				{this.props.mobile ? <ContentNav /> : null}
				<div id='pub_header' />
				{this.props.postId && !this.state.updating ? (
					<Feed
						lazyRender
						feed={this.props.main}
						name={`post_${this.props.postId}`}
						mobile={this.props.mobile}
						active={this.props.active}
						searchActive={this.props.searchActive}
						loadMorePending={this.state.loadMorePending}
						handlePost={this.handlePost}
						handleLoadMore={this.handleLoadMore}
						handleMobileReply={this.handleMobileReply}
						handleFollow={this.props.nostrFollow}
						handleZapRequest={this.props.handleZapRequest}
						handleQueryProfiles={this.props.queryProfiles}
						contacts={this.props.contacts}
						buildOptions={{ mode: 'post', id: this.props.postId }}
						//onUpdate={this.handleUpdateFeed}
						highlight={this.props.rootItem ? this.props.rootItem.event.pubkey : undefined}
						navigate={this.props.navigate}
					/>
				) : null}
				<div id='pub_scroll_bottom' />
				<MobilePostButton />
			</div>
		);
	}
}

const mapState = ({ app, nostr, query }) => {

	let postId;

	if (app.routeComponents[0] === 'thread') {

		if (app.routeComponents[1] && app.routeComponents[1].indexOf('note1') === 0) {
			postId = nip19.decode(app.routeComponents[1]).data;
		} else {
			postId = app.routeComponents[1];
		}
	}

	return {
		searchActive: query.active,
		contacts: (nostr.contacts || {})[nostr.pubkey] || {},
		rootItem: nostr.rootItem,
		rootAuthor: nostr.rootAuthor,
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		active: nostr.pubkey || '',
		mobile: app.mobile,
		main: nostr.main,
		postId
	};
};

const styles = {

	container: ({ mobile }) => {
		return {
			paddingTop: mobile ? 62 : 72,
			paddingBottom: 108,
			paddingLeft: mobile ? 12 : 24,
			paddingRight: mobile ? 12 : 24
		};
	}
};

export default connect(mapState, { handleZapRequest, openReplyModal, rootPostItem, rootPostAuthor, navigate, nostrFollow, queryProfiles })(PostFeed);
