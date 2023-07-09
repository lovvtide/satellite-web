import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { COLORS } from '../../constants';
import crownsvg from '../../assets/crown.svg';

import Name from '../CommunityPage/Name';


class CommunityList extends PureComponent {

	componentDidMount = () => {

		if (this.props.main && !this.props.main.subscriptions['community_index']) {

			window.client.subscribe('community_index', this.props.main, [{
				kinds: [ 34550 ]
			}]);

		}

	};

	renderList = () => {

		return this.props.list.filter(item => {
			return item.image;
		}).sort((a, b) => {

			const followingA = this.props.followingList[`34550:${a.event.pubkey}:${a.name}`];
			const followingB = this.props.followingList[`34550:${b.event.pubkey}:${b.name}`];

			if (followingA && !followingB) { return -1; }
			if (followingB && !followingA) { return 1; }
			if (followingA && followingB) { return 0; }

		}).map(item => {

			const foundernpub = nip19.npubEncode(item.event.pubkey);
			const following = this.props.followingList[`34550:${item.event.pubkey}:${item.name}`];

			return (
				<Link
					key={`${item.name}:${item.event.pubkey}`}
					to={`/n/${item.name}/${foundernpub}`}
				>
					<div
						style={{
							marginBottom: 18
						}}
					>
						<div
							src={item.image}
							style={{
								borderRadius: 5,
								backgroundImage: `url(${item.image})`,
								height: 180,
								width: '100%',
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								border: `0.5px solid ${COLORS.secondary}`
							}}
						/>
						<div style={{
							display: 'flex',
							alignItems: 'center',
							marginTop: 6,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis'
						}}>
							{following ? (
								<Icon name='circle check' style={{ marginRight: 6, height: 18, color: '#fff' }} />
							) : null}
							<div style={{
								fontSize: 14,
								fontWeight: 'bold',
								color: '#fff',
								marginRight: 12
							}}>n/{item.name}</div>
							<div style={{
								fontSize: 13,
								height: 19,
								background: COLORS.primary
							}}>
								<img
									src={crownsvg}
									style={{
										transform: 'translate(0px, 1px)',
										marginRight: 4,
										height: 12
									}}
								/>
								<Link to={`/@${foundernpub}`}>
									<Name
										npub={foundernpub}
										profile={this.props.metadata[item.event.pubkey]}
										style={{
											color: COLORS.satelliteGold
										}}
									/>
								</Link>
							</div>
						</div>
					</div>
				</Link>
			);
		});
	};

	render = () => {

		return (
			<div>
				{this.renderList()}
			</div>
		);
	};
}

const mapState = ({ nostr, communities }) => {
	return {
		main: nostr.main,
		followingList: communities.followingList,
		metadata: communities.metadata,
		list: Object.keys(communities.list).map(id => {
			return communities.list[id];
		})
	};
};

export default connect(mapState)(CommunityList);
