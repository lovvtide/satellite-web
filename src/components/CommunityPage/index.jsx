import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import Feed from '../../modules/Feed';

import Author from '../Nostr/Author';
import Modal from '../Nostr/Modal';
import NewPost from './NewPost';
import List from './List';
import Note from './Note';
import Name from './Name';
import ModQueue from './ModQueue';
import NavActions from './NavActions';
import MD from '../common/MD';

import { COLORS, CONTENT_MAX_WIDTH } from '../../constants';
import crownsvg from '../../assets/crown.svg';
import { navigate, nostrFollow, handleApprovePost, subscribeToCommunity } from '../../actions';


class CommunityPage extends PureComponent {

	state = {
		loaded: false,
		image: '',
		modqueue: null,
		approved: null,
		metadata: {},
		showMobileSidebar: false
	};

	componentDidMount = () => {

		this.loadCommunity();
	};

	componentWillUnmount = () => {

		//window.removeEventListener('scroll', this.handleScroll);
	};

	componentDidUpdate = (prevProps) => {

		//return;

		if (
			this.props.ownernpub !== prevProps.ownernpub ||
			this.props.name !== prevProps.name
		) {

			this.setState({
				loaded: false,
				image: '',
				modqueue: null,
				approved: null,
				metadata: {},
				showMobileSidebar: false
			});

			this.loadCommunity();
		}
	};

	loadCommunity = () => {

		if (this.state.feed) {
			this.state.feed.unsubscribe(window.client);
			this.setState({ feed: null });
		}

		const parsedEventId = {};
		const didParseEvent = {};
		const feed = new Feed();

		this.setState({ feed });
		this.version = 0;

		const primaryFeedName = `${this.props.ownerpubkey}:${this.props.name}_primary`;
		const secondaryFeedName = `${this.props.ownerpubkey}:${this.props.name}_secondary`;
		const postMetadataFeedName = `${this.props.ownerpubkey}:${this.props.name}_post_metadata`;

		feed.listenForCommunity(event => {

			if (event.created_at >= this.version) {

				this.version = event.created_at;

				this.setState({
					loaded: false,
					image: '',
					name: '',
					description: '',
					rules: '',
					moderators: [],
					modqueue: null,
					approved: null,
					metadata: {},
					founder: false,
					moderator: false,
					showMobileSidebar: false
				}, () => {

					const update = {
						founder: event.pubkey === this.props.ownerpubkey,
						moderator: event.pubkey === this.props.ownerpubkey,
						moderators: [],
						event,
						image: '',
						name: '',
						description: '',
						rules: '',
						loaded: true
					};

					for (let tag of event.tags) {

						if (tag[0] === 'p') {

							if (tag[1] === this.props.ownerpubkey) {
								update.moderator = true;
							}

							update.moderators.push(tag[1]);

						} else if (tag[0] === 'd') {
							update.name = tag[1];
						} else if (tag[0] === 'image') {
							update.image = tag[1];
						} else if (tag[0] === 'description') {
							update.description = tag[1];
						} else if (tag[0] === 'rules') {
							update.rules = tag[1];
						}
					}

					this.setState(update, () => {

						const moderatorPubkeys = update.moderators;

						if (moderatorPubkeys.indexOf(this.props.ownerpubkey) === -1) {
							moderatorPubkeys.push(this.props.ownerpubkey);
						}

						feed.listenForMetadata('*', (pubkey, profile) => {

							this.setState({
								metadata: {
									...this.state.metadata,
									[pubkey]: { profile }
								}
							});

						});

						window.client.subscribe(secondaryFeedName, feed, [{
							kinds: [ 4550 ], // TODO support kind 1063
							authors: moderatorPubkeys,
							'#a': [ `34550:${this.props.ownerpubkey}:${this.props.name}` ]
						}, {
							kinds: [ 0 ],
							authors: moderatorPubkeys
						}]);

					});


				});
			}
		});

		feed.registerObserver(primaryFeedName, (items) => {

			const modqueue = [];
			const approved = [];
			//const pubkeys = {};

			for (let item of items) {

				if (item.approval) {
					approved.push(item);
				} else {
					modqueue.push(item);
				}

				// pubkeys[item.event.pubkey] = true;

				// for (let tag of item.event.tags) {

				// 	if (tag[0] === 'p') {
				// 		pubkeys[tag[1]] = true;
				// 	}
				// }
			}

			this.setState({ modqueue, approved });


		}, { mode: 'list' });

		feed.listenForEose((relay, options) => {

			if (options.subscription === secondaryFeedName) {

				const filters = [];

				for (let item of feed.list()) {

					if (didParseEvent[item.event.id] || !item.event.content) { continue; }

					Object.assign(parsedEventId, window.client.parseContentRefs(item.event.content)['e']);
					didParseEvent[item.event.id] = true;
				}

				const ids = Object.keys(parsedEventId);

				if (ids.length > 0) {

					filters.push({
						ids
					});
				}

				const authors = feed.authors();

				if (authors.length > 0) {

					filters.push({
						authors,
						kinds: [ 0 ]
					})
				}

				if (filters.length > 0) {

					feed.subscribe(`community_quoted`, relay, filters);
				}
			}

		});

		window.client.subscribe(primaryFeedName, feed, [{
			kinds: [ 34550 ],
			authors: [ this.props.ownerpubkey ],
			'#d': [ this.props.name ]
		}, {
			kinds: [ 1 ], // TODO support kind 1063
			'#a': [ `34550:${this.props.ownerpubkey}:${this.props.name}` ]
		}]);

		//this.setState({ feed });

	};

