import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import Post from './Post';

import { COLORS } from '../../constants';


class List extends PureComponent {

	render = () => {

		const { items } = this.props;

		if (items === null) {
			return null; // TODO loading animation
		}

		return (
			<div style={{
				paddingBottom: 196
			}}>
				{items.map((item, index) => {
					return (
						<Post
							feed={this.props.feed}
							mobile={this.props.mobile}
							key={item.event.id}
							event={item.event}
							base={`/n/${this.props.name}/${this.props.ownernpub}`}
							approval={item.approval}
							metadata={this.props.metadata}
							profile={this.props.metadata[item.event.pubkey] ? (this.props.metadata[item.event.pubkey].profile) || {} : {}}
							searchActive={this.props.searchActive}
							handlePost={this.props.handlePost}
							handleMobileReply={this.props.handleMobileReply}
							handleSelectThread={this.props.handleSelectThread}
							handleQueryProfiles={this.props.handleQueryProfiles}
							handleZapRequest={this.props.handleZapRequest}
							handleFollow={this.props.handleFollow}
							handleVote={vote => this.props.handleVote(item, vote)}
							navigate={this.props.navigate}
							clientWidth={this.props.clientWidth}
							upvotes={item.upvotes}
							downvotes={item.downvotes}
							voteBalance={this.props.voteBalance[item.event.id] || 0}
						/>
					);
				})}
			</div>
		);
	};
}

export default List;
