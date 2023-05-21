import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon, Popup } from 'semantic-ui-react';
import { nip05, nip19 } from 'nostr-tools';

import NewPostEditor from './NewPostEditor';
import MD from '../common/MD';
import Image from './Image';
import Feed from './Feed';
import FollowButton from './FollowButton';
import NIP05 from './NIP05';
import MobilePostButton from './MobilePostButton';

import { COLORS, CONTENT_MAX_WIDTH } from '../../constants';
import { handleZapRequest, handleNostrPublish, openReplyModal, viewSidePanel, navigate, nostrFollow, getLocalPublicKey, setActiveDirectMessageChat, queryProfiles, setProfilePubkey } from '../../actions';
import { transition } from '../../helpers';

import svglightningactive from '../../assets/lightning_active.svg';


/* Render a user's profile */
class ProfileFeed extends PureComponent {

	state = {
		hover: '',
		feed: null,
		profile: null,
		composeNewPost: false,
		composeNewPostReady: false,
		loadMorePending: true,
		loadedMetadata: false,
		metadata: {}
	};

	constructor (props) {
		super(props);
		this.divider = React.createRef();
		this.headerName = React.createRef();
	}

	componentDidMount = async () => {
		window.addEventListener('scroll', this.handleScroll);
		this.setState({ initialClientHeight: this.props.clientHeight });
		this.handleLoad();
	};

	componentWillUnmount = () => {

		this.props.setProfilePubkey(null);

		window.removeEventListener('scroll', this.handleScroll);

		clearTimeout(this._resetLoadMore);
		clearTimeout(this._reload);
	}

	componentDidUpdate = (prevProps, prevState) => {

		if (!prevState.profile && this.state.profile && this.divider.current) {

			setTimeout(() => {

				if (this.divider.current) {

					this.setState({
						navBound: this.divider.current.getBoundingClientRect().top
					});

				}

			}, 500);
		}

		if (this.props.match.params.alias !== prevProps.match.params.alias) {

			this.setState({
				hover: '',
				feed: null,
				profile: null,
				composeNewPost: false,
				composeNewPostReady: false,
				loadedMetadata: false,
				metadata: {}
			});

			this._reload = setTimeout(() => {
				this.handleLoad();
			}, 200);
		}
	};

	isFollowing = () => {

		if (!this.props.active || !this.state.profile) { return false; }

		return (this.props.contacts[this.props.active] || {})[this.state.profile.pubkey];
	};

	handleLoad = async () => {

		window.scrollTo(0, 0);

		const profile = await window.client.identify(this.props.match.params.alias, {
			defaultDomain: 'satellite.earth'
		});

		if (profile && profile.pubkey) {

			const feed = await window.client.createProfileFeed({
				...profile,
				batch: 50,
				active: getLocalPublicKey()
			}, () => {
				this._resetLoadMore = setTimeout(() => {
					this.setState({ loadMorePending: false });
				}, 1000);
			}, this.props.contacts);

			feed.listenForMetadata(profile.pubkey, this.handleMetadata);

			this.setState({ feed, profile, showStickyHeader: false });

			this.props.setProfilePubkey(profile.pubkey);
		}
	};

	handleScroll = (e) => {

		if (!e.target.scrollingElement) { return; }

		const { scrollTop } = e.target.scrollingElement
		const showStickyHeader = scrollTop > this.state.navBound;

		if (showStickyHeader !== this.state.showStickyHeader) {

			this.setState({ showStickyHeader });
		}
	};

	handlePost = (post, replyTo, attached) => {

		if (!this.state.feed) { return; }

		return handleNostrPublish(post, replyTo, [ this.state.feed ], attached);
	};

	handleLoadMore = () => {

		clearTimeout(this._resetLoadMore);

		this.setState({ loadMorePending: true });

		setTimeout(() => {
			this.setState({ loadMorePending: false });
		}, 2000);

		window.client.expandProfileFeed(this.state.feed, {
			pubkey: this.state.profile.pubkey,
			batch: 50
		});
	};

	handleMetadata = async (metadata) => {

		this.setState({
			loadedMetadata: true,
			metadata
		});

		//console.log('LOADED metadata', metadata);

		if (this.state.profile.pubkey && metadata.nip05) {

			let info;

			try {

				info = await nip05.queryProfile(metadata.nip05);

			} catch (err) {
				console.warn('Failed to verify NIP-05');
			}

			if (info && this.state.profile.pubkey === info.pubkey) {

				this.setState({ nip05Verifed: true });

				//this.props.navigate(`/@${metadata.nip05}`, { replace: true });
				window.history.replaceState(null, '', `/@${metadata.nip05}`);

			} else {

				this.setState({ nip05Failed: true });
			}
		}
	};

