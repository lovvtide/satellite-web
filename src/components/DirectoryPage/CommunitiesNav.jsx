import React, { Component } from 'react';
import { connect } from 'react-redux';

import svgearth from '../../assets/earth.svg';

import { setCommunitiesNavMode } from '../../actions';
import { COLORS } from '../../constants';


class CommunitiesNav extends Component {

	handleSelectCommunityNav = (mode) => {

		this.props.setCommunitiesNavMode(mode);
	};

	render = () => {

		const { communitiesNavMode, mobile } = this.props;

		const navStyle = ({ active }) => {
			return {
				cursor: 'pointer',
				color: active ? '#fff' : COLORS.secondaryBright,
				fontSize: mobile ? 14 : 13,
				fontWeight: 'bold',
				fontFamily: 'Lexend-Deca-Regular',
				borderBottom: this.props.mobile ? 'none' : `2px solid ${active ? '#fff' : 'transparent'}`,
				paddingBottom: this.props.mobile ? 0 : 2
				//marginBottom: 3
			};
		};

		return (
			<div
				id={this.props.id}
				style={this.props.style}
			>
				{/*this.props.mobile*/true ? null : (<div
					style={{
						display: 'flex',
						alignItems: 'center',
						marginRight: 12,
						fontSize: 12,
						fontFamily: 'JetBrains-Mono-Bold',
					}}
				>
					<img
						src={svgearth}
						style={{
							marginRight: 8,
							height: 18,
							width: 18,
							marginBottom: 2,
							fontSize: 12,
							fontFamily: 'JetBrains-Mono-Regular',
						}}
					/>
					<span>
						COMMUNITIES:
					</span>
				</div>)}
				<div
					onClick={() => this.handleSelectCommunityNav('active')}
					style={navStyle({ active: communitiesNavMode === 'active' })}
				>
					Communities
				</div>
				<div style={{
					marginLeft: mobile ? 12 : 8,
					marginRight: mobile ? 12 : 8,
				}} />
				<div
					onClick={() => this.handleSelectCommunityNav('subscribed')}
					style={navStyle({ active: communitiesNavMode === 'subscribed' })}
				>
					Subscribed
				</div>
			</div>
		);
	};
}

const mapState = ({ communities, app }) => {

	return {
		communitiesNavMode: communities.navMode,
		mobile: app.mobile
	};
};

export default connect(mapState, { setCommunitiesNavMode })(CommunitiesNav);
