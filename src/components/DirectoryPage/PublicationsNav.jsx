import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { transition } from '../../helpers';
import { COLORS, NAV_HEIGHT, CONTENT_MAX_WIDTH } from '../../constants';
import { setFrontpageMode, queryProfiles, navigate } from '../../actions';
import svgearth from '../../assets/earth.svg';
import svgfollowing from '../../assets/following_circles.svg';
import svgsearch from '../../assets/search.svg';

import ProfileQuery from '../Nostr/ProfileQuery';


class PublicationsNav extends PureComponent {

	state = { hover: '' };

	componentDidMount = () => {

		if (this.props.mobile) {
			this.container = document.getElementById('publications_nav');
			window.addEventListener('scroll', this.onMobileScroll);
		}
	};

	componenetWillUnmount = () => {

		if (this.props.mobile) {
			window.removeEventListener('scroll', this.onMobileScroll);
		}

		this.props.queryProfiles(null);

		clearTimeout(this._searchProfiles);
	};

	onMobileScroll = () => {

		const { scrollTop } = document.documentElement;

		if (scrollTop < NAV_HEIGHT) {
			this.container.style.position = 'absolute';
			this.container.style.top = `${NAV_HEIGHT}px`;
		} else {
			this.container.style.position = 'fixed';
			this.container.style.top = '0px';
		}
	};

	handleSearchActive = () => {

		this.props.queryProfiles({ term: '', context: 'frontpage' });

		setTimeout(() => {

			const input = document.getElementById('_front_page_search_input');

			if (input) {

				input.focus();
			}

		}, 200);
	};

	handleSearchChange = (e) => {

		clearTimeout(this._searchProfiles);

		this._searchProfiles = setTimeout(() => { // debounce

			this.props.queryProfiles({
				term: e.target.value,
				context: 'frontpage'
			});

		}, 100);

	};

	handleSearchCancel = () => {

		clearTimeout(this._searchProfiles);
		this.props.queryProfiles(null);
	};

	handleSearchSelect = (item) => {

		this.props.queryProfiles(null);
		this.props.navigate(`/@${item.npub}`);
	};

	renderSearch = () => {

		if (this.props.searchActive === 'frontpage') { // Search form

			return (
				<div style={{
					width: '100%'
				}}>
					<div style={{
						display: 'flex',
						alignItems: 'center',
						width:  '100%',
						paddingRight: 18,
						paddingLeft: 18
					}}>
						<input
							id='_front_page_search_input'
							placeholder='Find user by name or npub . . .'
							onChange={this.handleSearchChange}
							//value={this.props.searchTerm}
							style={{
								width: '100%',
								outline: 'none',
								border: 'none',
								background: COLORS.primary,
								fontSize: 14,
								fontFamily: 'Lexend-Deca-Regular',
								color: '#fff',
								paddingRight: 24
							}}
						/>
						<div
							onClick={this.handleSearchCancel}
							onMouseOver={() => this.setState({ hover: 'cancelsearch' })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								fontSize: 13,
								cursor: 'pointer',
								fontFamily: 'JetBrains-Mono-Regular',
								color: this.state.hover === 'cancelsearch' ? '#fff' : COLORS.secondaryBright,
								...transition(0.2, 'ease', [ 'opacity' ])
							}}
						>
							CANCEL
						</div>
					</div>
					<ProfileQuery
						preventScroll={this.props.mobile}
						handleSelect={this.handleSearchSelect}
						maxResults={this.props.mobile ? 9 : 12}
						style={{
							position: 'absolute',
							paddingLeft: 10,
							paddingRight: 10,
							paddingBottom: 10,
							paddingTop: 10,
							background: COLORS.primary,
							width: this.props.mobile ? '100%' : this.props.contentWidth * 0.35
						}}
					/>
				</div>
			);
		}