	handleNewPostClicked = () => {

		if (this.props.mobile) {

			this.handleMobileReply();

		} else {

			this.setState({ composeNewPost: true });

			this._openingEditor = setTimeout(() => {

				this.setState({ composeNewPostReady: true });

				const composeNewEditor = document.getElementById('compose_new_editor');

				if (composeNewEditor) {
					composeNewEditor.select();
				}
			}, 200);
		}
	};

	handleMobileReply = (replyTo) => {

		const { active } = this.props;
		const { feed } = this.state;

		this.props.openReplyModal({
			author: { pubkey: active },
			open: true,
			replyTo,
			feed
		});
	};

	handleQueryProfiles = (params) => {

		this.props.queryProfiles(params ? {
			...params,
			feeds: [ this.state.feed ]
		} : null);

	};

	handleEditProfileClicked = () => {

		this.props.viewSidePanel('preferences');
	};

	handleMessageClicked = () => {

		if (!this.state.profile || !this.props.active) { return; }

		if (!this.props.mobile) {

			window.scrollTo({
				top: 0
			});
		}

		this.props.viewSidePanel('dm');

		setTimeout(() => {

			this.props.setActiveDirectMessageChat({
				topic: this.state.profile.pubkey,
				messages: []
			});

		}, 200);

	};

	handleZapRequest = () => {

		if (this.state.pendingZapRequest || !this.props.active) { return; }

		this.setState({ pendingZapRequest: true });

		this.props.handleZapRequest({
			...(this.state.metadata || {}),
			pubkey: this.state.profile.pubkey
		}, null, {
			onResolve: () => {
				this.setState({ pendingZapRequest: false });
			}
		});

	};

	renderFeedNav = () => {

		const { hover, composeNewPost, profile, navBound } = this.state;
		const { active, mobile } = this.props;

		if (!profile || !navBound) { return null; }

		return (
			<div
				style={{
					display: 'flex',
					height: 48,
					alignItems: 'center',
					justifyContent: 'right',
					fontSize: 12
				}}
			>
				{active === profile.pubkey && !mobile ? (
					<div
						style={{
							opacity: composeNewPost ? 0.25 : (hover === 'new post' ? 1 : 0.85),
							userSelect: 'none',
							float: 'right',
							padding: '3px 7px',
							lineHeight: '20px',
							textAlign: 'center',
							display: 'inline-block',
							color: composeNewPost ? '#fff' : COLORS.satelliteGold,
							fontFamily: `JetBrains-Mono-Bold`,
							cursor: composeNewPost ? 'default' : 'pointer'
						}}
						onMouseOver={() => this.setState({ hover: 'new post' })}
						onMouseOut={() => this.setState({ hover: '' })}
						onClick={composeNewPost ? undefined : this.handleNewPostClicked}
					>
						<Icon style={{ color: composeNewPost ? '#fff' : COLORS.satelliteGold, marginRight: 4 }} name='plus' />
						<span>NEW POST</span>
					</div>
				) : null}
			</div>
		);
	};

	renderNewPostEditor = () => {

		const { composeNewPost, composeNewPostReady } = this.state;
		const { active } = this.props;

		const closeEditor = () => {

			this.setState({
				composeNewPost: false,
				composeNewPostReady: false
			});
		};

		return (
			<div
				style={{
					marginBottom: /*16*/48,
					marginTop: -14,
					height: composeNewPost ? (composeNewPostReady ? null : 285) : 0,
					minHeight: composeNewPostReady ? 285 : 0,
					...transition(0.2, 'ease', composeNewPost ? ['height','margin'] : ['height'])
				}}
			>
				{composeNewPost ? (
					<NewPostEditor
						onCancel={closeEditor}
						onResolve={closeEditor}
						handlePost={this.handlePost}
						handleQueryProfiles={this.props.queryProfiles}
						searchActive={this.props.searchActive}
						highlight
						style={{
							marginTop: 16,
							opacity: composeNewPostReady ? 1 : 0,
							...transition(0.2, 'ease', [ 'opacity' ])
						}}
						author={{
							pubkey: active,
							...(this.props.metadata[active] || {})
						}}
					/>
				) : null}
			</div>
		);
	};

