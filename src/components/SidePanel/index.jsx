import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';

import Image from '../Nostr/Image';
import Subscriptions from './Subscriptions';
import Preferences from './Preferences';
import Menu from './Menu';
import MenuMobile from './MenuMobile';
import DirectMessages from '../Nostr/DirectMessages';
import Relays from './Relays';
import Media from './Media';
import Communities from './Communities';
import MediaTitleStats from './Media/TitleStats';

import { revokeDeviceAuth, showAliasMenuMobile, viewSidePanel, setMobileMenuOpen } from '../../actions';
import { COLORS, NAV_HEIGHT, CONTENT_MAX_WIDTH, MENU_WIDTH } from '../../constants';
import { transition } from '../../helpers';


class SidePanel extends PureComponent {

	state = {
		expanded: false,
		showCloseMobile: false
	};

	componentDidMount = () => {

		this.appRoot = document.getElementById('root');

		if (this.props.mobile) {
			this.props.showAliasMenuMobile(false);
		}

		setTimeout(() => {

			this.setState({ expanded: true });

			setTimeout(() => {

				this.setState({ showCloseMobile: true });

				if (this.props.mobile) {

					this.appRoot.style['overflow'] = 'hidden';
					this.appRoot.style.height = '48px';

				} else {
					document.body.style['overflow-y'] = 'hidden';
				}
			}, 200);

		}, 100);
	};

	componentDidUpdate = (prevProps) => {

		if (prevProps.id !== this.props.id) {
			this.handleClose();
		}
	};

	componentWillUnmount = () => {
		if (this.props.mobile) {
			this.appRoot.style['overflow-y'] = 'initial';
			this.appRoot.style.height = 'initial';
			document.body.style['overflow-y'] = 'auto';
		} else {
			document.body.style['overflow-y'] = 'auto';
		}
	};

	handleClose = () => {

		if (this.props.mobile) {
			this.appRoot.style['overflow-y'] = 'initial';
			this.appRoot.style.height = 'initial';
		}

		this.setState({ expanded: false, showCloseMobile: false });
		
		setTimeout(() => {

			this.props.viewSidePanel(null);

			if (this.props.graphVisible && window.graph) {
				window.graph.resumeAnimation();
			}

		}, 200);
	};

	renderModeTitleDetails = () => {

		const { topMode, mobile } = this.props;

		if (topMode === 'media') {
			return (
				<MediaTitleStats
					style={{
						marginLeft: mobile ? 12 : 24,
						marginTop: mobile ? -2 : 2,
						float: 'left'
					}}
				/>
			);
		}

		return null;
	};

	renderTitle = () => {

		const { profile, pubkey, mobile } = this.props;

		let name = profile.display_name || profile.name;

		if (!name) {

			name = window.client.pubkeyLabel(pubkey);
		}

		return (
			<div style={styles.title(mobile)}>
				<Image
					style={styles.aliasIcon}
					src={profile.picture}
				/>
				{name}
				<span style={{
					marginLeft: 12,
					marginRight: 12,
					color: COLORS.secondaryBright
				}}>
					/
				</span>
				<span style={{
					color: COLORS.secondaryBright
				}}>
					{this.props.sectionLabels[this.props.topMode]}
				</span>
				{this.renderModeTitleDetails()}
			</div>
		);
	};

	renderContent = () => {

		const { topMode } = this.props;

		if (topMode === 'subscriptions') {
			return <Subscriptions handleClose={this.handleClose} clientWidth={this.props.contentWidth} />;
		} else if (topMode === 'preferences') {
			return <Preferences />;
		} else if (topMode === 'dm') {
			return <DirectMessages handleClose={this.handleClose} />
		} else if (topMode === 'relays') {
			return <Relays handleClose={this.handleClose} />;
		} else if (topMode === 'media') {
			return <Media />;
		} else if (topMode === 'communities') {
			return <Communities />
		}

		return null;
	};

	renderMobileHeaderActions = () => {

		return (
			<div>
				
			</div>
		);
	};

