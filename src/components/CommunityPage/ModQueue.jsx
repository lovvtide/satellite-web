import React, { PureComponent } from 'react';

import Post from './Post';


class ModQueue extends PureComponent {

	render = () => {

		const { items } = this.props;

		if (items === null) {
			return null; // TODO loading animation
		}

		return (
			<div style={{
				paddingBottom: 196
			}}>
				{items.map(item => {
					const name = item.postedTo ? item.postedTo.name : this.props.name;
					const owner = item.postedTo ? item.postedTo.owner : this.props.ownernpub;
					return {
						...item,
						name,
						owner
					};
				}).filter(item => {
					return !item.coord
					|| !this.props.approvals
					|| !this.props.approvals[item.coord];
				}).map((item, index) => {
					return (
						<Post
							modqueue
							feed={this.props.feed}
							key={item.event.id}
							event={item.event}
							base={`/n/${item.name}/${item.owner}`}
							handleApprove={() => this.props.handleApprovePost(item)}
							moderator={this.props.moderator}
							profile={this.props.metadata[item.event.pubkey] ? (this.props.metadata[item.event.pubkey].profile) || {} : {}}
							metadata={this.props.metadata}
							postedTo={item.postedTo}
							mobile={this.props.mobile}
							searchActive={this.props.searchActive}
							handlePost={this.props.handlePost}
							handleMobileReply={this.props.handleMobileReply}
							handleSelectThread={this.props.handleSelectThread}
							handleQueryProfiles={this.props.handleQueryProfiles}
							handleZapRequest={this.props.handleZapRequest}
							handleFollow={this.props.handleFollow}
							navigate={this.props.navigate}
						/>
					);
				})}
			</div>
		);
	};
}

export default ModQueue;
