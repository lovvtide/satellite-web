import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Icon } from 'semantic-ui-react';

import ApproveButton from './ApproveButton';
import Name from './Name';
import Item from '../Nostr/Item';

import { COLORS } from '../../constants';
import { relativeTime } from '../../helpers';


class Post extends PureComponent {

	state = {  };

	/*
	attachMediaPreviewListeners = () => {

		this.media = document.getElementsByClassName(this.contextId());

		for (let item of this.media) {

			item.removeEventListener('click', this.handleMediaPreviewClick);
			item.addEventListener('click', this.handleMediaPreviewClick);

			if (!this.props.mobile) {

				item.removeEventListener('mouseover', this.handleMediaMouseOver);
				item.addEventListener('mouseover', this.handleMediaMouseOver);
				item.removeEventListener('mouseleave', this.handleMediaMouseOut);
				item.addEventListener('mouseleave', this.handleMediaMouseOut);
			}
		}
	};

	handleMediaPreviewClick = (e) => {

		e.stopPropagation();

		this.handleMediaPreviewDisplay(document.getElementById(`${this.contextId()}_${e.target.src}`));
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

	contextId = () => {
		return `${this.props.event.id}_community`;
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
	*/

	renderTitle = (title, content) => {

		if (!title) { return null; }

		const format = (s) => {
			return s.replace('\n\n', '\n');
		};

		return (
			<div
				style={{
					fontSize: 14,
					fontWeight: 'bold',
					marginBottom: 2
				}}
			>
				<Link
					to={`${this.props.base}/${nip19.noteEncode(this.props.event.id)}`}
				>
					{title ? (
						<span
							onMouseOver={() => this.setState({ hover: 'title' })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								textDecoration: this.state.hover === 'title' ? 'underline' : 'none',
								color: '#fff'
							}}
						>
							{title || 'Untitled Post'}
						</span>
					) : /*(
						<span
							onMouseOver={() => this.setState({ hover: 'title' })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								textDecoration: this.state.hover === 'title' ? 'underline' : 'none',
								color: '#fff'
							}}
						>
							{content.length > 300 ? format(content.substring(0, 300)) + '...' : format(content)}
						</span>
					)*/null}
				</Link>
			</div>
		);
	};

	renderApproveAction = () => {

		if (this.props.approval || !this.props.moderator) { return null; }

		return (
			<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
				<span style={{
					userSelect: 'none',
					whiteSpace: 'nowrap',
					textTransform: 'uppercase',
					fontSize: 10,
					fontFamily: 'JetBrains-Mono-Bold',
					color: COLORS.secondaryBright,
					paddingLeft: 7,
					paddingRight: 7,
					borderRadius: 3,
					background: 'rgba(255,255,255,0.05)',
					paddingTop: 2
				}}>
					pending approval
				</span>
				<ApproveButton
					onClick={this.props.handleApprove}
					onHoverState={hover => this.setState({ hover: hover ? 'title' : '' })}
				/>
			</div>
		);
	};

	renderLink = (link) => {

		if (!link) { return null; }

		return (
			<div style={{
				fontSize: 13,
				color: COLORS.blue,
				maxWidth: 650,
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				marginBottom: 1
			}}>
				<a
					href={link}
					target='_blank'
				>
					{link}
				</a>
			</div>
		);
	};

	renderBody = (title, link) => {

		let content = this.props.event.content;

		return (
			<div>
				<Item
					//key={item.event.id}
					_mod={this.props.feed._mod}
					previewReplacedLinks={!this.props.mobile}
					communityLink={`${this.props.base}/${nip19.noteEncode(this.props.event.id)}`}
					replaceTitleMode='list'
					replaceTitle
					hideActions
					hideAttribution
					depth={0}
					topLevel
					//index={index}
					mobile={this.props.mobile}
					//active={active}
					//profile={this.props.profile}
					event={this.props.event}
					//eroot={item.eroot}
					//replies={item.replies}
					//deleted={item.deleted}
					//phantom={item.phantom}
					//repost={item._repost}
					//upvotes={item.upvotes}
					//highlight={highlight}
					//divided={divided}
					//thread={this.props.thread}
					//list_n={item.list_n}
					//list_p={item.list_p}
					//list_t={item.list_t}
					searchActive={this.props.searchActive}
					handlePost={this.props.handlePost}
					handleMobileReply={this.props.handleMobileReply}
					handleSelectThread={this.props.handleSelectThread}
					handleQueryProfiles={this.props.handleQueryProfiles}
					handleZapRequest={this.props.handleZapRequest}
					handleFollow={this.props.handleFollow}
					//selected={item.event.id === this.props.selected}
					//recent={name && name === item.recent}
					navigate={this.props.navigate}
					contacts={this.props.contacts || {}}
					author={(this.props.feed.items[this.props.event.id] || {}).author}
					//feedName={this.props.name}
					metadata={this.props.feed.metadata}
					//metadataCount={Object.keys(this.props.metadata).length}
					//showFullsizeMedia={this.props.profile && (this.props.profile === item.event.pubkey || item._repost || (item.upvotes && item.upvotes[this.props.profile]))}
					//replaceTitle={item.event.id === this.props.replaceTitle}
					items={this.props.feed.items}
					//feedPostId={(this.props.buildOptions || {}).id}
				/>
			</div>
		);
	};

	renderAttribution = () => {

		const { hover } = this.state;
		const npub = nip19.npubEncode(this.props.event.pubkey);

		const posterLink = (
			<Link to={`/@${npub}`}>
				<span
					onMouseOver={() => this.setState({ hover: 'posterLink' })}
					onMouseOut={() => this.setState({ hover: '' })}
					style={{
						color: hover === 'posterLink' ? '#fff' : COLORS.secondaryBright
					}}
				>
					<Name
						profile={this.props.profile}
						npub={npub}
					/>
				</span>
			</Link>
		);

		const postedTo = this.props.postedTo ? (
			<span style={{ marginRight: 5 }}>
				to
				<Link to={`/n/${this.props.postedTo.name}/${this.props.postedTo.owner}`}>
					<span
						onMouseOver={() => this.setState({ hover: 'postedTo' })}
						onMouseOut={() => this.setState({ hover: '' })}
						style={{
							color: hover === 'postedTo' ? '#fff' : COLORS.secondaryBright,
							marginLeft: 5
						}}
					>
						n/{this.props.postedTo.name}
					</span>
				</Link>
			</span>
		) : null;

		return (
			<div style={{
				color: COLORS.secondaryBright,
				fontSize: 13,
				marginTop: -24
			}}>
				<span>
					Posted {postedTo ? postedTo : ''}{relativeTime(this.props.event.created_at)} by {posterLink}
				</span>
				<Link to={`${this.props.base}/${nip19.noteEncode(this.props.event.id)}`}>
					<span
						onMouseOver={() => this.setState({ hover: 'view_comments' })}
						onMouseOut={() => this.setState({ hover: '' })}
						style={{
							color: this.state.hover === 'view_comments' ? '#fff' : COLORS.secondaryBright,
							marginLeft: 12
							// fontSize: 13,
							// marginTop: -24
						}}
					>
						<Icon style={{ fontSize: 11 }} name='comment outline' />
						{this.props.mobile ? 'comments' : 'view comments'}
					</span>
				</Link>
			</div>
		);
	};

	render = () => {

		const { mobile } = this.props;

		let title, link;

		for (let tag of this.props.event.tags) {
			if (tag[0] === 'subject') {
				title = tag[1];
			} else if (tag[0] === 'r') {
				link = tag[1];
			}
		}

		return (
			<div
				style={{
					marginBottom: mobile ? 16 : 18,
					marginLeft: mobile ? -12 : 0,
					marginRight: mobile ? -12 : 0,
					paddingBottom: mobile ? 14 : 18,
					paddingLeft: mobile ? 12 : 0,
					paddingRight: mobile ? 12 : 0,
					overflowWrap: 'anywhere',
					whiteSpace: 'break-spaces',
					borderBottom: /*mobile*/true ? `1px dotted ${COLORS.secondary}` : 'none',
					//borderLeft: mobile ? 'none' : '6px solid rgb(29, 30, 31)'
					//borderLeft: mobile ? 'none' : '2px solid #fff'
				}}
			>	
				{/*{this.renderMediaPreview()}*/}
				{/*<div style={{
					display: 'flex',
					justifyContent: 'space-between'
				}}>
					{{this.renderTitle(title, this.props.event.content)}}
					{{this.renderApproveAction()}}
				</div>*/}
				{/*this.renderLink(link)*/}
				
{/*				<div style={{
					display: 'flex'
				}}>
					
					
				</div>*/}
				{this.renderApproveAction()}
				{this.renderBody(title, link)}
				{this.renderAttribution()}
			</div>
		);
	};
}

export default Post;
