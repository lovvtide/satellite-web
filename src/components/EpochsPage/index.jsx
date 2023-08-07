import React, { Component } from 'react';
import { connect } from 'react-redux';

import EpochIndicator from '../DirectoryPage/EpochIndicator';
import ToolTip from '../common/ToolTip';
import Phase from './Phase';

import { getLastNewMoon, getNextNewMoon } from '../../modules/Moon';
import { COLORS, NAV_HEIGHT } from '../../constants';


// TODO handle empty values returned by countdown . . . ie show "pending"

class HistoryPage extends Component {

	state = { epochPercentProgress: null, epochSecondsRemaining: null, epochs: [], hover: '' };

	constructor (props) {

		super(props);

		this.col2 = React.createRef();
		this.header = React.createRef();
	}

	componentDidMount = async () => {

		window.addEventListener('scroll', this.handleScroll);

		// Initilalize epoch countdown
		this.handleCountdown();

		this._handleCountdown = setInterval(this.handleCountdown, 1000);
	};

	componentWillUnmount = () => {

		window.removeEventListener('scroll', this.handleScroll);

		clearInterval(this._handleCountdown);
	};

	handleCountdown = () => {

		const now = Math.floor(Date.now() / 1000);
		const elapsed = now - this.props.epochStart;
		const interval = (this.props.epochClose - this.props.epochStart);

		this.setState({
			epochPercentProgress: Math.floor((elapsed / interval) * 100),
			epochSecondsRemaining: this.props.epochClose - now
		});
	};

	handleScroll = (e) => {

		if (this.props.mobile) { return; }

		if (window.scrollY >= NAV_HEIGHT + 98) {

			if (!this.headerFixed) {

				this.headerFixed = true;
				this.header.current.style.position = 'fixed';
				this.header.current.style.top = `-98px`;
			}

		} else {

			if (this.headerFixed) {

				this.headerFixed = false;
				this.header.current.style.position = 'inherit';
				this.header.current.style.top = 'auto';
			}
		}

	};

	renderHeaderRow = () => {

		return (
			<div style={{ height: 48, width: '100%', display: 'flex', boxShadow: `0 0 16px 12px ${COLORS.primary}` }}>
				<div style={{ ...styles.headerRowItem('15%'), color: COLORS.secondaryBright, borderTop: 'none' }}>
					PREVIOUS EPOCHS
				</div>
				<div style={styles.headerRowItem('25%')}>
					SIGNED BY
					<ToolTip
						iconStyle={styles.tooltip}
						position='top center'
						text={`TODO`}
					/>
				</div>
				<div style={styles.headerRowItem('25%')}>
					PROOF
					<ToolTip
						iconStyle={styles.tooltip}
						position='top center'
						text={`TODO`}
					/>
				</div>
				<div style={styles.headerRowItem('25%')}>
					ARCHIVE
					<ToolTip
						iconStyle={styles.tooltip}
						position='top center'
						text={`TODO`}
					/>
				</div>
				<div style={styles.headerRowItem('10%')}>
					SIZE
					<ToolTip
						iconStyle={styles.tooltip}
						position='top center'
						text={`TODO`}
					/>
				</div>
			</div>
		);
	};

	renderMobileListHeader = () => {
		return (
			<div style={{ display: 'flex', justifyContent: 'left' }}>
				<div
					style={{
						...styles.rowItem(null),
						paddingLeft: 16,
						minWidth: 146,
						fontFamily: 'JetBrains-Mono-Bold',
						color: COLORS.satelliteGold
					}}
				>
					PREVIOUS EPOCHS
				</div>
				<div style={{
					...styles.rowItem('100%'),
					fontFamily: 'JetBrains-Mono-Bold',
					color: COLORS.satelliteGold,
					paddingLeft: 12,
					paddingRight: 16,
					//justifyContent: 'space-between'
				}}>
					PROOF
					<ToolTip
						iconStyle={{ ...styles.tooltip, fontSize: 14, marginTop: -2 }}
						position='bottom center'
						text={`TODO`}
					/>
				</div>
			</div>
		);
	};

	renderMobileList = () => {

		if (this.props.epochs.length === 0) {

			return null;
		}

		return null;
	};

	renderList = () => {

		if (this.props.epochs.length === 0) {

			return null;
		}

		return null;
	};

