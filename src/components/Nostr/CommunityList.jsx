import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { LazyList } from '../CommonUI';
import RelativeTime from '../common/RelativeTime';

import { COLORS } from '../../constants';
import crownsvg from '../../assets/crown_muted.svg';
import astronautsvg from '../../assets/astronaut.svg';
import { loadCommunitiesIndex, navigate, subscribeToCommunity } from '../../actions';

import Name from '../CommunityPage/Name';


class CommunityList extends Component {

	state = { hover: '' };

	componentDidMount = () => {

		this.props.loadCommunitiesIndex();
	};

	handleFollowCommunity = (e, item, subscribe) => {

		e.preventDefault();
		e.stopPropagation();

		// const { name, ownerpubkey, subscribed } = this.props;

		this.props.subscribeToCommunity({
			a: `34550:${item.event.pubkey}:${item.name}`,
			subscribe
		});
	};

	renderList = () => {

		const { mobile, clientWidth } = this.props;

		const list = this.props.list.filter(item => {

			if (this.props.requireSubscribed && !this.props.followingList[`34550:${item.event.pubkey}:${item.name}`]) {
				return false;
			}

			return (item.image || !this.props.requireImage)
			&& (!this.props.filter || this.props.filter(item));

		}).sort((a, b) => {

			const coordA = `34550:${a.event.pubkey}:${a.name}`;
			const coordB = `34550:${b.event.pubkey}:${b.name}`;

			// const followingA = this.props.followingList[coordA];
			// const followingB = this.props.followingList[coordB];

			// if (followingA && !followingB) { return -1; }
			// if (followingB && !followingA) { return 1; }

			const activeA = this.props.activeTimestamp[coordA] || 0;
			const activeB = this.props.activeTimestamp[coordB] || 0;

			return activeB - activeA;

		}).map(item => {

			const coord = `34550:${item.event.pubkey}:${item.name}`;
			const foundernpub = nip19.npubEncode(item.event.pubkey);
			const following = this.props.followingList[coord];
			const activeTimestamp = this.props.activeTimestamp[coord];
			const followingCount = Object.keys(this.props.followingMap[coord] || {}).length;
			const key = `${item.name}:${item.event.pubkey}`;

			return (
				<Link
					key={key}
					to={`/n/${item.name}/${foundernpub}`}
				>
					<div
						onMouseOver={() => this.setState({ hover: key })}
						onMouseOut={() => this.setState({ hover: '' })}
						style={{
							//overflow: 'auto',
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							padding: mobile ? 12 : '12px 16px',
							borderRadius: 12,
							marginBottom: 12,
							overflow: 'hidden',
							background: /*this.state.hover === key*/true ? 'rgba(31, 32, 33, 0.7)' : 'none'
						}}
					>
						<div
							src={item.image}
							style={{
								borderRadius: 76,
								backgroundImage: item.image ? `url(${item.image})` : null,
								height: 82,
								minWidth: 82,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								border: `0.5px solid #fff`,
								marginRight: 12
							}}
						/>
						<div style={{ width: '100%' }}>
							<div style={{
								display: 'flex',
								alignItems: 'center',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								//textOverflow: 'ellipsis',
								marginBottom: 4,
								justifyContent: 'space-between'
							}}>
								<div
									style={{
										display: 'flex',
										//width: '70%',
										overflow: 'hidden',
										maxWidth: (mobile ? clientWidth : clientWidth * 0.35 ) - (mobile ? 184 : 196)
										//textOverflow: 'ellipsis'
									}}
								>
									<div style={{
										display: 'flex',
										opacity: this.state.hover === key ? 1 : 0.85
									}}>
	{/*									{following ? (
											<Icon name='circle check' style={{ marginRight: 6, height: 18, color: '#fff' }} />
										) : null}*/}
										<div style={{
											fontSize: 14,
											fontWeight: 'bold',
											color: '#fff',
											marginRight: 12
										}}>
											n/{item.name}
										</div>
									</div>
									<div style={{
										fontSize: 12,
										height: 19,
										//marginRight: 12,
										//display: 'flex'
										whiteSpace: 'nowrap',
										textOverflow: 'ellipsis',
										overflow: 'hidden',
										color: COLORS.secondaryBright
										//background: COLORS.primary
									}}>
										<img
											src={crownsvg}
											style={{
												transform: 'translate(0px, 1px)',
												marginRight: 4,
												height: 11
											}}
										/>
										<span onClick={() => this.props.navigate(`/@${foundernpub}`)} /*to={`/@${foundernpub}`}*/>
											<Name
												npub={foundernpub}
												profile={this.props.metadata[item.event.pubkey]}
												style={{
													// textOverflow: 'ellipsis',
													// overflow: 'hidden',
													color: /*COLORS.satelliteGold*/COLORS.secondaryBright
												}}
											/>
										</span>
									</div>
								</div>
								<div
									style={{
										color: 'rgba(255,255,255,0.75)',
										fontSize: 12,
										display: 'flex',
										alignItems: 'center',
										marginLeft: 12,
										fontFamily: 'JetBrains-Mono-Regular'
									}}
								>
									<Icon
										name='user'
										style={{
											fontSize: 10,
											height: 21
										}}
									/>
									<span>
										{followingCount}
									</span>
								</div>
							</div>
							<div
								style={{
									color: COLORS.secondaryBright,
									fontSize: 13,
									lineHeight: '19px',
									marginBottom: 4,
									display: '-webkit-box',
									overflowWrap: 'anywhere',
									WebkitLineClamp: 2,
									//minHeight: 38,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden'
								}}
							>
								{item.description}
							</div>
							<div style={{
								display: 'flex',
								alignItems: 'center',
								// width: 200,
								//whiteSpace: 'nowrap',
								// overflow: 'hidden'
								justifyContent: 'space-between',
								marginTop: 6
							}}>
								{activeTimestamp ? (<div
									style={{
										color: 'rgba(255,255,255,0.75)',
										fontSize: 12,
										display: 'flex',
										alignItems: 'center',
										marginRight: 10
									}}
								>
									<Icon
										name='clock outline'
										style={{
											fontSize: 12,
											height: 19
										}}
									/>
									<span style={{ marginRight: 3 }}>active</span>
									<RelativeTime
										time={activeTimestamp}
									/>
								</div>) : <div />}
								<Icon
									onMouseOver={() => this.setState({ hoverSubscribe: key })}
									onMouseOut={() => this.setState({ hoverSubscribe: '' })}
									onClick={e => this.handleFollowCommunity(e, item, !following)}
									name='circle check'
									style={{
										opacity: this.state.hoverSubscribe === key || following ? 1 : 0.85,
										height: 19,
										//display: 'flex',
										//padding: 10,
										//alignItems: 'center',
										//justifyContent: 'center',
										margin: 0,
										cursor: 'pointer',
										color: following ? COLORS.satelliteGold : COLORS.secondaryBright
									}}
								/>
{/*								<div
									onMouseOver={() => this.setState({ hoverSubscribe: key })}
									onMouseOut={() => this.setState({ hoverSubscribe: '' })}
									style={{
										color: following ? '#fff' : '#fff',
										opacity: this.state.hoverSubscribe === key ? 1 : 0.85,
										cursor: 'pointer',
										fontSize: 10,
										display: 'flex',
										//alignItems: 'center',
										textTransform: 'uppercase',
										fontFamily: 'JetBrains-Mono-Regular',
										transform: 'translate(0px, 1px)',
										border: `1px solid ${COLORS.secondary}`,
										paddingLeft: 4,
										paddingRight: 4,
										borderRadius: 4,
										height: 21
									}}
								>
									{following ? <Icon name='circle check' style={{ fontSize: 11, color: COLORS.satelliteGold }} /> : null}
									{following ? 'subscribed' : 'subscribe'}
								</div>
*/}{/*								<div
									style={{
										color: 'rgba(255,255,255,0.75)',
										fontSize: 12,
										display: 'flex',
										alignItems: 'center'
									}}
								>
									<Icon
										name='user outline'
										style={{
											fontSize: 11,
											height: 19
										}}
									/>
									<span>
										{followingCount}
									</span>
								</div>*/}
{/*								<div style={{
									color: following ? '#fff' : COLORS.secondaryBright,
									fontFamily: 'JetBrains-Mono-Bold',
									fontSize: 11,
									display: 'flex'
								}}>
									<img
										src={astronautsvg}
										style={{
											height: 11,
											marginTop: 4,
											marginRight: 4
										}}
									/>
									<span>{followingCount}</span>
								</div>*/}
							</div>
						</div>
					</div>
				</Link>
			);
		});

		if (this.props.requireSubscribed && list.length === 0) {

			return (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					paddingTop: this.props.mobile ? 2 : 14
				}}>
					<div style={{
						width: '60%',
						color: COLORS.secondaryBright,
						fontSize: 13,
						textAlign: 'center'
					}}>
						{this.props.active ? `Communities you're subscribed to will show up here` : `When you're signed in, communities you're subscribed to will show up here`}
					</div>
				</div>
			);
		}

		return mobile ? (
			<LazyList
				overflowContainer={this.props.overflowContainer || window}
				renderBatch={this.props.lazyRenderBatch || 20}
				offsetLead={1000}
			>
				{list}
			</LazyList>
		) : list;
	};

	render = () => {

		return (
			<div>
				{this.renderList()}
			</div>
		);
	};
}

const mapState = ({ nostr, communities, app }) => {
	return {
		clientWidth: app.clientWidth,
		mobile: app.mobile,
		main: nostr.main,
		//navMode: communities.navMode,
		activeTimestamp: communities.activeTimestamp,
		followingList: communities.followingList,
		followingMap: communities.followingMap,
		metadata: /*nostr.main.metadata*/communities.metadata,
		list: Object.keys(communities.list).map(id => {
			return communities.list[id];
		})
	};
};

export default connect(mapState, { loadCommunitiesIndex, navigate, subscribeToCommunity })(CommunityList);
