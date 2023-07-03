import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import AliasMenu from './AliasMenu';
import PrettySVG from '../common/PrettySVG';
import Image from '../Nostr/Image';

import logo from '../../assets/branding.png';
import svgfrontpage from '../../assets/frontpage.svg';
import svgstaroutline from '../../assets/star_outline.svg';
import svgearth from '../../assets/earth.svg';
import svgalias from '../../assets/alias.svg';

import { setLocalPublicKey, loadActiveNostr, hoverAliasMenu, navigate, showAliasMenuMobile, viewSidePanel, setDirectoryLayoutExpanded, setNewPostModalOpen } from '../../actions';
import { transition } from '../../helpers';
import { COLORS, NAV_HEIGHT } from '../../constants';


class Nav extends Component {

	state = { down: 0, up: 0, hover: '' };

	componentWillUnmount = () => {
		clearInterval(this.getTransferRates);
	};

	componentDidMount = () => {

		this._detectNostr = setTimeout(() => {
			if (window.nostr) {
				this.setState({
					nostrDetected: true
				});
			}
		}, 1500);

	};

	handleSignInHover = async () => {

		this.setState({ hover: 'signin', signInAsHoverError: '' });
	};

	handleSignIn = async () => {

		if (window.nostr) {

			let pubkey;

			try {

				pubkey = await window.nostr.getPublicKey();

			} catch (err) {}

			if (!pubkey) { return; }

			setLocalPublicKey(pubkey);

			this.props.loadActiveNostr();

		} else {

			this.props.navigate('/auth');
		}
	};

	handleSignUp = () => {

		this.props.navigate('/register');
	};

	handleNewPostClicked = () => {

		this.props.setNewPostModalOpen(true);
	};

	onClickAlias = (hovering) => {
		const { mobile, _showAliasMenuMobile } = this.props;
		if (mobile) {
			this.props.showAliasMenuMobile(!_showAliasMenuMobile);
		} else {
			if (hovering) {
				this.props.hoverAliasMenu(hovering);
			}
		}
	};

	renderBranding = () => {
		return (
			<div
				style={styles.branding}
				onClick={() => { this.props.setDirectoryLayoutExpanded(true); }}
			>
				<Link to='/'>
					<PrettySVG
						onClick={this.props._showLandingPage ? () => { this.props.showLandingPage(false); } : null}
						src={logo}
						height={24}
					/>
				</Link>
			</div>
		);
	};

	renderActionIcon = ({ icon, onClick }) => {

		return (
			<Icon
				style={styles.actionIcon}
				name={icon}
				onClick={onClick}
			/>
		);
	};

