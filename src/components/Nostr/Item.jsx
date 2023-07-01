import React, { Component } from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';

import { InfoBox, CanonicalValue, Chevron } from '../CommonUI';
import RelativeTime from '../common/RelativeTime';
import ToolTip from '../common/ToolTip';
import MD from '../common/MD';
import Editor from './Editor';
import Author from './Author';

import svgcomment from '../../assets/comment.svg';
import svgrepost from '../../assets/repost.svg';
import svgupactive from '../../assets/up_active.svg';
import svgupinactive from '../../assets/up_inactive.svg';
import svgrepostwhite from '../../assets/repost-white.svg';
import svglightning from '../../assets/lightning.svg';
import svgdelete from '../../assets/delete.svg';

import { COLORS } from '../../constants';


/* Renders an item and its replies */

class Item extends Component {

	state = {
		compose: false,
		infoTrigger: null,
		hover: '',
		mediaPreview: null,
		hoverMention: null
	};

	constructor (props) {

		super(props);

		if (this.props.thread) {
			this.body = React.createRef();
			this.item = React.createRef();
		}

		this.media = [];
		this.ident = {};
	}

	componentDidMount = () => {

		if (this.props.replaceTitle && this.props.event.tags) {
			this.replaceTitle();
		}
	};

	componentDidUpdate = (prevProps) => {

		if (this.props.replaceTitle) {

			if (this.props.event.tags && !prevProps.event.tags) {
				this.replaceTitle();
			}
		}
	}

	componentWillUnmount = () => {

		clearTimeout(this._update);
		clearTimeout(this._hoverMedia);

		for (let item of this.media) {

			item.removeEventListener('click', this.handleMediaPreviewClick);

			if (!this.props.mobile) {
				item.removeEventListener('mouseover', this.handleMediaMouseOver);
				item.removeEventListener('mouseleave', this.handleMediaMouseOut);
			}
		}
	};

	replaceTitle = () => {

		let content = this.props.event.content;
		let title, link;

		for (let tag of this.props.event.tags) {

			if (tag[0] === 'subject') {

				title = tag[1];

				if (this.props.event.content === title) {
					content = '';
				} else if (this.props.event.content.indexOf(`${tag[1]}\n\n`) === 0) {
					content = this.props.event.content.slice(title.length + 2);
				}
			}
		}

		for (let tag of this.props.event.tags) {

			if (tag[0] === 'r') {

				link = tag[1];

				if (this.props.event.content === link) {
					content = '';
				} else if (content.indexOf(`${tag[1]}\n\n`) === 0) {
					content = content.slice(link.length + 2);
				}
			}
		}

		this.setState({
			title,
			link,
			content
		});
	};

	handleMediaPreviewClick = (e) => {

		e.stopPropagation();

		this.handleMediaPreviewDisplay(document.getElementById(`${this.contextId()}_${e.target.src}`));
	};

	handleMediaPreviewDisplay = (element) => {

		if (!element) { return; }

		document.body.style['overflow-y'] = 'hidden';

		const params = element.getBoundingClientRect(element);

		this.setState({
			mediaPreview: {
				x: params.x,
				y: params.y,
				left: params.left,
				right: params.right,
				top: params.top,
				bottom: params.bottom,
				height: params.height,
				width: params.width,
				src: element.src
			}
		});
	};

	handleMediaMouseOver = (e) => {

		const mediaElement = document.getElementById(`${this.contextId()}_${e.target.src}`);

		if (!mediaElement) { return; }

		mediaElement.style.border = `1px solid #fff`;
	};

	handleMediaMouseOut = (e) => {

		const mediaElement = document.getElementById(`${this.contextId()}_${e.target.src}`);

		if (!mediaElement) { return; }

		mediaElement.style.border = `1px solid ${COLORS.secondary}`;
	};

	handleInfoClicked = (e) => {

		e.stopPropagation();

		const rect = e.target.getBoundingClientRect();
		const infoTrigger = rect;

		this.setState({ infoTrigger });
	};

	handleReplyClicked = () => {

		if (this.props.mobile) {

			this.props.handleMobileReply({
				event: this.props.event,
				eroot: this.props.eroot
			});

		} else {

			this.setState({ compose: true });
		}
	};

	handleZapRequest = (recipient, event) => {

		this.setState({ pendingZapRequest: true });

		this.props.handleZapRequest({
			...recipient,
			pubkey: this.props.event.pubkey
		}, event, {
			onResolve: () => {
				this.setState({ pendingZapRequest: false });
			}
		});

	};