	/*
	renderEditLink = () => {

		return null;

		const { active, mobile } = this.props;
		const { profile, hover } = this.state;
		
		if (!profile || profile.pubkey !== active) { return null; }

		return (
			<span
				onMouseOver={() => this.setState({ hover: 'edit profile' })}
				onMouseOut={() => this.setState({ hover: '' })}
				onClick={this.handleEditProfileClicked}
				style={{
					color: COLORS.blue,
					zIndex: 1,
					cursor: 'pointer',
					position: 'absolute',
					right: mobile ? 20 : 28,
					fontSize: 12,
					fontFamily: 'JetBrains-Mono-Regular',
					top: 62,
					background: hover === 'edit profile' ? `rgba(255,255,255,0.05)` : COLORS.primary,
					borderRadius: 5,
					padding: '4px 8px 4px 8px',
					marginTop: -4,
					marginRight: -10
				}}
			>
				<Icon
					style={{ marginRight: 6 }}
					name='user outline'
				/>
				{mobile ? 'EDIT PROFILE' : 'EDIT PROFILE'}
			</span>
		);
	};
	*/

	renderFollowButton = () => {

		const following = this.isFollowing();

		const element = (
			<div
				onMouseOver={() => this.setState({ hover: 'follow' })}
				onMouseOut={() => this.setState({ hover: '' })}
				onClick={() => this.props.nostrFollow(this.state.profile.pubkey, !following)}
				style={{
					marginLeft: 6,
					marginRight: 6,
					display: 'flex',
					flexDirection: 'horizontal',
					alignItems: 'center',
					fontFamily: 'JetBrains-Mono-Bold',
					marginTop: 2,
					userSelect: 'none',
					cursor: 'pointer',
					borderRadius: 3,
					color: following ? COLORS.satelliteGold : '#fff',
					border: following ? `0.5px solid ${COLORS.satelliteGold}` : `0.5px solid rgba(255,255,255,${this.state.hover === 'follow' ? 1 : 0.85})`,
					padding: '5px 12px',
					fontSize: 12
				}}
			>
				<span>{following ? 'FOLLOWING' : 'FOLLOW'}</span>
			</div>
		);

		return this.props.active ? element : (
			<Popup
				trigger={element}
				content='Sign in to follow'
				position='top center'
				style={{ fontSize: 12, zIndex: 99999, filter: 'invert(85%)', boxShadow: 'none', color: '#000' }}
			/>
		);

	};

	renderMessageButton = () => {

		const element = (
			<div
				onMouseOver={() => this.setState({ hover: 'message' })}
				onMouseOut={() => this.setState({ hover: '' })}
				onClick={this.handleMessageClicked/*() => this.props.viewSidePanel('dm')*/}
				style={{
					marginLeft: 6,
					marginRight: 6,
					display: 'flex',
					flexDirection: 'horizontal',
					alignItems: 'center',
					fontFamily: 'JetBrains-Mono-Bold',
					marginTop: 2,
					userSelect: 'none',
					cursor: 'pointer',
					borderRadius: 3,
					color: '#fff',
					border: `0.5px solid rgba(255,255,255,${this.state.hover === 'message' ? 1 : 0.85})`,
					padding: '5px 12px',
					fontSize: 12
				}}
			>
				<span>MESSAGE</span>
			</div>
		);

		return this.props.active ? element : (
			<Popup
				trigger={element}
				content='Sign in to send a DM'
				position='top center'
				style={{ fontSize: 12, zIndex: 99999, filter: 'invert(85%)', boxShadow: 'none', color: '#000' }}
			/>
		);
	};

	renderZapButton = () => {

		const { lud06, lud16 } = (this.state.metadata || {});

		//console.log('this.state.metadata', this.state.metadata);

		if (!(lud16 || lud06)) { return null; }

		const element = (
			<div
				onMouseOver={() => this.setState({ hover: 'zap' })}
				onMouseOut={() => this.setState({ hover: '' })}
				onClick={this.handleZapRequest}
				style={{
					marginLeft: 6,
					marginRight: 6,
					display: 'flex',
					flexDirection: 'horizontal',
					alignItems: 'center',
					fontFamily: 'JetBrains-Mono-Bold',
					marginTop: 2,
					userSelect: 'none',
					borderRadius: 3,
					color: '#fff',
					border: `0.5px solid rgba(255,255,255,${this.state.hover === 'zap' ? 1 : 0.85})`,
					padding: '5px 12px',
					fontSize: 12,
					cursor: this.state.pendingZapRequest ? 'default' : 'pointer'
				}}
			>
				<span>SATS</span>
				<img
					style={{ cursor: 'pointer', marginLeft: 4 }}
					src={svglightningactive}
					height={13}
					width={13}
				/>
			</div>
		);

		return this.props.active ? element : (
			<Popup
				trigger={element}
				content='Sign in to send a zap'
				position='top center'
				style={{ fontSize: 12, zIndex: 99999, filter: 'invert(85%)', boxShadow: 'none', color: '#000' }}
			/>
		);
	}

