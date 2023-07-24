import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import Post from './Post';

import { COLORS } from '../../constants';


class List extends PureComponent {

	render = () => {

		const { items, sort, rankBatch, rankMode } = this.props;

		if (items === null) {
			return null; // TODO loading animation
		}

		const sortRanked = (_items) => {

			if (rankMode === 'zaps') {

				return _items.map(item => {
					if (this.props.feed.zaps[item.event.id]) {
						item.zapTotal = Object.keys(this.props.feed.zaps[item.event.id]).reduce((acc, sender) => {
							return acc + Object.keys(this.props.feed.zaps[item.event.id][sender]).reduce((_acc, zap) => {
								return _acc + this.props.feed.zaps[item.event.id][sender][zap].sats || 0;
							}, 0);
						}, 0);
					} else {
						item.zapTotal = 0;
					}
					return item;
				}).sort((a, b) => {

					if (b.zapTotal === a.zapTotal) {
						return b.event.created_at - a.event.created_at
					}

					return b.zapTotal - a.zapTotal;
				});

			} else {

				return _items.sort((a, b) => {

					const _a = this.props.voteBalance[a.event.id] || 0;
					const _b = this.props.voteBalance[b.event.id] || 0;

					if (_b === _a) {
						return b.event.created_at - a.event.created_at;
					}

					return _b - _a;
				});
			}
		};

		const chrono = items.sort((a, b) => {
			return b.event.created_at - a.event.created_at;
		});

		const ranked = (sort === 'new') ? chrono : (rankBatch ? [
			...sortRanked(chrono.slice(0, rankBatch)),
			...chrono.slice(rankBatch)
		] : sortRanked(chrono));

		return (
			<div style={{
				paddingBottom: 196
			}}>
				{ranked.map((item, index) => {
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
							handleVote={(vote, params) => this.props.handleVote(item, vote, params)}
							navigate={this.props.navigate}
							clientWidth={this.props.clientWidth}
							upvotes={item.upvotes}
							downvotes={item.downvotes}
							voteBalance={this.props.voteBalance[item.event.id] || 0}
							zapTotal={item.zapTotal || 0}
							zappedByActive={this.props.pubkey && this.props.feed.zaps[item.event.id] && this.props.feed.zaps[item.event.id][this.props.pubkey]}
							pubkey={this.props.pubkey}
							rankMode={this.props.rankMode}
						/>
					);
				})}
			</div>
		);
	};
}

export default List;