	handleStar = () => {

		if (this.props.upvotes && this.props.upvotes[this.props.active]) {

			// If upvote already exists, handle removal
			// i.e. create a delete message for the upvote
			this.handleDelete(this.props.upvotes[this.props.active]);

		} else {

			// Generic upvote as per NIP-25
			this.props.handlePost({
				content: '+',
				kind: 7
			}, {
				event: this.props.event,
				eroot: this.props.eroot
			});

		}
	};

	handleRepost = (params = {}) => {

		// TODO maybe prompt user to confirm repost

		if (params.delete) {

			// If repost already exists, handle "unrepost"
			// i.e. create a delete message for the repost
			this.handleDelete(this.props.repost.event);

		} else {

			// Create kind 6 repost event
			this.props.handlePost({
				content: JSON.stringify(this.props.event),
				kind: 6
			}, {
				event: this.props.event
			});
		}
	};

	handleDelete = (event) => {

		const { active, repost } = this.props;

		const remove = [{ event }];

		// If deleting your own event that you've also,
		// reposted, delete the repost at the same time
		if (repost && repost.event.id !== event.id && repost.event.pubkey === active) {
			remove.push(repost);
		}

		// Create the kind 5 delete event
		this.props.handlePost({
			content: '',
			kind: 5
		}, remove);
	};

	handlePost = (data) => {

		return this.props.handlePost(data, {
			event: this.props.event,
			eroot: this.props.eroot
		});
	};

	attachMediaPreviewListeners = () => {

		this.media = document.getElementsByClassName(this.contextId());

		// TODO for mobile it should be an onclick listener that brings
		// up the image in an easily dismissable fullscreen modal so
		// you don't have to go to a new tab

		for (let item of this.media) {

			item.removeEventListener('click', this.handleMediaPreviewClick);
			item.addEventListener('click', this.handleMediaPreviewClick);

			if (!this.props.mobile) {

				item.removeEventListener('mouseover', this.handleMediaMouseOver);
				item.addEventListener('mouseover', this.handleMediaMouseOver);
				item.removeEventListener('mouseleave', this.handleMediaMouseOut);
				item.addEventListener('mouseleave', this.handleMediaMouseOut);
			}

			//item.addEventListener('mouseleave', this.handleMediaMouseOut);
		}
	};

	contextId = () => {

		return `${this.props.event.id}_${this.props.feedName}`;
	};

	renderMediaPreview = () => {

		const { mediaPreview } = this.state;

		if (!mediaPreview) { return null; }

		const clientHeight = window.clientHeight || document.documentElement.clientHeight;
		const clientWidth = window.clientWidth || document.documentElement.clientWidth;

		let height, width;

		if ((clientHeight / clientWidth) > ((mediaPreview.height / mediaPreview.width))) {

			width = clientWidth - (this.props.mobile ? 0 : 96);
			height = 'auto';

		} else {

			height = clientHeight - (this.props.mobile ? 0 : 96);
			width = 'auto';
		}

		let index;

		for (let i = 0; i < this.media.length; i++) {
			if (this.media[i].src === mediaPreview.src) {
				index = i;
				break;
			}
		}

		const clearPreview = (e) => {

			e.stopPropagation();

			document.body.style['overflow-y'] = 'unset';

			this.setState({ mediaPreview: null });
		};

		const next = (e, inc) => {
			e.stopPropagation();
			const seek = (index + inc) % this.media.length;
			this.handleMediaPreviewDisplay(this.media[seek > -1 ? seek : this.media.length - 1]);
		};

		const image = (
			<img
				onClick={clearPreview}
				src={mediaPreview.src}
				style={{
					height,
					width,
					userSelect: 'none',
					position: 'fixed',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					borderRadius: 4,
					padding: 1,
					background: COLORS.primary,
					zIndex: 999999
				}}
			/>
		);

		const dimmerStyle = {
			position: 'fixed',
			background: 'rgba(0,0,0,0.75)',
			top: 0,
			left: 0,
			height: clientHeight,
			width: clientWidth,
			zIndex: 999999
		};

		return this.media.length > 1 && !this.props.mobile ? (
			<div
				onClick={clearPreview}
				style={dimmerStyle}
			>
				<div
					style={{
						position: 'absolute',
						transform: 'translate(-50%)',
						left: '50%',
						top: 15,
						fontSize: 12,
						fontFamily: 'JetBrains-Mono-Regular',
					}}
				>
					GALLERY {index + 1} / {this.media.length}
				</div>
				<div
					onClick={(e) => next(e, -1)}
					onMouseOver={() => this.setState({ hover: 'chevronleft' })}
					onMouseOut={() => this.setState({ hover: '' })}
					style={{
						position: 'absolute',
						transform: 'translate(0, -50%)',
						top: '50%',
						left: 48,
						cursor: 'pointer',
						zIndex: 9999999,
						padding: 16,
						border: `1px solid #fff`,
						opacity: this.state.hover === 'chevronleft' ? 1 : 0.85,
						borderRadius: 48
					}}
				>
					<Chevron
						thickness={1}
						dimension={12}
						pointing='left'
						style={{ color: '#fff' }}
					/>
				</div>
				<div
					onClick={(e) => next(e, 1)}
					onMouseOver={() => this.setState({ hover: 'chevronright' })}
					onMouseOut={() => this.setState({ hover: '' })}
					style={{
						position: 'absolute',
						transform: 'translate(0, -50%)',
						top: '50%',
						right: 48,
						cursor: 'pointer',
						zIndex: 9999999,
						padding: 16,
						border: `1px solid #fff`,
						opacity: this.state.hover === 'chevronright' ? 1 : 0.85,
						borderRadius: 48
					}}
				>
					<Chevron
						thickness={1}
						dimension={12}
						pointing='right'
						style={{ color: '#fff' }}
					/>
				</div>
				{image}
			</div>
		) : (
			<div
				onClick={clearPreview}
				style={dimmerStyle}
			>
				{image}
			</div>
		);
	};

