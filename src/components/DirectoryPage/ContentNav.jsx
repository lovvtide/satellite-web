import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { nip19 } from 'nostr-tools';

import RelativeTime from '../common/RelativeTime';
import { Chevron } from '../CommonUI';

import { transition } from '../../helpers';
import { setPubScrollState, setContentTop, navigate } from '../../actions';
import { COLORS, NAV_HEIGHT, CONTENT_MAX_WIDTH } from '../../constants';


class ContentNav extends PureComponent {

	state = { hoverToggle: false, mounted: false, list_n: 0 };

	constructor (props) {
		super(props);
		this.prog = React.createRef();
	}

	componentDidMount = () => {

		if (this.props.mobile) {
			this.container = document.getElementById('content_nav');
			window.addEventListener('scroll', this.onMobileScroll);
		}

		this.enableTransition = setTimeout(() => { this.setState({ mounted: true }); }, 200);

		if (this.props.rootItem && this.props.rootItem.list_n !== this.state.list_n) {

			this.setState({ list_n: this.props.rootItem.list_n });
		}

		this._update = setInterval(() => {

			if (this.props.rootItem && this.props.rootItem.list_n !== this.state.list_n) {

				this.setState({ list_n: this.props.rootItem.list_n });
			}

		}, 250);
	};

	componenetWillUnmount = () => {

		if (this.props.mobile) {
			window.removeEventListener('scroll', this.onMobileScroll);
		}

		clearTimeout(this.enableTransition);
		clearInterval(this._update);
	};

	onMobileScroll = (reset) => {

		if (!this.container) { return; }

		const { contentTop, showNavMeta } = this.props;
		const { scrollTop } = document.documentElement;

		if (scrollTop < NAV_HEIGHT) {
			this.container.style.position = 'absolute';
			this.container.style.top = `${NAV_HEIGHT}px`;
		} else {
			this.container.style.position = 'fixed';
			this.container.style.top = '0px';
		}

		if (contentTop === null) { // Need to calculate content top
			this.props.setContentTop(scrollTop);
		} else { // Content top known, set meta visibilty
			const y = contentTop - NAV_HEIGHT;
			if (showNavMeta && scrollTop < y) {
				this.props.setPubScrollState(false);
			} else if (!showNavMeta && scrollTop >= y) {
				this.props.setPubScrollState(true);
			}
		}

		this.setProgressLine(scrollTop);
	};

	setProgressLine = (scrollTop) => {

		if (this.prog.current) {

			if (!this.scrollBottom) {
				this.scrollBottom = document.getElementById('pub_scroll_bottom');
			}

			if (this.scrollBottom) {

				const bounds = this.scrollBottom.getBoundingClientRect();
				const remaining = bounds.y - (this.props.height + 48);

				let ratio = 1;

				if (remaining > 0) {

					ratio = 1 - (remaining / (remaining + scrollTop));
				}

				this.prog.current.style.width = `${ratio * 100}%`;
			}
		}
	};

	handleShare = () => {

		try {

			// TODO

			// const data = {};

			// data.text = ''
			// data.title = '';
			// data.url = window.location.href;

			// window.navigator.share(data);

		} catch (err) {

			alert(err);
		}
	};

	renderProgressLine = () => {

		const { showNavMeta, mobile } = this.props;

		return mobile ? (
			<div style={{ opacity: showNavMeta ? 1 : 0, ...transition(0.2, 'ease', [ 'opacity' ]) }}>
				<div style={styles.progressLine(COLORS.secondary)} />
				<div ref={this.prog} style={styles.progressLine('#fff')} />
			</div>
		) : null;
	};