	render = () => {

		const { clientWidth, minHeight, mobile, mobileMenuOpen, mobileHeaderShadow, topMode, subMode, sections, sectionLabels, pubkey } = this.props;
		const { hover, expanded, showCloseMobile } = this.state;

		if (!pubkey) { return null; }

		return mobile ? (
			<div
				style={styles.outerContainerMobile(clientWidth, expanded)}
				onClick={() => this.props.setMobileMenuOpen(false)}
			>
				<div style={styles.innerContainerMobile}>
					<div style={styles.sectionHeaderMobile(mobileHeaderShadow)}>
						<MenuMobile
							notificationsCount={this.props.notificationsCount}
							open={mobileMenuOpen}
							sections={sections}
							topMode={topMode}
							sectionLabels={sectionLabels}
							toggleOpen={this.props.setMobileMenuOpen}
							setMenuMode={this.props.viewSidePanel}
							dropdownStyle={styles.mobileMenuDropdown}
						/>
						{this.renderModeTitleDetails()}
						<div
							style={{ ...styles.topAction(hover === 'close', true), opacity: showCloseMobile ? 1 : 0, ...transition(showCloseMobile ? 0.2 : 0, 'ease', [ 'opacity' ]) }}
							onMouseOver={() => this.setState({ hover: 'close' })}
							onMouseOut={() => this.setState({ hover: '' })}
							onClick={showCloseMobile ? this.handleClose : null}
						>
							<Icon style={{ marginRight: 2 }} name='x' />
							CLOSE
						</div>
					</div>
					<div style={{ paddingTop: NAV_HEIGHT - 1, opacity: showCloseMobile ? 1 : 0, ...transition(showCloseMobile ? 0.2 : 0, 'ease', [ 'opacity' ]) }}>
						{this.renderContent()}
					</div>
				</div>
			</div>
		) : (
			<div 
				style={styles.modal(this.state.expanded, this.props.contentWidth)}
			>
				<div style={styles.sectionHeader}>
					{this.renderTitle()}
					<span
						style={styles.topAction(hover === 'close')}
						onMouseOver={() => this.setState({ hover: 'close' })}
						onMouseOut={() => this.setState({ hover: '' })}
						onClick={this.handleClose}
					>
						CLOSE<Icon style={{ marginLeft: 2 }} name='chevron right' />
					</span>
				</div>
				<Menu
					notificationsCount={this.props.notificationsCount}
					subscribersCount={this.props.subscribersCount}
					subscribedCount={this.props.subscribedCount}
					sections={sections}
					topMode={topMode}
					subMode={subMode}
					sectionLabels={sectionLabels}
					setMenuMode={this.props.viewSidePanel}
					minHeight={minHeight}
					width={MENU_WIDTH}
					handleSignOut={() => {
						this.handleClose();
						this.props.revokeDeviceAuth();
					}}
				/>
				<div id='sidepanel_scroll_container' style={styles.scrollList(this.props.overflowY, minHeight/* + 48*/)}>
					{this.renderContent()}
				</div>
			</div>
		);
	};
}

const mapState = ({ nostr, app, menu }) => {

	let profile;

	if (nostr && nostr.metadata && nostr.metadata[nostr.pubkey] && nostr.metadata[nostr.pubkey]) {
		profile = nostr.metadata[nostr.pubkey];
	}

	return {
		mobile: app.mobile,
		profile: profile || {},
		clientWidth: app.clientWidth,
		contentWidth: Math.min(app.clientWidth, CONTENT_MAX_WIDTH),
		minHeight: app.minHeight,
		pubkey: nostr.pubkey,
		...menu
	};
};

const styles = {

	mobileMenuDropdown: {
		background: 'rgb(28, 29, 30)',
		marginLeft: -16,
		paddingLeft: 16,
		paddingBottom: 8
	},

	aliasIcon: {
		float: 'left',
		height: 30,
		width: 30,
		border: '1px solid rgb(47, 54, 61)',
		borderRadius: 18,
		marginRight: 10
	},

	scrollList: (overflowY, minHeight) => {

		const props = {
			padding: 0,
			height: minHeight,
			overflowX: 'hidden'
		};

		if (overflowY !== false) {
			props.overflowY = 'scroll';
		}

		return props;
	},
	
	outerContainerMobile: (clientWidth, open) => {
		return {
			position: 'absolute',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			width: open ? clientWidth : 1,
			left: 0,
			opacity: open ? 1 : 0,
			top: 0,
			minHeight: '100%',
			zIndex: 1113,
			background: COLORS.primary,
			...transition(0.2, 'ease-out', [ 'opacity', 'width' ])
		}
	},

	topAction: (hover, mobile) => {
		return {
			float: 'right',
			color: hover ? '#fff' : 'rgba(255,255,255,0.85)',
			cursor: 'pointer',
			marginLeft: 24,
			fontSize: 12
		};
	},

	modal: (expanded, clientWidth) => {

		//const width = Math.floor(clientWidth / 2) + MENU_WIDTH;
		const width = clientWidth;

		return {
			zIndex: 9999,
			top: 0,
			color: '#fff',
			background: COLORS.primary,
			borderLeft: '1px solid rgb(47, 54, 61)',
			borderRadius: 0,
			position: 'absolute',
			height: '100%',
			width,
			right: expanded ? 0 : -1 * width,
			opacity: expanded ? 1 : 0,
			...transition(0.2, 'ease-out', [ 'right', 'opacity' ])
		};
	},

	title: (mobile) => {
		return {
			fontSize: 13,
			float: 'left',
			color: '#fff',
			display: 'flex',
			alignItems: 'center',
			fontFamily: 'Lexend-Deca-Regular',
			fontWeight: 'bold'
		};
	},

	innerContainerMobile: {
		color: '#fff'
	},

	sectionHeaderMobile: (shadow) => {
		return {
			fontFamily: 'JetBrains-Mono-Regular',
			padding: '15px 16px',
			width: '100%',
			position: 'fixed',
			background: 'rgba(28, 29, 30)',
			boxShadow: shadow ? `0px 0 16px 8px ${COLORS.primary}` : 'none',
			height: NAV_HEIGHT,
			zIndex: 99999999999999
		};
	},

	sectionHeader: {
		fontFamily: 'JetBrains-Mono-Regular',
		padding: '0px 24px',
		borderBottom: '1px solid rgb(47, 54, 61)',
		background: 'rgba(255, 255, 255, 0.024)',
		height: NAV_HEIGHT,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	}
};

export default connect(mapState, { revokeDeviceAuth, viewSidePanel, showAliasMenuMobile, setMobileMenuOpen })(SidePanel);