	handleFollowCommunity = () => {

		const { name, ownerpubkey, subscribed } = this.props;

		this.props.subscribeToCommunity({
			a: `34550:${ownerpubkey}:${name}`,
			subscribe: !subscribed
		});
	};

	handleMobileReply = (replyTo) => {

		const { main, active } = this.props;

		this.props.openReplyModal({
			author: { pubkey: active },
			open: true,
			replyTo,
			feed: main
		});
	};

	handleApprovePost = async (item) => {

		handleApprovePost(item, this.props, {
			onSignedEvent: (event) => {
				this.state.feed.update(event, null, {
					newpub: true
				});
			}
		});		
	};

	renderBanner = () => {

		return this.state.image ? (
			<div
				id='banner_image'
				style={{
					backgroundImage: `url(${this.state.image})`,
					height: this.props.mobile ? 196 : this.props.clientHeight - 196,
					width: '100%',
					maxHeight: 514,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					//border: `1px dotted ${COLORS.secondary}`,
					zIndex: 1,
					width: '100%',
					marginTop: 1
				}}
			/>
		) : null;

		return this.state.image ? (
			<img
				id='banner_image'
				src={this.state.image}
				style={{
					zIndex: 1,
					width: '100%',
					marginTop: 1,
					marginBottom: -3
				}}
			/>
		) : null;
	};