	render = () => {

		const { dirExpanded, showNavMeta, mobile, rootItem } = this.props;
		const contentNavAction = this.props.mobile ? null : (
			<div
				style={styles.toggle(this.state.hoverToggle, dirExpanded)}
				onMouseOver={() => this.setState({ hoverToggle: true })}
				onMouseOut={() => this.setState({ hoverToggle: false })}
				onClick={this.props.toggleExpand || null}
			>
				<Chevron
					translate={-3}
					pointing={dirExpanded ? 'left' : 'right'}
					style={{ color: this.state.hoverToggle ? '#fff' : 'rgba(255,255,255,0.85)' }}
				/>
			</div>
		);

		let contentNavElements = null;

		if (this.props.route === '/') {

			contentNavElements = (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					fontSize: 12,
					color: COLORS.satelliteGold,
					fontFamily: 'JetBrains-Mono-Bold',
					transform: 'translate(0px, 1px)'
				}}>
					WELCOME NOSTRICHES
				</div>
			);

		} else {

			if (rootItem && !rootItem.phantom) {

				const author = rootItem.author || {};
				let name = author.display_name || author.name;

				if (!name) {

					const encoded = nip19.npubEncode(rootItem.event.pubkey);
					name = encoded.slice(0, 8) + '...' + encoded.slice(-4);
				}

				contentNavElements = (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							fontSize: 13
						}}
					>
						<span style={{
							fontWeight: 'bold',
							color: COLORS.satelliteGold
						}}>
							{name}
						</span>
						<span style={{ color: COLORS.secondaryBright, marginLeft: 12, marginRight: 12, transform: 'translate(0px, -1px)', fontSize: 17 }}>/</span>
						<span style={{
							color: '#fff'
						}}>
							<RelativeTime time={rootItem.event.created_at} />
						</span>
						<span style={{ color: COLORS.secondaryBright, marginLeft: 12, marginRight: 12, transform: 'translate(0px, -1px)', fontSize: 17 }}>/</span>
						{this.props.rootItem.list_n > 0 ? (
							<span style={{
								color: '#fff'
							}}>
								{this.props.rootItem.list_n} {this.props.rootItem.list_n > 1 ? 'replies' : 'reply'}
							</span>
						) : null}
					</div>
				);
			}
		}

		return (
			<div id='content_nav' style={styles.container(dirExpanded, mobile, showNavMeta, this.state.mounted, this.props.contentWidth, this.props.clientWidth)}>
				{this.renderProgressLine()}
				{contentNavAction}
				{contentNavElements}
			</div>
		);
	};
}

const mapState = ({ app, nostr }) => {

	return {
		contentTop: app.contentTop,
		showNavMeta: app.showNavMeta,
		rootItem: nostr.rootItem,
		rootAuthor: nostr.rootAuthor,
		dirExpanded: app.dirExpanded,
		height: app.minHeight,
		mobile: app.mobile,
		contentWidth: Math.min(app.clientWidth, CONTENT_MAX_WIDTH),
		clientWidth: app.clientWidth,
		route: app.route
	};
};

const styles = {
	container: (expanded, mobile, showMeta, mounted, contentWidth, clientWidth) => {
		return {
			pointerEvents: /*showMeta*/true ? 'auto' : 'none',
			background: `rgba(23, 24, 25,${mobile ? (/*showMeta*/true ? 1 : 0) : 1})`,
			boxShadow: /*showMeta*/true ? `${mobile ? 0 : 24}px 0 16px 12px ${COLORS.primary}` : 'none',
			position: 'absolute',
			top: NAV_HEIGHT,
			width: mobile ? '100%' : (expanded ? contentWidth * 0.5 : '100%'),
			marginLeft: mobile ? '0px' : (expanded ? contentWidth * 0.5 : /*(Math.min(0, (contentWidth - clientWidth) / 2))*/0),
			height: NAV_HEIGHT,
			color: '#fff',
			zIndex: 1,
			display: 'flex',
			alignItems: 'center',
			padding: mobile ? '0px 4px' : '0px 12px',
			...(mounted ? transition(0.2, 'ease', [ 'background', 'opacity', 'box-shadow' ]) : {})
		}
	},

	toggle: (hover, expanded, mounted) => {
		return {
			height: 24,
			width: 24,
			fontSize: 18,
			paddingTop: 6,
			marginRight: 12,
			paddingRight: 8,
			marginLeft: expanded ? 4 : 12,
			float: 'left',
			cursor: 'pointer',
			pointerEvents: 'auto',
			color: hover ? '#fff' : 'rgba(255,255,255,0.85)',
			...transition(0.2, 'ease', [ 'margin' ])
		};
	},

	progressLine: (color) => {
		return {
			width: '100%',
			borderTop: `1px solid ${color}`,
			position: 'fixed',
			top: 0,
			left: 0
		};
	}
};

export default connect(mapState, { setPubScrollState, setContentTop, navigate })(ContentNav);