	renderReplacedTitleElements = () => {

		if (!this.props.replaceTitle) { return null; }

		const { title, link } = this.state;

		if (!title && !link) { return null; }

		return (
			<div style={{
				marginBottom: 6
			}}>
				{title ? (
					<div
						style={{
							fontWeight: 'bold',
							fontSize: 18,
							color: '#fff',
							marginBottom: 6,
							lineHeight: '24px'
						}}
					>
						{title}
					</div>
				) : null}
				{link ? (
					<a href={link} target='_blank'>
						<div
							style={{
								fontSize: 13
							}}
						>
							{link}
						</div>
					</a>
				) : null}
			</div>
		);
	};

	renderEventInfoTrigger = () => {

		return (
			<span
				style={styles.infoTrigger(this.props, this.state)}
				onMouseOver={() => this.setState({ hoverEllipsis: true })}
				onMouseOut={() => this.setState({ hoverEllipsis: false })}
				onClick={this.handleInfoClicked}
			>
				•••
			</span>
		);
	};

	renderEventInfo = () => {

		if (!this.state.infoTrigger) { return null; }

		const { event } = this.props;

		const infoItem = {
			height: 24,
			display: 'flex',
			alignItems: 'center'
		};

		const label = {
			width: 148,
			fontFamily: 'JetBrains-Mono-Bold'
		};

		return (
			<InfoBox
				uniqueid={event.id}
				triggerWidth={this.state.infoTrigger.width}
				triggerX={this.state.infoTrigger.x}
				triggerY={this.state.infoTrigger.y}
				onClose={() => this.setState({ infoTrigger: null })}
				height={150}
				width={480}
				margin={this.props.mobile ? 7 : 14}
				style={{
					color: '#fff',
					fontSize: 12,
					padding: '14px 16px',
					fontFamily: 'JetBrains-Mono-Regular',
				}}
			>
				<div style={infoItem}>
					<span style={label}>
						EVENT ID
						<ToolTip
							iconStyle={styles.tooltip}
							position='top center'
							text={`This is the unique ID of the nostr event`}
						/>
					</span>
					<CanonicalValue
						style={{ width: '100%', padding: 0, background: null }}
						value={event.id}
						copiable
					/>
				</div>
				<div style={infoItem}>
					<span style={label}>
						SIGNED BY
						<ToolTip
							iconStyle={styles.tooltip}
							position='top center'
							text={`This is the public key of the person who signed this data`}
						/>
					</span>
					<CanonicalValue
						style={{ width: '100%', padding: 0, background: null }}
						value={nip19.npubEncode(event.pubkey)}
						copiable
					/>
				</div>
				<div style={infoItem}>
					<span style={label}>
						JSON DATA
						<ToolTip
							iconStyle={styles.tooltip}
							position='top center'
							text={`This is the raw json data for this event with the signature proving its authenticity`}
						/>
					</span>
					<CanonicalValue
						style={{ width: '100%', padding: 0, background: null }}
						value={JSON.stringify(event)}
						copiable
					/>
				</div>
				<div style={infoItem}>
					<span style={label}>
						CREATED AT
						<ToolTip
							iconStyle={styles.tooltip}
							position='top center'
							text={`This is the timestamp of the event according to the person who signed it`}
						/>
					</span>
					<CanonicalValue
						style={{ width: '100%', padding: 0, background: null }}
						value={(new Date(event.created_at * 1000)).toISOString()}
						copiable
					/>
				</div>
				<div style={infoItem}>
					<span style={label}>
						DIRECT LINK
						<ToolTip
							iconStyle={styles.tooltip}
							position='top center'
							text={`This is the direct link to load this event and its replies on Satellite`}
						/>
					</span>
					<CanonicalValue
						style={{ width: '100%', padding: 0, background: null }}
						value={`https://satellite.earth/thread/${nip19.noteEncode(event.id)}`}
						linkToInternal={`/thread/${nip19.noteEncode(event.id)}`}
						copiable
						qr
					/>
				</div>
			</InfoBox>
		);
	};

