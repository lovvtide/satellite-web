import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import WelcomeContent from '../Nostr/WelcomeContent';
import CommunityList from '../Nostr/CommunityList';
import FrontPageFeed from '../Nostr/FrontPageFeed';
import PostFeed from '../Nostr/PostFeed';
import PublicationsNav from './PublicationsNav';
import ContentNav from './ContentNav';
import TopLevelLinks from './TopLevelLinks';
import EpochIndicator from './EpochIndicator';

import { transition } from '../../helpers';
import { COLORS, NAV_HEIGHT, CONTENT_MAX_WIDTH } from '../../constants';

import {
	setDirectoryLayoutExpanded,
	setDirectoryScrollPosition,
	setPubScrollState,
	setContentTop
} from '../../actions';


class DirectoryPage extends PureComponent {

	state = { listVisible: false, col1Width: null };

	constructor (props) {
		super(props);
		this.prog = React.createRef();
	}

	componentDidMount = () => {

		this.prog.current.style.width = '0%';

		window._expandToggle = this.handleExpandToggle;

		// Save refs to elements that need to react
		// to scroll events to improve performance
		this.mainNav = document.getElementById('main_nav');
		this.contentNav = document.getElementById('content_nav');
		this.col1 = document.getElementById('dir_col_1');
		this.col2 = document.getElementById('dir_col_2');
		this.col3 = document.getElementById('dir_col_3');

		// Scroll position at which info
		// should appear in content nav
		this.contentTop = null;

		// Add scroll listeners
		this.col3.addEventListener('scroll', this.handlePubScroll);

		// Init list state
		if (this.props.dirExpanded) {
			this.setState({ listVisible: true });
		}

		window.addEventListener('resize', this.handleResize);

		this.forceUpdate();
	};

	componentWillUnmount = () => {
		this.setScrollPosition(0);
		window._expandToggle = null;
		window.removeEventListener('resize', this.handleResize);
		this.col3.removeEventListener('scroll', this.handlePubScroll);
	};