	/*
	renderViewToggle = () => {

		if (!this.props.showNavActions) { return null; }
		
		const { alias, mobile, routeComponents, dirExpanded, currentPub, notificationsCount } = this.props;
		const { hover } = this.state;
		const d = mobile ? 21 : 16;

		const onClickPublications = () => {

			this.props.showLandingPage(false);

			if (!mobile && routeComponents[0] === 'thread' || (routeComponents[0] === '' && currentPub)) {
				if (!dirExpanded && window._expandToggle) {
					window._expandToggle();
				}
				
			} else {
				this.props.navigate('/');
			}
		};

		return (
			<div style={styles.viewToggleContainer(mobile, mobile && notificationsCount > 0)}>
				<div
					style={{ ...styles.action(hover === 'publications', (dirExpanded || mobile) && !this.props._showLandingPage && (routeComponents[0] === '' || routeComponents[0] === 'thread')), marginLeft: 0 }}
					onMouseOver={() => this.setState({ hover: 'publications' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={onClickPublications}
				>
					<PrettySVG style={{ float: 'left', marginTop: mobile ? 0 : 4, marginRight: mobile ? 0 : 2 }} src={svgfrontpage} height={d} width={d} />
					{mobile ? null : <div style={{ ...styles.actionLabel, wordSpacing: -3 }}>FRONT PAGE</div>}
				</div>
				<div style={styles.vdiv(mobile)} />
				<Link to='/federation'>
					<div
						style={{ ...styles.action(hover === 'federation', routeComponents[0] === 'federation'), marginLeft: 0 }}
						onMouseOver={() => this.setState({ hover: 'federation' })}
						onMouseOut={() => this.setState({ hover: '' })}
					>
						<PrettySVG style={{ float: 'left', marginTop: mobile ? 0 : 4, marginRight: mobile ? 0 : 1 }} src={svgearth} height={d} width={d} />
						{mobile ? null : <div style={styles.actionLabel}>FEDERATION</div>}
					</div>
				</Link>
				<div style={styles.vdiv(mobile)} />
				<Link to='/constellation'>
					<div
						style={{ ...styles.action(hover === 'constellation', routeComponents[0] === 'constellation'), marginLeft: 0 }}
						onMouseOver={() => this.setState({ hover: 'constellation' })}
						onMouseOut={() => this.setState({ hover: '' })}
					>
						<PrettySVG style={{ float: 'left', marginTop: mobile ? 0 : 3, marginRight: mobile ? 0 : 1 }} src={svgstaroutline} height={d + 2} width={d + 2} />
						{mobile ? null : <div style={styles.actionLabel}>CONSTELLATION</div>}
					</div>
				</Link>
				{mobile && alias !== '' ? (<div style={styles.vdiv(mobile)} />) : null}
				{mobile && alias !== '' ? (
					(this.props.thumb ? (<Image
						id='alias_icon'
						src={this.props.thumb}
						onClick={this.onClickAlias}
						style={styles.aliasIconMobile(notificationsCount > 0)}
						onLoadState={() => this.setState({ loadedUserIcon: true })}
					/>) : (
						<PrettySVG
							id='alias_icon'
							src={svgalias}
							height={20}
							width={20}
							style={{ float: 'left', marginTop: 2, opacity: 0.85 }}
							onClick={this.onClickAlias}
						/>
					))) : null}
			</div>
		);
	};
	*/

	renderUserIcon = () => {

		if (!this.props.showNavActions) { return null; }

		const { alias, activeAuth, _hoverAliasMenu, mobile, activeUpdating, notificationsCount } = this.props;
		const { hover } = this.state;

		if (mobile || !alias) { return null; }

		return (
			<div
				style={{ height: 30, opacity: activeUpdating ? 0 : 1 }}
				onMouseOver={() => this.setState({ hover: 'alias' })}
				onMouseOut={() => this.setState({ hover: '' })}
			>
				{activeAuth ? <div onClick={activeAuth ? this.onClickAlias : null} style={styles.activeAlias} /> : null}
				{alias === '' && !activeUpdating ? null : (
					<Image
						id='alias_icon'
						src={this.props.thumb}
						style={styles.aliasIcon(hover === 'alias'/* || activeAuth*/, false, true, notificationsCount > 0)}
						onClick={activeAuth ? null : this.onClickAlias}
						onLoadState={() => this.setState({ loadedUserIcon: true })}
					/>
				)}
				{_hoverAliasMenu ? <AliasMenu /> : null}
			</div>
		);
	};

	renderActions = () => {

		if (!this.props.showNavActions) { return null; }

		const { loadedRoute } = this.props;
		return loadedRoute ? (
			<div style={styles.actions(true)}>
				{this.renderViewToggle()}
				{this.renderUserIcon()}
			</div>
		) : null;
	};

	renderAnonUserActions = () => {

		if (!this.props.showNavActions) { return null; }

		const { route, mobile } = this.props;

		if (this.props.pubkey) { return null; }

		const signInButton = (
			<div
				onClick={this.handleSignIn}
				onMouseOver={this.handleSignInHover}
				onMouseOut={() => this.setState({ hover: '' })}
				style={{
					...styles.signUp(this.state.hover === 'signin', false, mobile),
					color: window.nostr || this.state.nostrDetected ? COLORS.satelliteGold : '#fff'
				}}
			>
				{window.nostr || this.state.nostrDetected ? 'CONNECT NOSTR' : 'SIGN IN'}
			</div>
		);

		return (
			<span>
				{(window.nostr || this.state.nostrDetected || route.indexOf('/register') === 0)/* && (!mobile || route.indexOf('/auth') === 0*/ ? null : (
					<div
						onClick={this.handleSignUp}
						onMouseOver={() => this.setState({ hover: 'signup' })}
						onMouseOut={() => this.setState({ hover: '' })}
						style={{
							...styles.signUp(this.state.hover === 'signup', false, mobile),
							color: COLORS.satelliteGold
						}}
					>
						SIGN UP
					</div>
				)}
				{route.indexOf('/auth') === 0 ? null : signInButton}
			</span>
		);
	};

