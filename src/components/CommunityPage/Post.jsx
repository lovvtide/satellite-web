import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Icon } from 'semantic-ui-react';

import { Chevron } from '../CommonUI';
import MD from '../common/MD';
import ApproveButton from './ApproveButton';
import Name from './Name';
import Item from '../Nostr/Item';

import { COLORS } from '../../constants';
import { relativeTime } from '../../helpers';


class Post extends PureComponent {

	state = {};

	// renderTitle = (title, content) => {

	// 	if (!title) { return null; }

	// 	const format = (s) => {
	// 		return s.replace('\n\n', '\n');
	// 	};

	// 	return (
	// 		<div
	// 			style={{
	// 				fontSize: 14,
	// 				fontWeight: 'bold',
	// 				marginBottom: 2
	// 			}}
	// 		>
	// 			<Link
	// 				to={`${this.props.base}/${nip19.noteEncode(this.props.event.id)}`}
	// 			>
	// 				{title ? (
	// 					<span
	// 						onMouseOver={() => this.setState({ hover: 'title' })}
	// 						onMouseOut={() => this.setState({ hover: '' })}
	// 						style={{
	// 							textDecoration: this.state.hover === 'title' ? 'underline' : 'none',
	// 							color: '#fff'
	// 						}}
	// 					>
	// 						{title || 'Untitled Post'}
	// 					</span>
	// 				) : /*(
	// 					<span
	// 						onMouseOver={() => this.setState({ hover: 'title' })}
	// 						onMouseOut={() => this.setState({ hover: '' })}
	// 						style={{
	// 							textDecoration: this.state.hover === 'title' ? 'underline' : 'none',
	// 							color: '#fff'
	// 						}}
	// 					>
	// 						{content.length > 300 ? format(content.substring(0, 300)) + '...' : format(content)}
	// 					</span>
	// 				)*/null}
	// 			</Link>
	// 		</div>
	// 	);
	// };

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
					borderRadius: 3,
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

	// renderLink = (link) => {

	// 	if (!link) { return null; }

	// 	return (
	// 		<div style={{
	// 			fontSize: 13,
	// 			color: COLORS.blue,
	// 			maxWidth: 650,
	// 			whiteSpace: 'nowrap',
	// 			overflow: 'hidden',
	// 			textOverflow: 'ellipsis',
	// 			marginBottom: 1
	// 		}}>
	// 			<a
	// 				href={link}
	// 				target='_blank'
	// 			>
	// 				{link}
	// 			</a>
	// 		</div>
	// 	);
	// };

	renderVotes = () => {

		return null; // TODO enable

		const { mobile, approval, voteBalance } = this.props;

		if (!this.props.approval) { return null; }

		return (
			<div style={{
				minWidth: 36,
				marginRight: mobile ? 10 : 14,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				paddingTop: mobile ? 4 : 0,
				marginTop: mobile ? 0 : -8
			}}>
				<div
					onMouseOver={() => this.setState({ hover: '+' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={() => this.props.handleVote('+')}
					style={{
						height: 28,
						width: 28,
						display: 'flex',
						alignItems: 'center',
						border: mobile ? `1px solid ${COLORS.secondary}` : 'none',
						borderRadius: 24,
						justifyContent: 'center',
						cursor: 'pointer',
						userSelect: 'none'
					}}
				>					
					<Icon
						name='chevron up'
						style={{
							color: this.state.hover === '+' ? '#fff' : COLORS.secondaryBright,
							//opacity: this.state.hover === '+' ? 1 : 0.85,
							fontSize: 14,
							height: mobile ? 20 : 21,
							margin: 0
						}}
					/>
				</div>
				<div
					style={{
						height: mobile ? 32 : 14,
						fontSize: 13,
						display: 'flex',
						alignItems: 'center',
						color: voteBalance > 0 ? '#fff' : COLORS.secondaryBright,
						fontWeight: 'bold'
					}}
				>
					{voteBalance}
				</div>
				<div
					onMouseOver={() => this.setState({ hover: '-' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={() => this.props.handleVote('-')}
					style={{
						height: 28,
						width: 28,
						display: 'flex',
						alignItems: 'center',
						border: mobile ? `1px solid ${COLORS.secondary}` : 'none',
						borderRadius: 24,
						justifyContent: 'center',
						cursor: 'pointer',
						userSelect: 'none'
					}}
				>	
					<Icon
						name='chevron down'
						style={{
							color: this.state.hover === '-' ? '#fff' : COLORS.secondaryBright,
							//opacity: this.state.hover === '-' || mobile ? 1 : 0.85,
							fontSize: 14,
							height: mobile ? 18 : 19,
							margin: 0
						}}
					/>
				</div>
			</div>
		);
	};

	renderMobileVotes = () => {

		const { mobile } = this.props;

		if (!mobile) { return null; }

		return (
			<div>
				[up] [down]
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
					marginBottom: mobile ? 16 : 0,
					marginLeft: mobile ? -12 : 0,
					marginRight: mobile ? -12 : 0,
					paddingBottom: mobile ? 14 : 18,
					paddingLeft: mobile ? 12 : 0,
					paddingRight: mobile ? 12 : 0,
					overflowWrap: 'anywhere',
					whiteSpace: 'break-spaces',
					borderBottom: mobile ? `1px dotted ${COLORS.secondary}` : 'none',
				}}
			>	
				{this.renderApproveAction()}
				<div style={{
					display: 'flex'
				}}>
					{this.renderVotes()}
					<div style={{
						//paddingRight: 76
						width: '100%',
						//borderRadius: 12,
						//borderLeft: mobile ? 'none' : `5px solid rgba(255,255,255)`,
						borderBottom: mobile ? 'none' : `1px dotted ${COLORS.secondary}`,
						//background: mobile ? null : 'rgba(255,255,255,0.025)',
						//padding: mobile ? 0 : 14,
						paddingBottom: mobile ? 0 : 18,
						paddingLeft: mobile ? 0 : 14,
						maxWidth: mobile ? null : this.props.clientWidth ? (this.props.clientWidth * (mobile ? 1 : 0.75)) - (mobile ? 76 : 112) : null
					}}>
						{this.renderBody(title, link)}
						{this.renderAttribution()}
					</div>
				</div>
				{/*{this.renderMobileVotes()}*/}
			</div>
		);
	};
}

export default Post;
