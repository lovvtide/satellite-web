import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { Chevron } from '../CommonUI';
import Image from '../Nostr/Image';

import { navigate, showAliasMenuMobile, revokeDeviceAuth, viewSidePanel } from '../../actions';
import { transition } from '../../helpers';
import { COLORS } from '../../constants';


class AliasMenuMobile extends PureComponent {

	state = { opened: false };

	componentDidMount = () => {
		this.container = document.getElementById('alias_menu_mobile');
		this.startx = 0;
		this.d = 0;
	};

	componentDidUpdate = (prevProps) => {
		if (this.props.open !== prevProps.open) {
			if (this.props.open) {
				setTimeout(() => {
					this.setState({ opened: true });
				}, 200);
			} else {
				this.setState({ opened: false });
			}
		}
	};

	handleTouchStart = (e) => {
		this.startx = e.targetTouches[0].clientX;
		this.container.style.transition = 'none';
	};

	handleTouchMove = (e) => {
		const { clientWidth } = this.props;
		this.d = e.targetTouches[0].clientX - this.startx;
		this.container.style.width = `${this.d > 0 ? (clientWidth - (64 + this.d)) : clientWidth - 64}px`;
	};

	handleTouchEnd = (e) => {
		this.container.style.transition = 'width 0.2s ease 0s, opacity 0.2s ease 0s';
		if (this.d > (this.props.panelWidth / 2)) { // Close notifications
			this.d = 0;
			this.props.showAliasMenuMobile(false);
		} else { // Snap back
			this.d = 0;
			this.container.style.width = `${this.props.clientWidth - 64}px`;
		}		
	};

	handleClick = (e) => {
		if (e.target.id !== 'alias_icon') {
			this.props.showAliasMenuMobile(false);
		}
	};

	renderProfileAction = () => {
		const { signedIn } = this.props;
		const text = 'View My Profile';
		return signedIn ? (
			<Link to={`/@${nip19.npubEncode(this.props.pubkey)}`} onClick={() => this.props.showAliasMenuMobile(false)}>
				<div>
					<Icon style={styles.actionIcon} name='user circle' />
					<div
						style={styles.link(false)}
						onClick={() => this.props.viewSidePanel('preferences')}
					>
						<span>{text}</span>
					</div>
				</div>
			</Link>
		) : null;
	};