	renderNotifications = () => {

		const { notificationsCount, mobile } = this.props;

		if (!notificationsCount) { return null; }

		return (
			<div
				style={{
					marginLeft: mobile ? 8 : 10,
					marginRight: mobile ? -4 : -10,
					opacity: notificationsCount > 0 ? 1 : 0,
					//...transition(0.2, 'ease', [ 'opacity' ])
				}}
			>
				<Icon
					onMouseOver={() => this.setState({ hover: 'notifications' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={() => this.props.viewSidePanel('notifications')}
					name='bell'
					style={{
						opacity: this.state.hover === 'notifications' ? 1 : 0.9,
						cursor: 'pointer',
						fontSize: mobile ? 14 : 15,
						color: COLORS.satelliteGold,
						marginRight: 0
					}}
				/>
			</div>
		);

		return null;
	};

	renderNostrAuthenticated = () => {

		if (!this.props.pubkey) { return null; }

		const { name, display_name, picture } = (this.props.profile || {});

		const pubkeyName = () => {
			const encoded = nip19.npubEncode(this.props.pubkey);
			return encoded.slice(0, 8) + '...' + encoded.slice(-4);
		};

		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					cursor: 'pointer',
					height: 48,
					justifyContent: 'right',
					width: 'fit-content',
					maxWidth: this.props.mobile ? 180 : null,
					float: 'right'
				}}
			>
				{this.props.mobile || this.props.profilePubkey === this.props.pubkey || this.props.routeComponents[0] === 's' ? null : (
					<div
						onClick={this.handleNewPostClicked}
						style={{
							color: COLORS.satelliteGold,
							opacity: 1,
							marginRight: 24,
							fontFamily: 'JetBrains-Mono-Bold',
							borderRadius: 5,
							cursor: 'pointer',
							minWidth: 28,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 12
						}}
					>
						<Icon
							name='plus'
							style={{
								height: 19,
								marginRight: 4,
								fontSize: 13
							}}
						/>
						<span style={{ height: 18 }}>
							NEW POST
						</span>
					</div>
				)}
				<div
					style={{ display: 'flex', alignItems: 'center' }}
					onClick={(e) => {
						e.stopPropagation();
						if (this.props.mobile) {
							this.props.showAliasMenuMobile(!this.props._showAliasMenuMobile);
						} else {
							this.props.hoverAliasMenu(!this.props._hoverAliasMenu)
						}
					}}
				>
					<div style={{
						color: '#fff',
						marginRight: 10,
						fontWeight: 'bold',
						overflow: 'hidden',
						textOverflow: 'ellipsis'
					}}>
						{display_name || name || pubkeyName(this.props.pubkey)}
					</div>
					<Image
						src={picture}
						style={{
							height: 28,
							width: 28,
							borderRadius: 14,
							border: `1px solid ${COLORS.secondary}`
						}}
					/>
				</div>
				{/*{this.renderNotifications()}*/}
			</div>
		);
	};

	render = () => {
		return (
			<div id='main_nav' style={styles.container(this.props)}>
				{this.renderBranding()}
				{this.renderAnonUserActions()}
				{this.renderNostrAuthenticated()}
				{this.props._hoverAliasMenu ? <AliasMenu pubkey={this.props.pubkey} profile={this.props.profile} /> : null}
			</div>
		);
	};
}

const mapState = ({ app, nostr, notifications }) => {
	return {
		profilePubkey: nostr.profilePubkey,
		pubkey: nostr.pubkey,
		loadedRoute: app.route !== null,
		_showAliasMenuMobile: app.showAliasMenuMobile,
		_showLandingPage: app.showLandingPage,
		_hoverAliasMenu: app.hoverAliasMenu,
		mobile: app.mobile,
		dirExpanded: app.dirExpanded,
		routeComponents: app.routeComponents,
		route: app.route,
		showNavActions: app.showNavActions,
		mobileEditor: nostr.mobileEditor || {},
		profile: (nostr.metadata || {})[nostr.pubkey],
		notificationsCount: Object.keys(notifications).length
	};
};

