import React, { Component } from 'react';
import { connect } from 'react-redux';
import { nip19 } from 'nostr-tools';

import Feed from './Feed';
import MobilePostButton from './MobilePostButton';

import { navigate, loadFrontpageNostr, nostrFollow } from '../../actions';
import { FEATURED_AUTHORS, COLORS } from '../../constants';


class FrontPageFeed extends Component {

	state = { lazyRender: false };

	componentDidMount = () => {

		this.handleLoad();

		this._contactFetch = setTimeout(() => {
			this.setState({ contactFetchTimeoutExpired: true });
		}, 2500);
	};

	componentWillUnmount = () => {
		clearTimeout(this._contactFetch);
	};

	componentDidUpdate = (prevProps) => {

		if ((!prevProps.surface && this.props.surface) || (prevProps.mode !== this.props.mode)) {

			if (this.props.mobile) {

				document.body.scrollTo({ top: 0 });

			} else {

				this.props.overflowContainer.scrollTo({ top: 0 });
			}

			
			this.handleLoad();
		}
	};

	handleLoad = () => {

		// if (!this.props.surface) {
		// 	return;
		// }

		// Dispatch action to load frontpage list - the action
		// creator will automatically check if the subscription
		// already exists, and will create on as necessary
		loadFrontpageNostr(this.props.feed, {
			name: `frontpage_primary_${this.props.mode}`,
			listMode: this.props.mode,
			surface: this.props.surface
		});
	};

	handleSelectThread = (item) => {

		this.props.navigate(`/thread/${nip19.noteEncode(item.event.id)}`);
	};

	renderMobilePostButton = () => {

		if (!this.props.mobile) { return null; }

		return (
			<MobilePostButton
				feed={this.props.feed}
			/>
		);
	};

	render = () => {

		const emptyFollowingFeed = this.props.mode === 'following' && Object.keys(this.props.contacts).length === 0;

		if (
			(this.props.pendingContacts ||
			emptyFollowingFeed ||
			(this.props.mode === 'following' && !this.props.active)) &&
			this.props.newpubs.length === 0
		) {

			if (!this.state.contactFetchTimeoutExpired) { return null; }

			return (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					paddingTop: this.props.mobile ? 76 : 16
				}}>
					<div style={{
						width: '60%',
						color: COLORS.secondaryBright,
						fontSize: 13,
						textAlign: 'center'
					}}>
						{this.props.active ? `Conversations from people you follow will show up here` : `When you're signed in, conversations from people you follow will show up here`}
					</div>
					{this.renderMobilePostButton()}
				</div>
			);
		}

		if (!this.props.feed || (!this.props.surface && this.props.newpubs.length === 0)) { return null; }

		return (
			<div style={{ ...styles.container(this.props), ...(this.props.style || {}) }}>
				<Feed
					thread
					//lazyRender={!this.props.mobile || this.state.lazyRender}
					lazyRender
					lazyRenderInit={window._frontpageFeedLimit}
					onUpdateLazyFeedLimit={limit => {
						window._frontpageFeedLimit = limit;
					}}
					maintainSubscription
					hidden={!this.props.visible}
					feed={this.props.feed}
					selected={this.props.selected}
					name={`frontpage_primary_${this.props.mode}`}
					listMode={this.props.mode}
					surface={this.props.surface}
					mobile={this.props.mobile}
					divided={this.props.mobile}
					handleSelectThread={this.handleSelectThread}
					handleFollow={this.props.nostrFollow}
					contacts={this.props.contacts}
					overflowContainer={this.props.overflowContainer}
					navigate={this.props.navigate}
					emptyMessage={`Conversations from people you follow will show up here`}
				/>
				{this.renderMobilePostButton()}
			</div>
		);
	};
}

const mapState = ({ app, nostr, query }) => {

	let selected, surface;

	const contacts = (nostr.contacts || {})[nostr.pubkey] || {};

	if (app.routeComponents[0] === 'thread' && app.routeComponents[1]) {

		if (app.routeComponents[1].indexOf('note1') === 0) {

			selected = nip19.decode(app.routeComponents[1]).data;

		} else {

			selected = app.routeComponents[1];
		}
	}

	if (nostr.mode === 'featured') {

		surface = nostr.main.surface;

		//console.log('surfaceprops', nostr.main.zapReceivedTotal);

		// surface = Object.keys(nostr.main.zapReceivedTotal).sort((a, b) => {
		// 	return nostr.main.zapReceivedTotal[b] - nostr.main.zapReceivedTotal[a];
		// }).slice(0, 50);

		// console.log('surface feat', surface);

	} else if (nostr.mode === 'following') {

		surface = Object.keys(contacts);
	}

	return {
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		//active: active.pubkey || '',
		mobile: app.mobile,
		feed: nostr.main,
		mode: nostr.mode,
		newpubs: nostr.main ? nostr.main.newpubs : [],
		active: nostr.pubkey,
		pendingContacts: nostr.pendingContacts,
		contacts,
		selected,
		surface,
		searchActive: query.active
	};
};

const styles = {

	container: ({ hidden, searchActive }) => {
		return {
			color: '#fff',
			overflow: 'hidden',
			pointerEvents: searchActive === 'frontpage' ? 'none' : 'auto',
			opacity: searchActive === 'frontpage' ? 0 : 1
		};
	}

};

export default connect(mapState, { navigate, nostrFollow })(FrontPageFeed);
