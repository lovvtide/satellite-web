import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import ApproveButton from './ApproveButton';
import Name from './Name';

import { COLORS } from '../../constants';
import { relativeTime } from '../../helpers';


class Post extends PureComponent {

	state = {};

	renderTitle = (title) => {

		return (
			<div
				style={{
					fontSize: 14,
					fontWeight: 'bold',
					marginBottom: 1
				}}
			>
				<Link
					to={`${this.props.base}/${nip19.noteEncode(this.props.event.id)}`}
				>
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
				</Link>
			</div>
		);
	};

	renderApproveAction = () => {

		if (this.props.approval || !this.props.moderator) { return null; }

		return (
			<ApproveButton
				onClick={this.props.handleApprove}
				onHoverState={hover => this.setState({ hover: hover ? 'title' : '' })}
			/>
		);

		// return (
		// 	<div
		// 		onClick={this.props.handleApprove}
		// 		style={{
		// 			color: COLORS.secondaryBright,
		// 			cursor: 'pointer',
		// 			marginLeft: 12,
		// 			fontSize: 12,
		// 			fontFamily: 'JetBrains-Mono-Bold',
		// 			textTransform: 'uppercase'
		// 		}}
		// 	>
		// 		[approve]
		// 	</div>
		// );
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
					{/*{npub.substring(0, 9) + '...' + npub.slice(-4)}*/}
				</span>
			</Link>
		);

		return (
			<div style={{
				color: COLORS.secondaryBright,
				fontSize: 13
			}}>
				Posted {relativeTime(this.props.event.created_at)} by {posterLink}
			</div>
		);
	};

	render = () => {

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
					marginBottom: 14
				}}
			>	
				<div style={{
					display: 'flex',
					justifyContent: 'space-between'
				}}>
					{this.renderTitle(title)}
					{this.renderApproveAction()}
				</div>
				{this.renderLink(link)}
				{this.renderAttribution()}
			</div>
		);
	};
}

export default Post;