	renderPreferencesAction = () => {
		const { signedIn } = this.props;
		const text = 'Profile Settings';
		return signedIn ? (
			<div>
				<Icon style={styles.actionIcon} name='cog' />
				<div
					style={styles.link(false)}
					onClick={() => this.props.viewSidePanel('preferences')}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	renderSubscriptionsAction = () => {
		const { signedIn } = this.props;
		const text = 'Following list';
		return signedIn ? (
			<div>
				<Icon style={styles.actionIcon} name='check circle' />
				<div
					style={styles.link(false)}
					onClick={() => this.props.viewSidePanel('subscriptions')}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	renderMessagesAction = () => {
		const { signedIn } = this.props;
		const text = 'Messages';
		return signedIn ? (
			<div>
				<Icon style={styles.actionIcon} name='comment alternate' />
				<div
					style={styles.link(false)}
					onClick={() => this.props.viewSidePanel('dm')}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	renderRelaysAction = () => {
		const { signedIn } = this.props;
		const text = 'Relays';
		return signedIn ? (
			<div>
				<Icon style={styles.actionIcon} name='bullseye' />
				<div
					style={styles.link(false)}
					onClick={() => this.props.viewSidePanel('relays')}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	renderAuthAction = () => {

		return (
			<div style={{
				borderTop: `1px solid ${COLORS.secondary}`,
				paddingTop: 12,
				position: 'absolute',
				width: '100%',
				bottom: 12
			}}>
				<Icon style={{ ...styles.actionIcon, color: COLORS.secondaryBright, opacity: 0.8 }} name='sign out' />
				<div
					style={{ ...styles.link(false), color: COLORS.secondaryBright, opacity: 0.8 }}
					onClick={() => {
						this.props.showAliasMenuMobile(false);
						this.props.revokeDeviceAuth();
					}}
				>
					<span>DISCONNECT NOSTR</span>
				</div>
			</div>
		);
	};

	render = () => {
		
		const { open, clientWidth, profile, pubkey } = this.props;

		let profileName = profile.display_name || profile.name;
		let npub;

		if (!profileName && pubkey) {

			const encoded = nip19.npubEncode(pubkey);
			npub = encoded.slice(0, 8) + '...' + encoded.slice(-4);
		}

		return (
			<div
				id='alias_menu_mobile'
				style={styles.outerContainer(clientWidth, open)}
				onTouchStart={this.handleTouchStart}
				onTouchMove={this.handleTouchMove}
				onTouchEnd={this.handleTouchEnd}
			>
				<div style={styles.innerContainer}>
					<div
						style={{ ...styles.link(this.state.hover === 'alias', true), display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 16px', marginBottom: 0 }}
					>
						<div style={{
							display: 'flex',
							alignItems: 'center',
							fontWeight: 'bold',
							fontSize: 14,
							textTransform: 'initial',
							fontFamily: 'Lexend-Deca-Regular',
							color: '#fff'
						}}>
							<Image
								src={profile ? profile.picture : undefined}
								style={{
									height: 28,
									width: 28,
									minWidth: 28,
									padding: 1,
									borderRadius: 16,
									marginRight: 8,
									marginLeft: -6,
									border: profile.picture ? 'none' : `1px solid ${COLORS.secondary}`
								}}
							/>
							{profileName || npub}
						</div>
						<div
							onClick={() => this.props.showAliasMenuMobile(false)}
							style={{ height: 20, paddingRight: 4, display: 'flex', alignItems: 'center', float: 'right' }}
						>
							<Chevron
								style={{ color: '#fff' }}
								pointing='right'
								dimension={12}
								translate={0}
							/>
						</div>
					</div>
					<div style={{ fontSize: 14, paddingTop: 12, paddingBottom: 12 }}>
						{this.renderProfileAction()}
						{this.renderPreferencesAction()}
						{this.renderSubscriptionsAction()}
						{this.renderMessagesAction()}
						{this.renderRelaysAction()}
						{this.renderAuthAction()}
					</div>
				</div>
			</div>
		);
	};
}

const mapState = ({ nostr, app }) => {

	return {
		signedIn: nostr.pubkey,
		pubkey: nostr.pubkey,
		privateKey: nostr.privateKey,
		profile: nostr.metadata && nostr.metadata[nostr.pubkey] ? nostr.metadata[nostr.pubkey] : {},
		clientWidth: app.clientWidth,
		panelWidth: app.clientWidth - 64,
		open: app.showAliasMenuMobile
	};
};

const styles = {
	outerContainer: (clientWidth, open) => {
		return {
			position: 'absolute',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			width: open ? clientWidth - 64 : 1,
			right: 0,
			opacity: open ? 1 : 0,
			top: 0,
			height: '100%',
			zIndex: 1113,
			...transition(0.2, 'ease', [ 'opacity', 'width' ])
		};
	},
	innerContainer: {
		border: '1px solid #2f363d',
		color: '#fff',
		background: COLORS.primary,
		height: '100%'
	},
	alias: {
		fontSize: 15,
		fontWeight: 'bold',
		borderBottom: '1px solid #2f363d'
	},
	link: (alias) => {
		return {
			display: 'flex',
			alignItems: 'center',
			background: alias ? 'rgba(255,255,255,0.025)' : 'transparent',
			padding: `${alias ? 12 : 12}px 12px ${alias ? 12 : 12}px 12px`,
			color: alias ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)',
			fontSize: 13,
			height: alias ? 44 : 36,
			whiteSpace: 'nowrap',
			textTransform: 'uppercase',
			fontFamily: 'JetBrains-Mono-Bold'
		};
	},
	actionIcon: {
		color: '#fff',
		float: 'left',
		marginTop: 7,
		marginLeft: 16,
		marginRight: 3,
		fontSize: 14,
		maxWidth: 15
	}
};

export default connect(mapState, { navigate, showAliasMenuMobile, revokeDeviceAuth, viewSidePanel })(AliasMenuMobile);