const styles = {

	container: ({ mobile, mobileEditor }) => {
		return {
			whiteSpace: 'nowrap',
			paddingLeft: mobile ? 12 : 24/*48*/,
			paddingRight: mobile ? 12 : 24/*48*/,
			height: NAV_HEIGHT,
			zIndex: 1112,
			width: '100%',
			position: 'absolute',
			top: 0,
			left: 0,
			borderBottom: '1px solid #2f363d',
			pointerEvents: mobileEditor.open ? 'none' : 'auto',
      opacity: mobileEditor.open ? 0 : 1
		};
	},

	aliasIcon: (hover, active, image, notifications) => {
		return {
			color: '#fff',
			opacity: hover || active ? 1 : 0.85,
			height: 30,
			width: 30,
			padding: 2,
			border: `1px solid ${notifications ? COLORS.satelliteGold : COLORS.secondary}`,
			borderRadius: 18,
			userSelect: 'none'
		};
	},

	aliasIconMobile: (notifications) => {
		return {
			height: 30,
			width: 30,
			padding: 2,
			border: `1px solid ${notifications ? COLORS.satelliteGold : COLORS.secondary}`,
			borderRadius: 18,
			marginLeft: -3,
			userSelect: 'none',
			marginRight: 0
		};
	},

	viewToggleContainer: (mobile, showNotifications) => {
		return {
			userSelect: 'none',
			borderRadius: 8,
			marginRight: !mobile ? /*8*/18 : 0,
			alignItems: 'center',
			display: 'flex',
			height: 48
		};
	},

	signUp: (hover, disabled, mobile) => {
		return {
			color: '#fff',
			opacity: hover || mobile ? 1 : 0.85,
			float: 'right',
			marginTop: 11,
			marginLeft: mobile ? 12 : 8,
			border: '1px solid rgb(47, 54, 61)',
			padding: mobile ? '7px 8px 6px' : '7px 10px 6px',
			fontFamily: 'JetBrains-Mono-Bold',
			fontSize: 11,
			lineHeight: '11px',
			borderRadius: 5,
			cursor: disabled ? 'default' : 'pointer'
		};
	},

	activeAlias: {
		height: 30,
		width: 30,
		position: 'absolute',
		cursor: 'pointer'
	},

	branding: {
		userSelect: 'none',
		marginTop: 11,
		float: 'left'
	},

	notifications: {
		position: 'relative',
		left: 40,
		top: -20,
		cursor: 'pointer',
		color: COLORS.satelliteGold,
		fontFamily: 'JetBrains-Mono-Regular'
	},

	actions: (visible) => {
		return {
			float: 'right',
			//marginTop: 12,
			cursor: 'pointer',
			display: 'flex',
			alignItems: 'center',
			height: NAV_HEIGHT,
			opacity: visible ? 1 : 0,
			...transition(0.2, 'ease', [ 'opacity' ])
		};
	},

	action: (hover, active) => {
		return {
			color: '#fff',
			marginLeft: 16,
			float: 'left',
			opacity: hover || active ? 1 : 0.85,
			fontFamily: active ? 'JetBrains-Mono-Bold' : 'JetBrains-Mono-Regular'
		};
	},

	actionLabel: {
		float: 'left',
		marginLeft: 4,
		marginTop: 3,
		fontSize: 12
	},

	post: {
		marginLeft: 16,
		marginTop: -2,
		padding: '5px 16px',
		border: '1px solid #fff',
		borderRadius: 18,
		float: 'left',
		color: '#fff',
		textDecoration: 'none'
	},

	vdiv: (mobile) => {
		return {
			float: 'left',
			borderRight: mobile ? 'none' : '1px solid rgb(47, 54, 61)',
			height: 24,
			marginRight: mobile ? 6 : 10,
			marginLeft: mobile ? 6 : 10
		};
	}
};

export default connect(mapState, { loadActiveNostr, hoverAliasMenu, navigate, showAliasMenuMobile, viewSidePanel, setDirectoryLayoutExpanded, setNewPostModalOpen })(Nav);
