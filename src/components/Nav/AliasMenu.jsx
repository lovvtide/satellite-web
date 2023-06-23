import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { Chevron } from '../CommonUI';

import { navigate, hoverAliasMenu, revokeDeviceAuth, viewSidePanel } from '../../actions';
import { COLORS  } from '../../constants';


class AliasMenu extends PureComponent {

	state = { hover: '', hoverNew: '' };

	componentDidMount = () => {
		this._click = window.addEventListener('hover', this.handleClick);
	};

	componentWillUnmount = () => {
		window.removeEventListener('click', this.handleClick);
	};

	handleClick = (e) => {
		e.stopPropagation();
		if (e.target.id !== 'alias_icon') {
			this.props.hoverAliasMenu(false);
		}
	};

	renderAliasLink = () => {

		if (!this.props.profile && !this.props.pubkey) { return null; }

		return (
			<Link to={`/@${nip19.npubEncode(this.props.pubkey)}`}>
				<div
					style={{ ...styles.link(this.state.hover === 'alias', true), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					onMouseOver={() => this.setState({ hover: 'alias' })}
					onMouseOut={() => this.setState({ hover: '' })}
				>
					<div style={{ display: 'flex', alignItems: 'center', color: this.state.hover === 'alias' ? '#fff' : COLORS.secondaryBright }}>
						View My Profile
					</div>
					<div style={{ height: 20, paddingRight: 4, display: 'flex', alignItems: 'center', float: 'right' }}>
						<Chevron
							style={{ color: this.state.hover === 'alias' ? '#fff' : null }}
							pointing='right'
							dimension={12}
							translate={0}
						/>
					</div>
				</div>
			</Link>
		);
	};

	renderPreferencesAction = () => {

		const { signedIn } = this.props;
		const text = 'Profile Settings';

		return signedIn ? (
			<div
				onClick={() => this.props.viewSidePanel('preferences')}
				onMouseOver={() => this.setState({ hover: text })}
				onMouseOut={() => this.setState({ hover: '' })}
			>
				<Icon style={styles.actionIcon(this.state.hover === text)} name='cog' />
				<div
					style={styles.link(text === this.state.hover)}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	renderSubscriptionsAction = () => {

		const { signedIn } = this.props;
		const text = 'Following List';

		return signedIn ? (
			<div
				onClick={() => this.props.viewSidePanel('subscriptions')}
				onMouseOver={() => this.setState({ hover: text })}
				onMouseOut={() => this.setState({ hover: '' })}
			>
				<Icon style={styles.actionIcon(this.state.hover === text)} name='check circle' />
				<div
					style={styles.link(text === this.state.hover)}
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
			<div
				onClick={() => this.props.viewSidePanel('dm')}
				onMouseOver={() => this.setState({ hover: text })}
				onMouseOut={() => this.setState({ hover: '' })}
			>
				<Icon style={styles.actionIcon(this.state.hover === text)} name='comment alternate' />
				<div
					style={styles.link(text === this.state.hover)}
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
			<div
				onClick={() => this.props.viewSidePanel('relays')}
				onMouseOver={() => this.setState({ hover: text })}
				onMouseOut={() => this.setState({ hover: '' })}
			>
				<Icon style={styles.actionIcon(this.state.hover === text)} name='bullseye' />
				<div
					style={styles.link(text === this.state.hover)}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	renderMediaAction = () => {

		const { signedIn } = this.props;
		const text = 'Media';

		return signedIn ? (
			<div
				onClick={() => this.props.viewSidePanel('media')}
				onMouseOver={() => this.setState({ hover: text })}
				onMouseOut={() => this.setState({ hover: '' })}
			>
				<Icon style={styles.actionIcon(this.state.hover === text)} name='camera' />
				<div
					style={styles.link(text === this.state.hover)}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	renderCommunitiesAction = () => {

		const { signedIn } = this.props;
		const text = 'Communities';

		return signedIn ? (
			<div
				onClick={() => this.props.viewSidePanel('communities')}
				onMouseOver={() => this.setState({ hover: text })}
				onMouseOut={() => this.setState({ hover: '' })}
			>
				<Icon style={styles.actionIcon(this.state.hover === text)} name='globe' />
				<div
					style={styles.link(text === this.state.hover)}
				>
					<span>{text}</span>
				</div>
			</div>
		) : null;
	};

	render = () => {

		const { signedIn } = this.props;

		return (
			<div
				style={styles.outerContainer}
				onMouseLeave={() => this.props.hoverAliasMenu(false)}
			>
				<div>
					<div style={styles.innerContainer}>
						<div style={styles.alias()}>
							{this.renderAliasLink()}
						</div>
						<div style={{ fontSize: 14, paddingTop: signedIn ? 12 : 0, paddingBottom: 12 }}>
							{this.renderPreferencesAction()}
							{this.renderSubscriptionsAction()}
							{this.renderMessagesAction()}
							{this.renderRelaysAction()}
							{this.renderMediaAction()}
							{this.renderCommunitiesAction()}
						</div>
					</div>
				</div>
			</div>
		);
	};
}

const mapState = ({ nostr }) => {
	return {
		signedIn: nostr.pubkey
	};
};

const styles = {
	innerContainer: {
		border: '1px solid #2f363d',
		color: '#fff',
		width: 250,
		background: COLORS.primary,
		borderTop: 'none'
	},
	outerContainer: {
		position: 'absolute',
		right: 36,
		top: 48
	},
	alias: (custodial) => {
		return {
			fontSize: 15,
			fontWeight: 'bold',
			paddingBottom: 0,
			borderBottom: '1px solid #2f363d'
		};
	},
	link: (hover, alias) => {
		return {
			borderLeft: hover ? '2px solid rgb(219, 170, 49)' : '2px solid rgba(0, 0, 0,0)',
			background: hover || alias ? 'rgba(255,255,255,0.025)' : 'transparent',
			padding: `${alias ? 12 : 6}px 12px ${alias ? 12 : 6}px 12px`,
			color: hover || alias ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)',
			marginBottom: 0,
			height: alias ? 44 : 33,
			fontSize: 13
		};
	},
	actionIcon: (hover) => {
		return {
			color: hover ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)',
			float: 'left',
			marginTop: 6,
			marginLeft: 11,
			marginRight: 6
		};
	}
};

export default connect(mapState, { navigate, hoverAliasMenu, revokeDeviceAuth, viewSidePanel })(AliasMenu);