		return ( // Toggle search
			<div
				onClick={this.handleSearchActive}
				onMouseOver={() => this.setState({ hover: 'search' })}
				onMouseOut={() => this.setState({ hover: '' })}
				style={styles.action(false, this.state.hover === 'search', '#fff', this.props.mobile)}
			>
				<img
					src={svgsearch}
					style={{
						marginRight: 5,
						height: 21,
						width: 21
					}}
				/>
				<span style={{ transform: 'translate(0px, 1px)' }}>
					SEARCH
				</span>
			</div>
		);
	};

	renderActions = () => {

		if (this.props.searchActive === 'frontpage') { return null; }

		const modes = [
			{ label: 'COMMUNITIES', key: 'featured', color: '#fff', icon: svgearth, height: 18 },
			{ label: 'FOLLOWING', key: 'following', color: '#fff', icon: /*svgstar*/svgfollowing, height: /*20*/33, marginRight: 6 }
		];

		return this.props.dirExpanded ? modes.map((mode, i) => {
			return (
				<div
					key={mode.key}
					onMouseOver={() => this.setState({ hover: mode.key })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={() => this.props.setFrontpageMode(mode.key)}
					style={styles.action(mode.key === this.props.mode || (mode.key === 'following' && this.props.pendingContacts), mode.key === this.state.hover, mode.color, this.props.mobile)}
				>
					<img
						src={mode.icon}
						style={{
							marginRight: mode.marginRight || 8,
							height: mode.height,
							width: mode.height
						}}
					/>
					<span style={{ height: 18 }}>{mode.label}</span>
				</div>
			);
		}) : null;
	};

	render = () => {
		return (
			<div id='publications_nav' style={styles.container(this.props.dirExpanded, this.props.mobile, this.props.contentWidth, this.props.searchActive)}>
				{this.renderActions()}
				{this.renderSearch()}
				<div style={styles.divider} />
			</div>
		);
	};
}

const mapState = ({ app, nostr, query }) => {
	return {
		mode: nostr.mode,
		dirExpanded: app.dirExpanded,
		mobile: app.mobile,
		pendingContacts: nostr.pendingContacts,
		contentWidth: Math.min(app.clientWidth, CONTENT_MAX_WIDTH),
		searchActive: query.active
	};
};

const styles = {
	container: (expanded, mobile, contentWidth, searchActive) => {
		return {
			display: 'flex',
			justifyContent: mobile ? 'space-evenly' : 'left',
			alignItems: 'left',
			background: COLORS.primary,
			position: 'absolute',
			top: NAV_HEIGHT,
			width: mobile ? '100%' : (expanded ? contentWidth * 0.35 : '0px'),
			marginLeft: mobile ? 0 : (expanded ? contentWidth * 0.15 : '0px'),
			paddingLeft: mobile || searchActive ? 0 : 18,
			height: NAV_HEIGHT,
			color: '#2f363d',
			zIndex: expanded ? 1 : -1,
			userSelect: expanded ? 'auto' : 'none',
			opacity: expanded ? 1 : 0,
			boxShadow: 'rgb(23 24 25) 24px 0px 16px 12px',
			...transition(0.2, 'ease', [ 'margin', 'width', 'opacity', 'border-color' ])
		}
	},
	action: (selected, hovered, activeColor, mobile) => {
		return {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: selected ? activeColor : '#fff',
			opacity: selected ? 1 : (hovered ? 0.85 : 0.5),
			height: NAV_HEIGHT,
			fontSize: 12,
			cursor: 'pointer',
			userSelect: 'none',
			whiteSpace: 'nowrap',
			marginRight: mobile ? 0 : 24,
			fontFamily: 'JetBrains-Mono-Bold',
			...transition(0.2, 'ease', [ 'color' ])
		};
	},
	divider: {
		width: '100%',
		position: 'absolute',
		top: NAV_HEIGHT
	}
};

export default connect(mapState, { /*normalizePublicationList*/setFrontpageMode, queryProfiles, navigate })(PublicationsNav);
