import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { setMobileNavMode, navigate, viewSidePanel, showAliasMenuMobile, loadActiveNostr, setLocalPublicKey } from '../../actions';
import { COLORS } from '../../constants';
import svgcommunities from '../../assets/communities.svg';
import svgcommunitiesoutline from '../../assets/communities-outline.svg';


class MobileNav extends Component {

	handleAuthActionFallback = async () => {

		if (window.nostr) {

			let pubkey;

			try {

				pubkey = await window.nostr.getPublicKey();

			} catch (err) {}

			if (!pubkey) { return; }

			setLocalPublicKey(pubkey);

			this.props.loadActiveNostr();

			return true;

		} else {

			this.props.navigate('/register');
		}
	};

	handleMenuSelect = async (selected) => {

		let connected;

		if (selected === 'home') {

			this.props.setMobileNavMode('network');
			//window.history.back();
			this.props.navigate('/');

		} else if (selected === 'communities') {

			this.props.setMobileNavMode('communities');
			//window.history.back();
			this.props.navigate('/');

		} else if (selected === 'conversations') {

			if (!this.props.pubkey) {

				connected = await this.handleAuthActionFallback();

				if (connected) {
					
					setTimeout(() => {
						this.props.viewSidePanel('notifications');
					}, 1000);

					return;

				} else {
					return;
				}
			}

			this.props.viewSidePanel('notifications');

		} else if (selected === 'messages') {

			if (!this.props.pubkey) {

				connected = await this.handleAuthActionFallback();

				if (!connected) {
					return;
				}
			}

			this.props.viewSidePanel('dm');

		} else if (selected === 'menu') {

			if (!this.props.pubkey) {

				connected = await this.handleAuthActionFallback();

				if (!connected) {
					return;
				}
			}

			this.props.showAliasMenuMobile(true);
		}
	};

	render = () => {

		const { route, mobileNavMode } = this.props;

		if (route === '/auth' || route === 'register') { return null; }

		return (
			<div
				style={{
					position: 'fixed',
					bottom: -1,
					height: 52,
					borderTop: `1px solid ${COLORS.secondary}`,
					width: this.props.clientWidth,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-evenly',
					WebkitBackdropFilter: 'blur(12px)',
					backdropFilter: 'blur(12px)',
					background: 'rgba(23, 24, 25, 0.80)'
				}}
			>
				<div
					onClick={() => this.handleMenuSelect('home')}
				>
					<Icon
						name={route === '/' && mobileNavMode === 'network' ? 'moon' : 'moon outline'}
						style={{
							marginRight: 0,
							fontSize: 20
						}}
					/>
{/*					<img
						src={svgsatellite}
						style={{
							height: 20,
							width: 20,
							marginTop: 2
						}}
					/>*/}
				</div>
				<div
					onClick={() => this.handleMenuSelect('communities')}
				>
					<img
						src={route === '/' && mobileNavMode === 'communities' ? svgcommunities : svgcommunitiesoutline}
						style={{
							height: 20,
							width: 20,
							marginTop: 2
						}}
					/>
				</div>
				<div
					onClick={() => this.handleMenuSelect('conversations')}
				>
					<Icon
						name='comments outline'
						style={{
							marginRight: 0,
							fontSize: 20
						}}
					/>
				</div>
				<div
					onClick={() => this.handleMenuSelect('messages')}
				>
					<Icon
						name='envelope outline'
						style={{
							marginRight: 0,
							fontSize: 20
						}}
					/>
				</div>
				<div
					onClick={() => this.handleMenuSelect('menu')}
				>
					<Icon
						name='sidebar'
						style={{
							marginRight: 0,
							fontSize: 20
						}}
					/>
				</div>
			</div>
		);
	};
}

const mapState = ({ app, nostr }) => {

	return {
		mobileNavMode: app.mobileNavMode,
		clientWidth: app.clientWidth,
		route: app.route,
		pubkey: nostr.pubkey
		//topMode: menu.topMode
	};
};

export default connect(mapState, { setMobileNavMode, navigate, viewSidePanel, showAliasMenuMobile, loadActiveNostr })(MobileNav);