	renderReplies = () => {

		const { depth, mobile, active, highlight, event, replies, handlePost, handleMobileReply, thread, quote } = this.props;

		if (thread || !replies || replies.length === 0 || quote) { return null; }

		if (depth >= (mobile ? 10 : 20)) {

			return (
				<span
					onClick={() => this.props.navigate(`/thread/${event.id}`)}
					style={{
						color: COLORS.blue,
						marginTop: 12,
						fontSize: 13,
						cursor: 'pointer'
					}}
				>
					thread continues <Icon name='long arrow alternate right' style={{ color: COLORS.blue }} />
				</span>
			);
		}

		return (
			<div style={styles.repliesContainer}>
				{replies.map((item, index) => {
					return (
						<Item
							key={item.event.id}
							_mod={this.props._mod}
							searchActive={this.props.searchActive}
							depth={this.props.depth + 1}
							index={index}
							mobile={mobile}
							active={active}
							profile={this.props.profile}
							event={item.event}
							eroot={item.eroot}
							replies={item.replies}
							deleted={item.deleted}
							phantom={item.phantom}
							highlight={this.props.highlight}
							repost={item._repost}
							upvotes={item.upvotes}
							handlePost={handlePost}
							handleMobileReply={handleMobileReply}
							navigate={this.props.navigate}
							handleFollow={this.props.handleFollow}
							handleQueryProfiles={this.props.handleQueryProfiles}
							handleZapRequest={this.props.handleZapRequest}
							contacts={this.props.contacts}
							metadata={this.props.metadata}
							author={item.author}
							feedName={this.props.feedName}
							showFullsizeMedia={this.props.profile && (this.props.profile === item.event.pubkey || item._repost || (item.upvotes && item.upvotes[this.props.profile]))}
							items={this.props.items}
							feedPostId={this.props.feedPostId}
						/>
					);
				})}
			</div>
		);
	};