	renderProfileHeader = () => {

		const { profile, metadata, hover } = this.state;
		const { picture, name, about, nip05, banner } = metadata;

		if (!profile) { return null; }

		const npub = nip19.npubEncode(profile.pubkey);
		const display_name = this.state.metadata.display_name || name;

		if (!this.state.initialClientHeight) { return null; }
		
		return (
			<div style={{
				paddingBottom: 48,
				display: 'flex',
				justifyContent: 'center'
			}}>
				{banner ? (<div
					style={{
						backgroundImage: `linear-gradient(to bottom, transparent, ${COLORS.primary}), url(${banner})`,
						height: '100%',
						top: 50,
						width: '100%',
						position: 'absolute',
						backgroundSize: 'cover',
						zIndex: -1,
						maxHeight: this.props.mobile ? ((215 / 2) + 100) : (Math.min(this.state.initialClientHeight || this.props.clientHeight, this.state.navBound || 0) ) - 98,
						backgroundPosition: 'center'
					}}
				/>) : null}
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center'
				}}>
					<Image
						src={picture}
						style={{
							padding: 2,
							height: this.props.mobile ? 215 : 300,
							width: this.props.mobile ? 215 : 300,
							borderRadius: 150,
							marginBottom: 38,
							border: `1px solid ${picture ? '#fff' : COLORS.secondary}`
						}}
					/>
					{display_name ? (
						<div style={{
							fontSize: 18,
							fontWeight: 'bold',
							color: COLORS.satelliteGold,
							marginBottom: this.props.mobile ? 6 : 2,
							background: COLORS.primary,
							padding: this.props.mobile ? 0 : '6px 10px'
						}}>
							{display_name}
						</div>
					) : null}
					{nip05 ? (
						<div style={{
							marginBottom: this.props.mobile ? 6 : 2,
							background: COLORS.primary,
							padding: this.props.mobile ? 0 : '6px 10px'
						}}>
							<NIP05 value={nip05} />
						</div>
					) : null}
					<div
						onMouseOver={() => this.setState({ hover: 'npub' })}
						onMouseOut={() => this.setState({ hover: '' })}
						style={{
							fontSize: 13,
							color: COLORS.secondaryBright,
							fontFamily: 'JetBrains-Mono-Regular',
							background: COLORS.primary,
							padding: this.props.mobile ? 0 : '6px 10px'
						}}
					>
						{hover === 'npub' ? npub : npub.slice(0, 8) + '...' + npub.slice(-4)}
					</div>
					{about ? (
						<div style={{
							color: 'rgba(255,255,255,0.85)',
							marginTop: this.props.mobile ? 28 : 36,
							fontSize: 14,
							lineHeight: '21px',
							textAlign: 'center',
							width: Math.min(400, this.props.clientWidth - 48)
						}}>
							<MD
								markdown={about}
								comment
							/>
						</div>
					) : null}
					<div style={{
						display: 'flex',
						marginTop: 36
					}}>
						{this.state.profile && this.state.profile.pubkey !== this.props.active ? this.renderFollowButton() : null}
						{this.state.profile && this.state.profile.pubkey !== this.props.active ? this.renderMessageButton() : null}
						{this.state.profile && this.state.profile.pubkey !== this.props.active ? this.renderZapButton() : null}
					</div>
				</div>
			</div>
		);
	};

	renderStickyHeader = () => {

		const metadata = this.state.metadata || {};
		let name = metadata.display_name || metadata.name;

		if (!name) {

			const encoded = nip19.npubEncode(this.state.profile.pubkey);
			name = encoded.slice(0, 8) + '...' + encoded.slice(-4);
		}

		return (
			<div style={{
				zIndex: this.state.showStickyHeader ? 1 : -1,
				opacity: this.state.showStickyHeader ? 1 : 0,
				color: '#fff',
				background: COLORS.primary,
				position: 'fixed',
				width: '100%',
				top: 0,
				height: 48,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingLeft: this.props.mobile ? 12 : 22,
				paddingRight: this.props.mobile ? 12 : 22,
				boxShadow: `0 0 16px 12px ${COLORS.primary}`,
				...transition(0.2, 'ease', [ 'opacity' ])
			}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						maxWidth: this.props.clientWidth - (this.props.mobile ? 124 : 148)/*(this.props.mobile ? 100 : 240)*/
					}}
				>
					<Image
						src={metadata.picture}
						style={{
							height: 30,
							width: 30,
							marginRight: 12,
							border: `1px dotted ${COLORS.secondary}`,
							borderRadius: 30,
						}}
					/>
					<div ref={this.headerName} style={{
						fontWeight: 'bold',
						fontSize: 13,
						color: COLORS.satelliteGold,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}>
						{name}
					</div>
					{this.headerName.current && metadata.nip05 ? (<span style={{ color: COLORS.secondaryBright, marginLeft: 12, marginRight: 12, transform: 'translate(0px, -1px)', fontSize: 17 }}>/</span>) : null}
					{this.headerName.current && metadata.nip05 ? (<div style={{
						maxWidth: (this.props.clientWidth - (this.props.mobile ? 124 : 148)) - (this.headerName.current.clientWidth + 88),
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						fontSize: 13
					}}>
						<NIP05 value={metadata.nip05} />
					</div>) : null}
				</div>
				{this.state.profile && this.state.profile.pubkey !== this.props.active ? (<FollowButton
					active={this.props.active}
					style={{ padding: '3px 8px' }}
					following={this.isFollowing()}
					onClick={(follow) => this.props.nostrFollow(this.state.profile.pubkey, follow)}
				/>) : null}
			</div>
		);
	};

	render = () => {

		if (!this.state.feed) { return null; }

		return (
			<div>
				{this.renderStickyHeader()}
				{/*{this.renderEditLink()}*/}
				<div style={styles.content(this.props)}>
					{this.renderProfileHeader()}
					{this.state.profile ? <div ref={this.divider} style={styles.divider(this.props, this.state)} /> : null}
					{this.renderFeedNav()}
					{this.renderNewPostEditor()}
					{this.state.feed && this.state.profile ? (
						<Feed
							style={{ marginTop: -16 }}
							lazyRender
							feed={this.state.feed}
							name={`profile_primary_${this.state.profile.pubkey}`}
							buildOptions={{ mode: 'profile', pubkey: this.state.profile.pubkey }}
							mobile={this.props.mobile}
							active={this.props.active}
							searchActive={this.props.searchActive}
							profile={this.state.profile.pubkey}
							highlight={this.state.profile.pubkey}
							loadMorePending={this.state.loadMorePending}
							handlePost={this.handlePost}
							handleLoadMore={this.handleLoadMore}
							handleMobileReply={this.handleMobileReply}
							handleQueryProfiles={this.handleQueryProfiles}
							handleFollow={this.props.nostrFollow}
							handleZapRequest={this.props.handleZapRequest}
							navigate={this.props.navigate}
							metadata={this.props.metadata}
							contacts={(this.props.contacts[this.props.active] || {})}
						/>
					) : null}
				</div>
				{/*this.props.mobile && !this.props.showAliasMenuMobile && */!this.props.topMode && this.state.profile/* && this.state.profile.pubkey === this.props.active*/ ? (
					<MobilePostButton
						feed={this.state.feed}
					/>
				) : null}
			</div>
		);
	}
}

