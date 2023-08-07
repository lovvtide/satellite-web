import React, { Component } from 'react';
import { connect } from 'react-redux';

import CommunityList from '../Nostr/CommunityList';


class CommunitiesFeed extends Component {

	render = () => {

		// console.log('navmodeprops', this.props);

		return (
			<div
				style={{
					paddingLeft: 12,
					paddingRight: 24,
					paddingTop: 66,
					width: (this.props.clientWidth * 0.35) + 34
				}}
			>
				<CommunityList
					overflowContainer={this.props.overflowContainer}
					requireSubscribed={this.props.navMode === 'subscribed'}
					// filter={this.props.navMode === 'subscribed' ? (item) => {
					// 	return this.props.followingList[`34550:${item.event.pubkey}:${item.name}`]
					// } : null}
				/>
			</div>
		);
	};
}

const mapState = ({ app, communities }) => {

	return {
		clientWidth: app.clientWidth,
		navMode: communities.navMode,
		//followingList: communities.followingList
	};
};

export default connect(mapState)(CommunitiesFeed);