	renderBody = () => {

		if (this.props.event.kind === 6) { return null; }

		const metadata = this.props.metadata || {};
		const mentions = {};

		for (let tag of this.props.event.tags) {

			if (metadata[tag[1]]) {
				mentions[tag[1]] = metadata[tag[1]];
			}
		}

		if (this.props.replaceTitle && !this.state.content) {
			return null;
		}

		const replaced = (this.state.content || this.props.event.content).split('nostr:').map(s => {

			let qid;

			// TODO cache the results of transforming s -> qid
			// as a performance optimization

			if (s.indexOf('note1') === 0) {

				qid = s.substring(0, 63);

			} else if (s.indexOf('nevent1') === 0) {

				const alphanum = '0123456789abcdefghijklmnopqrstuvwxyz';

				for (let c = 0; c < s.length; c++) {
					if (alphanum.indexOf(s[c]) === -1) {
						qid = s.substring(0, c);
						break;
					}
				}

				if (!qid) {

					qid = s;
				}

			} else if (s.indexOf('npub1') === 0) {

				return `nostr:${s}`;
			}

			if (!qid) { return s; }

			if (this.ident[qid] === undefined) {

				try {

					const decoded = nip19.decode(qid);

					if (decoded.type === 'note') {

						this.ident[qid] = decoded.data;

					} else if (decoded.type === 'nevent') {

						this.ident[qid] = decoded.data.id;

					} else {

						this.ident[qid] = null;
					}

				} catch (err) {
					this.ident[qid] = null;
				}
			}

			if (this.ident[qid]) {

				return `__replace__quote:${this.ident[qid]}${s.slice(qid.length)}__replace__`;
			}

			return s;

		}).join('');

		return (
			<div>
				{replaced.split('__replace__').map((markdown, index) => {
				
					const renderQuote = (id) => {

						if (id === this.props.feedPostId) { return null; }

						const item = this.props.items[id];
						const nnote = nip19.noteEncode(id);

						return item && !item.phantom ? (
							<div
								key={index}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									this.props.navigate(`/thread/${nnote}`);
								}}
								onMouseOver={(e) => {
									this.setState({ hover: `quote_${id}` });
								}}
								onMouseOut={(e) => {
									this.setState({ hover: '' });
								}}
								style={{
									padding: 12,
									border: `1px dotted ${COLORS.secondary}`,
									borderRadius: 12,
									marginTop: 12,
									marginBottom: 12,
									cursor: 'pointer',
									background: this.state.hover === `quote_${id}` ? 'rgba(255,255,255,0.015)' : null
								}}
							>
								<div style={{
									pointerEvents: 'none'
								}}>
									<Item
										quote
										_mod={this.props._mod}
										searchActive={this.props.searchActive}
										depth={this.props.depth + 1}
										index={0}
										mobile={this.props.mobile}
										active={this.props.active}
										profile={this.props.profile}
										event={item.event}
										eroot={item.eroot}
										replies={item.replies}
										deleted={item.deleted}
										phantom={item.phantom}
										highlight={this.props.highlight}
										repost={item._repost}
										upvotes={item.upvotes}
										handlePost={this.props.handlePost}
										handleMobileReply={this.props.handleMobileReply}
										navigate={this.props.navigate}
										handleFollow={this.props.handleFollow}
										handleQueryProfiles={this.props.handleQueryProfiles}
										handleZapRequest={this.props.handleZapRequest}
										contacts={this.props.contacts}
										metadata={this.props.metadata}
										author={item.author}
										feedName={this.props.feedName}
										//showFullsizeMedia={this.props.profile && (this.props.profile === item.event.pubkey || item._repost || (item.upvotes && item.upvotes[this.props.profile]))}
										items={this.props.items}
										feedPostId={this.props.feedPostId}
									/>
								</div>
							</div>
						) : (
							<Link
								to={`/thread/${nnote}`}
								key={index}
							>
								<div
									onMouseOver={() => this.setState({ hover: `quote_${id}` })}
									onMouseOut={() => this.setState({ hover: '' })}
									style={{
										padding: 12,
										border: `1px dotted ${COLORS.secondary}`,
										borderRadius: 12,
										marginTop: 12,
										marginBottom: 12,
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										color: COLORS.secondaryBright,
										cursor: 'pointer',
										background: this.state.hover === `quote_${id}` ? 'rgba(255,255,255,0.015)' : null
									}}
								>
									<Icon
										name='quote left'
										style={{
											fontSize: 13,
											marginRight: 10
										}}
									/>
									{nnote}
								</div>
							</Link>
						);
					};

					let quoted;

					if (markdown.indexOf('quote:') === 0) {

						return (
							<div key={index}>
								{renderQuote(markdown.substring(6, 70))}
								<MD
									//key={index}
									showFullsizeMedia={this.props.showFullsizeMedia}
									showImagePreviews
									attachMediaPreviewListeners={this.attachMediaPreviewListeners}
									scriptContextId={this.contextId()}
									markdown={markdown.slice(70)}
									style={styles.text}
									comment
									mentions={mentions}
									tags={this.props.event.tags}
								/>
							</div>
						);
					}

					return (
						<div key={index}>
							<MD
								showFullsizeMedia={this.props.showFullsizeMedia}
								showImagePreviews
								attachMediaPreviewListeners={this.attachMediaPreviewListeners}
								scriptContextId={this.contextId()}
								markdown={markdown}
								style={styles.text}
								comment
								mentions={mentions}
								tags={this.props.event.tags}
							/>
						</div>
					);
				})}
			</div>
		);

		/*
		return (
			<div style={{
				//marginTop: 24
			}}>
				<MD
					showFullsizeMedia={this.props.showFullsizeMedia}
					showImagePreviews
					attachMediaPreviewListeners={this.attachMediaPreviewListeners}
					scriptContextId={this.contextId()}
					markdown={this.state.content || this.props.event.content}
					style={styles.text}
					comment
					mentions={mentions}
					tags={this.props.event.tags}
				/>
			</div>
		);
		*/
		

	};

	renderEditor = () => {

		const { compose } = this.state;

		if (!compose) { return null; }

		const author = this.props.author || {};
		const { name, display_name } = author;
		const encoded = nip19.npubEncode(this.props.event.pubkey);

		return (
			<Editor
				id={`reply_${this.props.event.id}`}
				rows={3}
				searchActive={this.props.searchActive}
				placeholder={`Replying to ${display_name || name || encoded.slice(0, 8) + '...' + encoded.slice(-4)}`}
				handlePost={this.handlePost}
				handleQueryProfiles={this.props.handleQueryProfiles}
				style={{ marginBottom: 16, marginTop: 16 }}
				onCancel={() => this.setState({ compose: false })}
				onPosted={() => this.setState({ compose: false })}
				showCancel
			/>
		);
	};

	renderActions = () => {

		const { repost, event, upvotes, active, thread, quote } = this.props;
		const { hover, pendingZapRequest } = this.state;

		if (thread || quote || this.state.compose || this.props.event.kind === 6) { return null; }

		const activeRepost = repost && repost.event.pubkey === active;
		const ownEvent = event.pubkey === active;
		const author = this.props.author || {};
		const showZapAction = !pendingZapRequest && (author.lud06 || author.lud16);

		return (
			<div style={styles.actions}>
				<div
					style={{ ...styles.actionItem({ hover: hover === 'reply' }), marginLeft: -8 }}
					onClick={this.handleReplyClicked}
					onMouseOver={() => this.setState({ hover: 'reply' })}
					onMouseOut={() => this.setState({ hover: '' })}
				>
					<img
						style={{ cursor: 'pointer', transform: 'translate(0px, 1px)' }}
						src={svgcomment}
						height={18}
						width={18}
					/>
				</div>
				<div
					style={styles.actionItem({ hover: hover === 'star' })}
					onClick={() => this.handleStar()}
					onMouseOver={() => this.setState({ hover: 'star' })}
					onMouseOut={() => this.setState({ hover: '' })}
				>
					<img
						style={{ cursor: 'pointer', transform: 'translate(0px, 1px)' }}
						src={upvotes && upvotes[active] ? svgupactive : svgupinactive}
						height={15}
						width={15}
					/>
				</div>
				{activeRepost ? null : (
					<div
						style={styles.actionItem({ hover: hover === 'repost' })}
						onClick={() => this.handleRepost()}
						onMouseOver={() => this.setState({ hover: 'repost' })}
						onMouseOut={() => this.setState({ hover: '' })}
					>
						<img
							style={{ cursor: 'pointer' }}
							src={svgrepost}
							height={19}
							width={19}
						/>
					</div>
				)}
				{showZapAction ? (<div
					style={styles.actionItem({ hover: hover === 'zap' })}
					onClick={() => this.handleZapRequest(author, event)}
					onMouseOver={() => this.setState({ hover: 'zap' })}
					onMouseOut={() => this.setState({ hover: '' })}
				>
					<img
						style={{ cursor: 'pointer', transform: 'translate(0px, 2px)' }}
						src={svglightning}
						height={15}
						width={15}
					/>
				</div>) : null}
				{ownEvent ? (
					<div
						style={styles.actionItem({ hover: hover === 'delete' })}
						onClick={() => this.handleDelete(event)}
						onMouseOver={() => this.setState({ hover: 'delete' })}
						onMouseOut={() => this.setState({ hover: '' })}
					>
						<img
							style={{ cursor: 'pointer', transform: 'translate(0px, 1px)' }}
							src={svgdelete}
							height={16}
							width={16}
						/>
					</div>
				) : null}
			</div>
		);
	};

	renderThreadInfo = () => {

		const { thread, list_n, list_p, list_t } = this.props;

		if (!thread || !list_n || !list_p) { return null; }

		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					fontSize: 12,
					marginTop: 6,
					marginBottom: 2
				}}
			>
				<div style={{ color: COLORS.secondaryBright, overflow: 'hidden', textOverflow: 'ellipsis' }}>
					{list_p} replied <RelativeTime time={list_t} />
				</div>
				<div style={{ fontSize: 11, fontFamily: 'JetBrains-Mono-Bold' }}>
					<Icon name='reply' style={{ marginRight: 5 }} />
					<span>{list_n}</span>
				</div>
			</div>
		);
	};

	render = () => {

		const { upvotes, thread, selected, event, highlight, phantom, recent, deleted, repost, active, mobile, topLevel, profile } = this.props;

		if (/*recent*/false || (event && event.kind === 7)) { return null; }

		if (phantom) {

			return (
				<div style={{ ...styles.bodyContainer(this.props), marginBottom: topLevel ? 24 : 0 }}>
					<div style={{ ...styles.meta, marginBottom: -14 }}>
						{this.renderEventInfoTrigger()}
					</div>
					{this.renderReplies()}
				</div>
			);
		}

		if (deleted) {

			return (
				<div style={styles.bodyContainer(this.props)}>
					<div style={{
						...styles.meta,
						marginBottom: 16,
						marginLeft: 8
					}}>
						<div style={{ marginRight: 12 }}>[deleted]</div>
						<RelativeTime time={deleted.created_at} />
					</div>
					{this.renderReplies()}
				</div>
			);
		}

		const author = this.props.author || {};

		const { name, display_name, about, nip05, picture } = author;

		const item = (
			<div
				ref={this.item}
				onClick={thread ? () => this.props.handleSelectThread(this.props) : null}
				onMouseOver={() => { if (this.props.mobile || !this.item) { return; } this.item.current.style.background = 'rgba(31, 32, 33, 0.8)'; }}
				onMouseOut={() => { if (this.props.mobile || !this.item) { return; } this.item.current.style.background = 'unset'; }}
				style={{
					willChange: 'scroll-position',
					borderLeft: selected ? `2px solid #fff` : '2px solid transparent',
					cursor: thread ? 'pointer' : 'default',
					marginBottom: thread ? 8 : (this.props.topLevel ? 24 : 0),
					padding: thread ? `${this.props.mobile ? 8 : 12}px 16px ${this.props.divided ? 14 : 4}px` : 0,
					background: this.state.hoverItem ? 'rgba(31, 32, 33, 0.8)' : null,
					borderBottom: this.props.divided ? `1px solid ${COLORS.secondary}` : 'none'
				}}
			>
				{this.renderMediaPreview()}
				{this.renderReplacedTitleElements()}
				<div style={styles.meta}>
					<Author
						infoHover
						mobile={this.props.mobile}
						active={this.props.active}
						infoTriggerId={event.id + (thread ? '_thread' : '')}
						pubkey={event.pubkey}
						name={name}
						displayName={display_name}
						about={about}
						nip05={nip05}
						picture={picture}
						highlight={highlight === event.pubkey}
						navigate={this.props.navigate}
						following={this.props.contacts[event.pubkey]}
						handleFollow={this.props.handleFollow}
					/>
					<RelativeTime time={event.created_at} />
					{this.renderEventInfoTrigger()}
					{this.renderEventInfo()}
				</div>
				<div style={styles.bodyContainer({
					mobile: this.props.mobile,
					thread: this.props.thread,
					quote: this.props.quote
				})}>
					<div style={{ transform: 'translate(0px, -4px)' }}>
						{this.renderBody()}
						{this.renderEditor()}
						{this.renderActions()}
						{this.renderThreadInfo()}
					</div>
					{this.renderReplies()}
				</div>
			</div>
		);

		if (!thread) {

			if (repost) {

				const activeRepost = repost.event.pubkey === active;

				const icon = (
					<img
						style={{ marginRight: 4, cursor: activeRepost ? 'pointer' : 'default' }}
						src={svgrepostwhite}
						height={17}
						width={17}
						onClick={activeRepost ? (() => this.handleRepost({ delete: true })) : null}
					/>
				);

				const repostAuthor = repost.author || {};

				return (
					<div/* style={{ willChange: 'scroll-position' }}*/>
						<div style={{ ...styles.meta, marginBottom: 4 }}>
							{activeRepost && !mobile ? (
								<Popup
									style={{ fontSize: 12, zIndex: 99999, filter: 'invert(85%)', boxShadow: 'none', color: '#000' }}
									position='top center'
									trigger={icon}
									content='Click to unrepost'
								/>
							) : icon}
							<Author
								infoHover
								hideImage
								mobile={this.props.mobile}
								active={this.props.active}
								infoTriggerId={`${repost.event.id}_${this.props.depth}`}
								pubkey={repost.event.pubkey}
								name={repostAuthor.name}
								displayName={repostAuthor.display_name}
								about={repostAuthor.about}
								nip05={repostAuthor.nip05}
								picture={repostAuthor.picture}
								highlight={highlight === repost.event.pubkey}
								navigate={this.props.navigate}
								following={this.props.contacts[repost.event.pubkey]}
								handleFollow={this.props.handleFollow}
							/>
							<RelativeTime time={repost.event.created_at} />
						</div>
						{item}
					</div>
				);

			} else if (upvotes && upvotes[profile]) {

				const upvoteEvent = upvotes[profile];
				const activeUpvote = upvoteEvent.pubkey === active;
				const upvoteAuthor = ((this.props.metadata || {})[profile] || {}).profile || {};

				// Render generic upvote events a star, others as emoji
				const upvoteReaction = upvoteEvent.content === '+' ? (
					<img
						style={{ marginBottom: 2 }}
						src={svgupactive}
						height={13}
						width={13}
					/>
				) : (
					<span>
						{upvoteEvent.content}
					</span>
				);

				const upvoteReactionElement = (
					<div
						style={{ marginRight: 5, cursor: activeUpvote ? 'cursor' : 'default' }}
						onClick={activeUpvote ? this.handleStar : undefined}
					>
						{upvoteReaction}
					</div>
				);

				return (
					<div>
						<div style={{ ...styles.meta, marginBottom: 4 }}>
							{activeUpvote && !mobile ? (
								<Popup
									style={{ fontSize: 12, zIndex: 99999, filter: 'invert(85%)', boxShadow: 'none', color: '#000' }}
									position='top center'
									trigger={upvoteReactionElement}
									content='Click to remove reaction'
								/>
							) : upvoteReactionElement}
							<Author
								infoHover
								hideImage
								mobile={this.props.mobile}
								active={this.props.active}
								infoTriggerId={`${upvoteEvent.id}_${this.props.depth}`}
								pubkey={upvoteEvent.pubkey}
								name={upvoteAuthor.name}
								displayName={upvoteAuthor.display_name}
								about={upvoteAuthor.about}
								nip05={upvoteAuthor.nip05}
								picture={upvoteAuthor.picture}
								highlight={highlight === upvoteEvent.pubkey}
								navigate={this.props.navigate}
								following={this.props.contacts[upvoteEvent.pubkey]}
								handleFollow={this.props.handleFollow}
							/>
							<RelativeTime time={upvoteEvent.created_at} />
						</div>
						{item}
					</div>
				);
			}
		}	

		return item;
	}
}

