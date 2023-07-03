import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import Feed from '../../Nostr/Feed';

import { COLORS } from '../../../constants';
import { handleNostrPublish, queryProfiles, nostrFollow, handleZapRequest, navigate, openReplyModal } from '../../../actions';


class Notifications extends PureComponent {

	//state = { loaded: false };

	componentDidMount = () => {
		if (this.props.count > 0) {
			setTimeout(() => {
				this.handleLoadContext();
			}, 100);
		}
	};

	componentDidUpdate = (prevProps) => {

		if (prevProps.count === 0 && this.props.count > 0) {

			setTimeout(() => {
				this.handleLoadContext();
			}, 100);
		}
	};

	handleLoadContext = () => {

		//console.log('LOAD');

		const { notifications, feed, pubkey } = this.props;
		const filters = [];
		const uniqueE = {};
		const uniqueP = {};

		// Get a list of the ids of events that were replied to
		// by notifications that have not been seen and that do
		// not already exist in the feed
		Object.keys(notifications).forEach(id => {

			if (
				!notifications[id]
				|| !feed.items[id]
			) {
				return;
			}

			const { ereply, eroot, event } = feed.items[id];

			if (eroot || (!feed.items[eroot] || feed.items[eroot].phantom)) {
				uniqueE[eroot] = true;
			}

			if (ereply || (!feed.items[ereply] || feed.items[ereply].phantom)) {
				uniqueE[ereply] = true;
			}

			if (event.pubkey) {
				uniqueP[event.pubkey] = true;
			}

		});

		if (Object.keys(uniqueE).length > 0) {

			filters.push({
				ids: Object.keys(uniqueE),
				//authors: [ pubkey ]
				kinds: [ 1 ],
			});
		}

		if (Object.keys(uniqueP).length > 0) {

			filters.push({
				authors: Object.keys(uniqueP),
				kinds: [ 0 ]
			});
		}

		if (filters.length > 0) {

			// this.props.feed.listenForEose((relay, options) => {

			// 	//main.subscribe(`notifications_context`, relay, filters);

			// 	if (options.subscription === `notifications_context`) {

			// 		this.setState({ loaded: true });
			// 	}
			// });

			// Pull events to provide context to notifications
			window.client.subscribe(`notifications_context`, this.props.feed, filters);
		}
	};

	handleQueryProfiles = (params) => {

		this.props.queryProfiles(params ? {
			...params,
			feeds: [ this.props.feed ]
		} : null);
	};

	handleMobileReply = (replyTo) => {

		const { pubkey } = this.props;
		const { feed } = this.props;

		this.props.openReplyModal({
			author: { pubkey },
			open: true,
			replyTo,
			feed
		});
	};

	handlePost = (post, replyTo, attached) => {

		//if (!this.props.feed) { return; }

		return handleNostrPublish(post, replyTo, [ this.props.feed ], attached);
	};

	render = () => {

		return (
			<div style={{
				padding: this.props.mobile ? 12 : 24,
				maxWidth: 720
			}}>
				{/*this.state.loaded*/true ? (<Feed
					//style={{ marginTop: -16 }}
					//divided
					//lazyRender
					feed={this.props.feed}
					name={`notifications`}
					buildOptions={{ mode: 'profile', pubkey: this.props.pubkey, surfaceMentions: true }}
					mobile={this.props.mobile}
					active={this.props.pubkey}
					searchActive={this.props.searchActive}
					//profile={this.props.pubkey}
					highlight={this.props.pubkey}
					//loadMorePending={this.state.loadMorePending}
					handlePost={this.handlePost}
					//handleLoadMore={this.handleLoadMore}
					handleMobileReply={this.handleMobileReply}
					handleQueryProfiles={this.handleQueryProfiles}
					handleFollow={this.props.nostrFollow}
					handleZapRequest={this.props.handleZapRequest}
					navigate={this.props.navigate}
					metadata={this.props.metadata || {}}
					contacts={{}}
					//contacts={(this.props.contacts[this.props.pubkey] || {})}
				/>) : null}
			</div>
		);
	};
}

const mapState = ({ app, nostr, notifications, query }) => {

	return {
		mobile: app.mobile,
		feed: nostr.prof,
		pubkey: nostr.pubkey,
		contacts: nostr.contacts,
		notifications: notifications,
		count: Object.keys(notifications).length,
		searchActive: query.active
	};
};

const styles = {

};

export default connect(mapState, { navigate, nostrFollow, handleZapRequest, queryProfiles, openReplyModal })(Notifications);
