import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Feed from '../../Nostr/Feed';

import { handleNostrPublish, queryProfiles, nostrFollow, handleZapRequest, navigate, openReplyModal, setNotificationsLastSeen } from '../../../actions';


class Notifications extends PureComponent {

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

	componentWillUnmount = () => {

		this.props.setNotificationsLastSeen(Math.floor(Date.now() / 1000));
	};

	handleLoadContext = () => {

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

			if (eroot && (!feed.items[eroot] || feed.items[eroot].phantom)) {
				uniqueE[eroot] = true;
			}

			if (ereply && (!feed.items[ereply] || feed.items[ereply].phantom)) {
				uniqueE[ereply] = true;
			}

			if (event.pubkey && !feed.metadata[event.pubkey]) {
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
				paddingLeft: this.props.mobile ? 12 : 24,
				paddingRight: this.props.mobile ? 12 : 24,
				paddingTop: 24,
				paddingBottom: 24,
				maxWidth: 720
			}}>
				<Feed
					divided
					feed={this.props.feed}
					name={`notifications`}
					buildOptions={{ mode: 'profile', pubkey: this.props.pubkey, surfaceMentions: true, notifications: true }}
					mobile={this.props.mobile}
					active={this.props.pubkey}
					searchActive={this.props.searchActive}
					highlight={this.props.pubkey}
					handlePost={this.handlePost}
					handleMobileReply={this.handleMobileReply}
					handleQueryProfiles={this.handleQueryProfiles}
					handleFollow={this.props.nostrFollow}
					handleZapRequest={this.props.handleZapRequest}
					navigate={this.props.navigate}
					metadata={this.props.metadata || {}}
					contacts={{}}
					notificationsLastSeen={this.props.notificationsLastSeen}
				/>
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
		searchActive: query.active,
		notificationsLastSeen: nostr.notificationsLastSeen
	};
};

const styles = {

};

export default connect(mapState, { navigate, nostrFollow, handleZapRequest, queryProfiles, openReplyModal, setNotificationsLastSeen })(Notifications);