const styles = {

	tooltip: {
		opacity: 0.5
	},

	repliesContainer: {
		marginTop: 16,
		paddingLeft: 12,
		borderLeft: `1px dotted ${COLORS.secondary}`,
	},

	infoTrigger: ({ phantom }, { infoTrigger, hoverEllipsis }) => {
		return {
			userSelect: 'none',
			marginLeft: phantom ? -2 : 12,
			marginTop: phantom ? -4 : 0,
			color: hoverEllipsis || infoTrigger ? '#fff' : COLORS.secondaryBright,
			fontFamily: 'JetBrains-Mono-Regular',
			fontSize: 11,
			cursor: 'pointer'
		};
	},

	meta: {
		display: 'flex',
		alignItems: 'center',
		lineHeight: '12px',
		fontSize: 12,
		height: 26,
		color: COLORS.secondaryBright,
		overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
	},

	text: {
		fontSize: 14,
		whiteSpace: 'pre-line'
	},

	actions: {
		fontFamily: 'JetBrains-Mono-Regular',
		display: 'flex',
		marginTop: 8,
		marginLeft: -2
	},

	actionItem: ({ hover }) => {
		return {
			fontSize: 12,
			marginTop: -4,
			padding: '4px 8px',
			cursor: 'pointer',
			userSelect: 'none',
			color: COLORS.secondaryBright,
			opacity: hover ? 1 : 0.85
		};
	},

	bodyContainer: ({ mobile, thread, quote }) => {
		return {
			color: '#fff',
			marginBottom: quote ? -4 : (thread ? 0 : 16),
			marginTop: 8
		};
	}
};

export default Item;