	render = () => {

		const { epochPercentProgress, epochSecondsRemaining } = this.state;
		const { currentEpochOrdinal, mobile } = this.props;

		return mobile ? ( // Mobile layout
			<div>
				<div style={{ height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					{epochPercentProgress !== null ? (
						<Phase
							height={48}
							progress={epochPercentProgress / 100}
							width={this.props.width - 16}
						/>
					) : null}
				</div>
				<EpochIndicator
					currentEpochOrdinal={currentEpochOrdinal}
					secondsRemaining={epochSecondsRemaining}
					percentProgress={epochPercentProgress}
					inlineMobile
				/>
				{this.renderMobileListHeader()}
				{this.renderMobileList()}
			</div>
		) : ( // Regular layout
			<div style={{ color: '#fff' }}>
				<div style={styles.margin({ foreground: this.state.hover, height: Math.max((this.props.epochs.length * 48) + 48, this.props.height - 98) })} />
				<div ref={this.header} style={{ height: 146, zIndex: 9999, background: COLORS.primary }}>
					<div style={styles.col1({ height: 97 })}>
						{epochPercentProgress !== null ? (
							<EpochIndicator
								currentEpochOrdinal={currentEpochOrdinal}
								secondsRemaining={epochSecondsRemaining}
								percentProgress={epochPercentProgress}
								active
							/>
						) : null}
					</div>
					<div ref={this.col2} style={styles.col2({ height: 97 })}>
						<div style={styles.phaseContainer}>
							{epochPercentProgress !== null && this.col2.current ? (
								<Phase
									height={46}
									progress={epochPercentProgress / 100}
									width={this.col2.current.clientWidth + (this.col2.current.clientWidth * 0.05)}
								/>
							) : null}
						</div>
					</div>
					{/*{this.renderHeaderRow()}*/}
				</div>
				<div style={{ position: 'absolute', top: NAV_HEIGHT + 146, width: '100%' }}>
					{this.renderList()}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginLeft: '15%',
						height: this.props.clientHeight,
						transform: 'translate(0px, -146px)'
					}}>
						Coming Soon!
					</div>
				</div>
			</div>
		);
	};
}

const mapState = ({ app }) => {

	return {
		
		clientHeight: app.clientHeight,
		width: app.clientWidth,
		height: app.minHeight,
		mobile: app.mobile,
		currentEpochOrdinal: 1, // TODO
		epochs: /*world.history*/[],
		epochStart: getLastNewMoon(),
		epochClose: getNextNewMoon()
	};
};

const styles = {

	col1: ({ height }) => {
		return {
			height,
			width: '15%',
			float: 'left'
		};
	},

	col2: ({ height }) => {
		return {
			height,
			paddingTop: 5,
			width: '85%',
			float: 'right',
			borderLeft: `1px solid ${COLORS.secondary}`
		};
	},

	headerRowItem: (width) => {
		return {
			width,
			overflow: 'hidden',
			height: 48,
			fontSize: 12,
			display: 'flex',
			alignItems: 'center',
			paddingLeft: 24,
			whiteSpace: 'nowrap',
			color: COLORS.satelliteGold,
			fontFamily: 'JetBrains-Mono-Bold',
		};
	},

	rowItem: (width) => {
		return {
			width,
			overflow: 'hidden',
			height: 48,
			fontSize: 12,
			display: 'flex',
			alignItems: 'center',
			paddingLeft: 24,
			whiteSpace: 'nowrap',
			color: '#fff',
			fontFamily: 'JetBrains-Mono-Regular',
		};
	},

	row: ({ hover }) => {
		return {
			display: 'flex',
			background: hover ? 'rgba(31, 32, 33, 0.8)' : null
		};
	},

	phaseContainer: {
		height: 97,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},

	tooltip: {
		marginLeft: 8,
		marginRight: 0,
		height: 20,
		color: COLORS.secondaryBright
	},

	margin: ({ height, foreground }) => {
		return {
			height,
			zIndex: foreground ? 99999 : null,
			position: 'absolute',
			width: '15%',
			borderRight: `1px solid ${COLORS.secondary}`,
			top: 146,
			pointerEvents: 'none',
			transform: 'translate(1px)'			
		}
	}

};

export default connect(mapState)(HistoryPage);