	renderHeader = () => {

		//const profile = this.state.metadata[this.props.ownerpubkey] || {};

		const profile = this.state.metadata[this.props.ownerpubkey] ? (this.state.metadata[this.props.ownerpubkey].profile) || {} : {}
		const { mobile, subscribed } = this.props;

		return (
			<div
				id='community_header'
				style={{
					whiteSpace: 'nowrap',
					zIndex: 1,
					willChange: 'top',
					width: '100%',
					height: 48,
					paddingLeft: this.props.mobile ? 12 : 24,
					paddingRight: this.props.mobile ? 12 : 24,
					display: 'flex',
					alignItems: 'center',
					borderBottom: `1px dotted ${COLORS.secondary}`,
					borderTop: this.state.image ? `1px solid ${COLORS.secondary}` : 'none',
					background: COLORS.primary,
					justifyContent: mobile ? 'space-between' : 'left'
				}}
			>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					transform: 'translate(0px, -1px)',
					maxWidth: '90%',
					overflow: 'hidden'
				}}>
					<Link to={`/n/${this.props.name}/${this.props.ownernpub}`}>
						<div
							onClick={() => this.setState({ showMobileSidebar: false })}
							onMouseOver={() => this.setState({ hover: 'name' })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								fontSize: 16,
								color: '#fff',
								marginRight: 16,
								display: 'flex',
								alignItems: 'center',
								fontWeight: 'bold'
							}}
						>
							<div>
								n/{this.props.name}
							</div>
						</div>
					</Link>					
					<div style={{
						fontSize: 13,
						height: 18,
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
						<Link to={`/@${this.props.ownernpub}`}>
							<Name
								npub={this.props.ownernpub}
								profile={this.state.metadata[this.props.ownerpubkey] ? (this.state.metadata[this.props.ownerpubkey].profile) || {} : {}}
								style={{
									color: COLORS.satelliteGold
								}}
							/>
						</Link>
					</div>
				</div>
				<div style={{
					display: 'flex',
					alignItems: 'center'
				}}>
					<div
						onMouseOver={() => this.setState({ hover: 'follow_community' })}
						onMouseOut={() => this.setState({ hover: '' })}
						onClick={this.handleFollowCommunity}
						style={{
							fontFamily: 'JetBrains-Mono-Bold',
							color: subscribed ? '#fff' : COLORS.secondaryBright,
							fontSize: mobile ? 18 : 11,
							borderRadius: 4,
							marginTop: mobile ? 0 : 2,
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: 26,
							userSelect: 'none',
							paddingLeft: mobile ? 0 : 6,
							paddingRight: mobile ? 0 : 6,
							marginRight: mobile ? 10 : 0,
							marginLeft: 10,
							opacity: mobile || this.state.hover === 'follow_community' ? 1 : 0.85
						}}
					>
						{subscribed || mobile ? (<Icon name='circle check' style={{ height: 20, marginRight: mobile ? 0 : 5 }} />) : null}
						{mobile ? null : (subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE')}
					</div>
					{this.props.mobile ? (
						<Icon
							onClick={() => this.setState({ showMobileSidebar: !this.state.showMobileSidebar })}
							name={this.state.showMobileSidebar ? 'chevron left' : 'info circle'}
							style={{
								cursor: 'pointer',
								marginRight: this.state.showMobileSidebar ? -2 : 0,
								fontSize: 18,
								width: this.state.showMobileSidebar ? 22 : 20,
								height: 20
							}}
						/>
					) : null}
				</div>
			</div>
		);
	};

	renderItem = () => {

		if (!this.props.match.params.note) { return null; }

		return (
			<div>
				SELECTED ITEM
			</div>
		);
	};

	renderDescription = () => {

		const { description } = this.state;

		return (
			<div style={{ ...styles.sidebarSection(this.state),  paddingTop: 6 }}>
				<div style={styles.sidebarTitle}>
					Community Description
				</div>
				{description ? (
					<MD
						markdown={description}
						paragraphStyle={{
							'font-size': '13px',
							'line-height': '20px'
						}}
						comment
					/>
				) : (
					<span style={{ fontStyle: 'italic', fontSize: 13, color: COLORS.secondaryBright }}>
						The founder has not provided a description for this community
					</span>
				)}
			</div>
		);
	};

	renderRules = () => {

		const { rules } = this.state;

		return (
			<div style={styles.sidebarSection(this.state)}>
				<div style={styles.sidebarTitle}>
					Rules For Posting
				</div>
				{rules ? (
					<MD
						markdown={rules}
						paragraphStyle={{
							'font-size': '13px',
							'line-height': '20px'
						}}
						comment
					/>
				) : (
					<span style={{ fontStyle: 'italic', fontSize: 13, color: COLORS.secondaryBright }}>
						The founder has not provided rules for posting in this community
					</span>
				)}
			</div>
		);
	};

	renderModerators = () => {

		return (
			<div style={styles.sidebarSection(this.state)}>
				<div style={{ ...styles.sidebarTitle, marginBottom: 8 }}>
					Moderators
				</div>
				{(this.state.moderators || []).map(pubkey => {

					//const profile = this.state.metadata[pubkey] || {};

					const profile = this.state.metadata[pubkey] ? (this.state.metadata[pubkey].profile) || {} : {}

					return (
						<div
							key={pubkey}
							style={{
								marginBottom: 4
							}}
						>
							<Author
								infoHover
								mobile={this.props.mobile}
								active={this.props.pubkey}
								infoTriggerId={'moderator_' + pubkey}
								pubkey={pubkey}
								name={profile.name}
								displayName={profile.display_name || profile.displayName}
								about={profile.about}
								nip05={profile.nip05}
								picture={profile.picture}
								navigate={this.props.navigate}
								following={this.props.contacts[pubkey]}
								handleFollow={this.props.nostrFollow}
							/>
						</div>
					);
				})}
			</div>
		);
	};

	renderSidebar = () => {

		const { showMobileSidebar } = this.state;

		if (this.props.mobile && !showMobileSidebar) { return null; }

		return (
			<div
				style={this.props.mobile ? {
					width: '100%',
					marginTop: 19,
					position: 'absolute',
					left: 0,
					marginTop: 6
				} : {
					width: '25%',
					marginTop: 19
				}}
			>
				{/*{this.renderFollowButton()}*/}
				{this.renderDescription()}
				{this.renderRules()}
				{this.renderModerators()}
			</div>
		);
	};

	renderStateMessage = () => {

		let title, message, icon, color;

		const { hash } = this.props.location;

		if (hash === '#post_success') {
			icon = 'circle check';
			color = COLORS.green;
			title = 'Post Submitted';
			message = 'Your post was submitted successfully and will appear in the feed when approved by moderators';
		}

		const handleClose = () => {
			this.props.navigate(`/n/${this.props.name}/${this.props.ownernpub}`);
		};

		return message ? (
			<Modal
				handleClose={handleClose}
				clientHeight={this.props.clientHeight}
				clientWidth={this.props.clientWidth}
				closeOnDimmerClick
				contentStyle={{
					maxWidth: this.props.mobile ? null : 333,
					width: this.props.mobile ? '90%' : null,
					paddingBottom: 0,
					transform: 'translate(-50%,-50%)',
					top: '50%'
				}}
			>
				<div
					onClick={handleClose}
					style={{
						padding: '18px 24px',
						background: COLORS.primary,
						border: `1px solid ${COLORS.secondary}`
					}}
				>
					<div style={{
						color: '#fff',
						fontWeight: 'bold',
						marginBottom: 8
					}}>
						<Icon name={icon} style={{ color, marginRight: 5 }} />
						<span>{title}</span>
					</div>
					<div style={{
						color: 'rgba(255,255,255,0.85)',
						fontSize: 13
					}}>
						{message}
					</div>
				</div>
			</Modal>
		) : null
	};

	render = () => {

		return (
			<div
				style={{
					pointerEvents: this.state.loaded ? 'auto' : 'none',
					opacity: this.state.loaded ? 1 : 0,
					maxWidth: CONTENT_MAX_WIDTH,
					margin: 'auto'
				}}
			>
				{this.renderStateMessage()}
				{this.renderBanner()}
				{this.renderHeader()}
				<div
					style={{
						display: 'flex',
						paddingLeft: this.props.mobile ? 12 : 24,
						paddingRight: this.props.mobile ? 12 : 24
					}}
				>
					<div
						style={{
							width: this.props.mobile ? '100%' : '75%',
							paddingRight: this.props.mobile ? 0 : 24,
							...(this.props.mobile && this.state.showMobileSidebar ? {
								pointerEvents: 'none',
								opacity: 0,
								height: 1,
								overflow: 'hidden'
							} : {})
						}}
					>
						<Switch>
							<Route path='/n/:name/:founder/submit'>
								<NewPost
									feed={this.state.feed}
									name={this.props.name}
									ownernpub={this.props.ownernpub}
									ownerpubkey={this.props.ownerpubkey}
								/>
							</Route>
							<Route path='/n/:name/:founder/modqueue'>
								<NavActions
									mobile={this.props.mobile}
									name={this.props.name}
									ownernpub={this.props.ownernpub}
									modqueueN={this.state.modqueue === null ? 0 : this.state.modqueue.length}
									selected={this.props.match.params.note}
								/>
								<ModQueue
									feed={this.state.feed}
									mobile={this.props.mobile}
									items={this.state.modqueue}
									name={this.props.name}
									ownernpub={this.props.ownernpub}
									moderator={this.state.loaded && (this.state.moderators.indexOf(this.props.pubkey) !== -1 || this.props.ownerpubkey === this.props.pubkey)}
									metadata={this.state.metadata}
									handleApprovePost={this.handleApprovePost}
									handleFollow={this.props.nostrFollow}
									navigate={this.props.navigate}
								/>
							</Route>
							<Route path='/n/:name/:founder/:note'>
								<Note
									id={this.props.match.params.note}
									contacts={this.props.contacts}
									name={this.props.name}
									ownernpub={this.props.ownernpub}
									feed={this.state.feed}
									//items={this.state.feed ? this.state.feed.items : {}}
									loaded={this.state.loaded}
									moderator={this.state.loaded && (this.state.moderators.indexOf(this.props.pubkey) !== -1 || this.props.ownerpubkey === this.props.pubkey)}
									handleApprovePost={this.handleApprovePost}
								/>
							</Route>
							<Route path='/n/:name/:founder'>
								<NavActions
									mobile={this.props.mobile}
									name={this.props.name}
									ownernpub={this.props.ownernpub}
									modqueueN={this.state.modqueue === null ? 0 : this.state.modqueue.length}
									selected={this.props.match.params.note}
								/>
								<List
									sort='new'
									feed={this.state.feed}
									mobile={this.props.mobile}
									items={this.state.approved}
									name={this.props.name}
									ownernpub={this.props.ownernpub}
									metadata={this.state.metadata}
									handleFollow={this.props.nostrFollow}
									navigate={this.props.navigate}
								/>
							</Route>
						</Switch>
					</div>
					{this.renderSidebar()}
				</div>
			</div>
		);
	};

}

const mapState = ({ app, nostr, communities }, { match }) => {

	let ownerpubkey;
	let error;

	try {

		const decoded = nip19.decode(match.params.founder);
		ownerpubkey = decoded.data;

	} catch (err) {
		error = true;
	}

	return {
		subscribed: communities.followingList[`34550:${ownerpubkey}:${match.params.name}`],
		clientWidth: app.clientWidth,
		clientHeight: app.clientHeight,
		mobile: app.mobile,
		name: match.params.name,
		ownerpubkey,
		ownernpub: match.params.founder,
		pubkey: nostr.pubkey,
		contacts: (nostr.contacts || {})[nostr.pubkey] || {},
		error
	};
};

const styles = {

	sidebarSection: ({ showMobileSidebar }) => {
		return {
			paddingBottom: 24,
			borderLeft: showMobileSidebar ? 'none' : '6px solid rgb(29, 30, 31)',
			paddingLeft: showMobileSidebar ? 12 : 24,
			paddingRight: showMobileSidebar ? 12 : 0
		};
	},

	sidebarTitle: {
		color: COLORS.satelliteGold,
		fontFamily: 'JetBrains-Mono-Bold',
		fontSize: 12,
		marginBottom: 4,
		textTransform: 'uppercase'
	}

};

export default connect(mapState, { navigate, nostrFollow, subscribeToCommunity })(CommunityPage);
