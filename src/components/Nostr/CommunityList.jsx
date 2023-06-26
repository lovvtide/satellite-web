import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { COLORS } from '../../constants';
import crownsvg from '../../assets/crown.svg';

import Name from '../CommunityPage/Name';


class CommunityList extends PureComponent {

	componentDidMount = () => {

		if (this.props.main && !this.props.main.subscriptions['community_index']) {

			//console.log('mounted', this.props.main);

			window.client.subscribe('community_index', this.props.main, [{
				kinds: [ 34550 ]
			}]);

		}

	};

	// componentDidUpdate = (prevProps) => {

	// 	console.log('did update', this.props, prevProps);

	// 	if (!prevProps.main && this.props.main) {

	// 		console.log('this.props.main');

	// 		window.client.subscribe('community_index', this.props.main, [{
	// 			kinds: [ 34450 ]
	// 		}]);
	// 	}
	// };

	// componentWillUnmount = () => {

	// 	if (window._communityindex) {

	// 		window._communityindex.unregisterObserver('community_index');
	// 	}
	// };

	renderList = () => {

		return this.props.list.filter(item => {
			return item.image;
		}).map(item => {

			//console.log('item', item);

			const foundernpub = nip19.npubEncode(item.event.pubkey);

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
							whiteSpace: 'nowrap'
						}}>
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
										//pubkey={item.event.pubkey}
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
		list: communities.list,
		metadata: communities.metadata
	};
};

export default connect(mapState)(CommunityList);
