import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Icon, Popup } from 'semantic-ui-react';

import { Chevron } from '../CommonUI';
import MD from '../common/MD';
import ApproveButton from './ApproveButton';
import Name from './Name';
import Item from '../Nostr/Item';

import { COLORS } from '../../constants';
import { relativeTime, formatSats } from '../../helpers';
import svglightning from '../../assets/lightning.svg';
import svglightningactive from '../../assets/lightning_active.svg';
import svglightningwhite from '../../assets/lightning_white.svg';


class Post extends PureComponent {

	state = {};

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

	renderVotes = () => {

		const { mobile, approval, voteBalance, zapTotal, zappedByActive, upvotes, downvotes } = this.props;

		if (!this.props.approval) { return null; }

		if (this.props.rankMode === 'zaps') { // Voting with zaps

			const { lud06, lud16 } = this.props.profile;
			const zapsDisabled = !(lud06 || lud16);

			const zapButton = (
				<div
					onMouseOver={() => this.setState({ hover: '+' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={zapsDisabled ? undefined : () => this.props.handleVote('zap', { lud06, lud16 })}
					style={{
						height: 28,
						width: 28,
						display: 'flex',
						alignItems: 'center',
						border: `1px solid ${zappedByActive || this.state.hover === '+' ? '#fff' : COLORS.secondary}`,
						borderRadius: 24,
						justifyContent: 'center',
						cursor: 'pointer',
						userSelect: 'none',
						marginBottom: mobile ? 0 : 8,
						marginTop: mobile ? 2 : 8
					}}
				>
					<img
						src={zappedByActive ? svglightningactive : (this.state.hover === '+' ? svglightningwhite : svglightning)}
						style={{
							height: 12
						}}
					/>
				</div>
			);

			return (
				<div style={{
					minWidth: mobile ? 36 : 44,
					marginRight: mobile ? 10 : 14,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					paddingTop: mobile ? 4 : 0,
					marginTop: mobile ? 0 : -3,
					overflow: 'hidden'
				}}>
					{zapsDisabled ? (
						<Popup
							trigger={zapButton}
							content={`Can't upvote because the poster has not set up lightning zaps`}
							position='left center'
							hideOnScroll
							style={{
								filter: 'invert(0.85)',
								boxShadow: 'none',
								fontSize: 13
							}}
						/>
					) : zapButton}
					<div
						style={{
							height: mobile ? 32 : 14,
							fontSize: mobile ? 12 : 13,
							display: 'flex',
							alignItems: 'center',
							color: zapTotal ? COLORS.satelliteGold : COLORS.secondaryBright,
							fontWeight: 'bold',
							whiteSpace: 'nowrap'
						}}
					>
						{formatSats(zapTotal)}
					</div>
				</div>
			);

		} else { // Voting with kind 7 (+/-) reactions

			return (
				<div style={{
					minWidth: mobile ? 36 : 44,
					marginRight: mobile ? 10 : 14,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					paddingTop: mobile ? 4 : 0,
					marginTop: mobile ? 0 : -3
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
								color: upvotes && upvotes[this.props.pubkey] ? '#fff' : (!mobile && this.state.hover === '+' ? '#fff' : COLORS.secondaryBright),
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
								color: downvotes && downvotes[this.props.pubkey] ? '#fff' : !mobile && this.state.hover === '-' ? '#fff' : COLORS.secondaryBright,
								fontSize: 14,
								height: mobile ? 18 : 19,
								margin: 0
							}}
						/>
					</div>
				</div>
			);
		}
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
					_mod={this.props.feed._mod}
					communityLink={`${this.props.base}/${nip19.noteEncode(this.props.event.id)}`}
					replaceTitleMode='list'
					replaceTitle
					hideActions
					hideAttribution
					depth={0}
					topLevel
					mobile={this.props.mobile}
					event={this.props.event}
					searchActive={this.props.searchActive}
					handlePost={this.props.handlePost}
					handleMobileReply={this.props.handleMobileReply}
					handleSelectThread={this.props.handleSelectThread}
					handleQueryProfiles={this.props.handleQueryProfiles}
					handleZapRequest={this.props.handleZapRequest}
					handleFollow={this.props.handleFollow}
					navigate={this.props.navigate}
					contacts={this.props.contacts || {}}
					author={(this.props.feed.items[this.props.event.id] || {}).author}
					metadata={this.props.feed.metadata}
					items={this.props.feed.items}
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
					marginBottom: mobile ? 12 : 0,
					marginLeft: mobile ? -12 : 0,
					marginRight: mobile ? -12 : 0,
					paddingBottom: mobile ? 14 : 16,
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
						width: '100%',
						borderBottom: mobile ? 'none' : `1px dotted ${COLORS.secondary}`,
						paddingBottom: mobile ? 0 : 18,
						maxWidth: this.props.clientWidth ? (this.props.clientWidth * (mobile ? 1 : 0.75) - (mobile ? 76 : 112)) : null
					}}>
						{this.renderBody(title, link)}
						{this.renderAttribution()}
					</div>
				</div>
			</div>
		);
	};
}

export default Post;