	setProgressLine = (scrollTop) => {

		//console.log('set progress line');

		if (this.props.mobile) { return; }

		if (this.prog.current) {

			//console.log('A');

			this.scrollBottom = document.getElementById('pub_scroll_bottom');

			//console.log('scroll bottom', this.scrollBottom);

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

	handleExpandToggle = () => {

		window.dirExpandInProg = true;

		this.props.setDirectoryLayoutExpanded(!this.props.dirExpanded);

		if (this.props.dirExpanded) {
			this.props.setDirectoryScrollPosition(this.col2.scrollTop);
		}

		if (!this.contentNav) {
			this.contentNav = document.getElementById('content_nav');
		}

		if (!this.mainNav) {
			this.mainNav = document.getElementById('main_nav');
		}

		this.contentNav.style.transition = 'width 0.2s ease, margin 0.2s ease, top 0.2s ease';
		this.mainNav.style.transition = 'opacity 0.2s ease';
		this.setState({ listVisible: false });

		setTimeout(() => {

			if (this.props.dirExpanded) {
				this.mainNav.style.top = '0px';
				this.mainNav.style.opacity = '1';
				this.contentNav.style.top = `${NAV_HEIGHT}px`;
			} else {
				this.setScrollPosition(this.col3.scrollTop);
				this.setPubScrollState(this.col3.scrollTop);
			}

			setTimeout(() => {

				this.contentNav.style.transition = 'none';
				this.mainNav.style.transition = 'none';

				this.setState({ listVisible: true });

				if (this.props.dirExpanded) {
					this.setPubScrollState(this.col3.scrollTop);
					this.col2.scrollTop = this.props.dirScroll;
				}

				window.dirExpandInProg = false;
			}, 200);

		}, 1);
	};

	handlePubScroll = (e) => {
		const { scrollTop } = e.srcElement;
		this.setPubScrollState(scrollTop);
		this.setScrollPosition(scrollTop);
	};

	handleSelectPubItem = () => {
		this.col3.scrollTop = 0;
	};

	setPubScrollState = (scrollTop) => {
		const { contentTop, showNavMeta, dirExpanded } = this.props;
		if (contentTop === null) { // Need to calculate content top
			this.props.setContentTop(scrollTop);
		} else { // Content top known, set meta visibilty
			const y = contentTop - (NAV_HEIGHT * (dirExpanded ? 2 : 1));
			if (showNavMeta && scrollTop < y) {
				this.props.setPubScrollState(false);
			} else if (!showNavMeta && scrollTop >= y) {
				this.props.setPubScrollState(true);
			}
		}
	};

	setScrollPosition = (scrollTop) => {

		if (!this.props.dirExpanded) {

			const ratio = scrollTop / NAV_HEIGHT;

			if (!this.mainNav) {
				this.mainNav = document.getElementById('main_nav');
			}

			if (!this.mainNav) { return; }

			this.mainNav.style.top = `${-1 * scrollTop}px`;
			this.mainNav.style.opacity = ratio <= 1 ? (1 - ratio) : 0;

			if (!this.contentNav) {
				this.contentNav = document.getElementById('content_nav');
			}

			if (!this.contentNav) { return; }

			if (scrollTop < NAV_HEIGHT) {
				this.contentNav.style.position = 'absolute';
				this.contentNav.style.top = `${NAV_HEIGHT - scrollTop}px`;
			} else {
				this.contentNav.style.position = 'fixed';
				this.contentNav.style.top = '0px';
			}
		}

		this.setProgressLine(scrollTop);
	};


	render = () => {

		const { height, dirExpanded, awaitingData, showNavMeta, showContentNav, currentEpochOrdinal, contentWidth, clientWidth, mode } = this.props;

		return (
			<div style={styles.container(height, dirExpanded, clientWidth, contentWidth)}>
				<div style={{ opacity: showNavMeta ? 1 : 0, ...transition(0.2, 'ease', [ 'opacity' ]) }}>
					<div style={styles.progressLine(COLORS.secondary)} />
					<div ref={this.prog} style={styles.progressLine('#fff')} />
				</div>
				<PublicationsNav />
				{showContentNav ? <ContentNav toggleExpand={this.handleExpandToggle} /> : null}
				<div id='dir_col_1' className='no-scroll' style={styles.col1(dirExpanded, height, contentWidth)}>
					<EpochIndicator currentEpochOrdinal={currentEpochOrdinal} />
					<TopLevelLinks />
				</div>
				<div id='dir_col_2' className='no-scroll' style={{ ...styles.col2(dirExpanded, height, this.state.listVisible, contentWidth), scrollbarWidth: 'none' }}>
					{this.col2 && mode === 'following' ? <FrontPageFeed overflowContainer={this.col2} parentWidth={this.col2.contentWidth} visible={this.state.listVisible} onSelect={this.handleSelectPubItem} /> : null}
					{this.col2 && mode === 'featured' ? <CommunityList overflowContainer={this.col2} parentWidth={this.col2.contentWidth} visible={this.state.listVisible} /> : null}
				</div>
				<div id='dir_col_3' style={styles.col3(dirExpanded, height, awaitingData, contentWidth, clientWidth)}>
					{this.props.main ? (<Route exact path='/' component={WelcomeContent} />) : null}
					{this.props.main ? (<Route path='/thread' component={PostFeed} />) : null}
				</div>
			</div>
		);
	};
}

const mapState = ({ app, nostr }) => {

	const showContentNav = app.route === '/' || app.routeComponents[0] === 'thread';

	return {
		contentTop: app.contentTop,
		showNavMeta: app.showNavMeta,
		currentEpochOrdinal: 1, // TODO DEV ONLY this is hardcoded
		main: nostr.main,
		mode: nostr.mode,
		dirExpanded: app.dirExpanded,
		dirScroll: app.dirScroll,
		height: app.minHeight,
		mobile: app.mobile,
		contentWidth: Math.min(app.clientWidth, CONTENT_MAX_WIDTH),
		clientWidth: app.clientWidth,
		showContentNav
	};
};

const styles = {

	container: (height, expanded, clientWidth, contentWidth) => {
		const margin = Math.max(0, (clientWidth - contentWidth) / 2);
		return {
			height,
	    marginRight: expanded ? margin : 0,
	    marginLeft: expanded ? margin : 0,
	    maxWidth: CONTENT_MAX_WIDTH,
	    display: 'flex',
		};
	},

	col1: (expanded, height, contentWidth) => {
		return {

			height: 'fit-content',
			zIndex: 1,
			width: expanded ? contentWidth * 0.15 : '0px',
			float: 'left',
			opacity: expanded ? 1 : 0,
			overflowY: 'hidden',
			...transition(0.2, 'ease', [ 'width', 'opacity' ])
		};
	},

	col2: (expanded, height, visible, contentWidth) => {
		return {
			position: 'absolute',
			width: contentWidth * 0.5,
			paddingLeft: contentWidth * 0.15,
			height,
			transform: expanded ? 'none' : `translate(-${contentWidth * 0.35}px)`,
			float: 'left',
			opacity: expanded && visible ? 1 : 0,
			overflowY: 'scroll',
			paddingTop: 60,
			...(!expanded ? {} : transition(0.2, 'ease', [ 'width', 'opacity' ]))
		};
	},

	col3: (expanded, height, awaitingData, contentWidth, clientWidth) => {

		const mod = (clientWidth > contentWidth ? ((clientWidth - contentWidth) / 2) : 0);

		const props = {
			height,
			position: 'absolute',
			overflowY: 'scroll',
			flex: 'none',
			...transition(0.2, 'ease', [ 'left', 'padding', 'width' ]),
			left: !expanded ? 0 : (contentWidth * 0.5) + mod,
			width: !expanded ? contentWidth + (2 * mod) : (contentWidth * 0.5) + mod,
			paddingLeft: !expanded ? (contentWidth * 0.25) + mod : 0,
			paddingRight: !expanded ? (contentWidth * 0.25) + mod : 0 + mod,
		};

		return props;
	},

	progressLine: (color) => {
		return {
			width: '100%',
			borderTop: `1px solid ${color}`,
			position: 'fixed',
			zIndex: 99999999,
			top: 0,
			left: 0
		};
	}
};

export default connect(mapState, { setDirectoryLayoutExpanded, setDirectoryScrollPosition, setContentTop, setPubScrollState })(DirectoryPage);