const mapState = ({ app, nostr, query }) => {

	return {
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		mobile: app.mobile,
		active: nostr.pubkey || '',
		contacts: nostr.contacts || {},
		metadata: nostr.metadata || {},
		searchActive: query.active
	};
};

const styles = {

	divider: ({ mobile }, { navBound }) => {
		return {
			opacity: navBound ? 1 : 0,
			marginLeft: -12,
			marginRight: -12,
			borderTop: `1px solid ${COLORS.secondary}`
		}
	},

	navItem: ({ hover, active }) => {

		return {
			color: '#fff',
			height: 42,
			marginRight: 24,
			opacity: hover || active ? 1 : 0.85,
			borderBottom: `2px solid ${active ? '#fff' : 'transparent'}`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			cursor: 'pointer'
		};
	},

	content: ({ mobile, clientWidth, clientHeight }) => {

		const props = {
			//paddingTop: (clientHeight / 2) - 148,
			paddingTop: mobile ? 60 : 72,
			marginLeft: mobile ? 0 : 'auto',
			marginRight: mobile ? 1 : 'auto',
			color: '#fff',
			paddingBottom: 108,
			paddingLeft: mobile ? 12 : 0,
			paddingRight: mobile ? 12 : 0,
			width: mobile ? '100%' : Math.min(clientWidth, CONTENT_MAX_WIDTH) * 0.5,
		};

		//if (!mobile) { props.minWidth = 550; }

		return props;
	}
};

export default connect(mapState, { handleZapRequest, openReplyModal, viewSidePanel, navigate, nostrFollow, setActiveDirectMessageChat, queryProfiles, setProfilePubkey })(ProfileFeed);
