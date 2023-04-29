import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import PrettySVG from '../common/PrettySVG';

import svghourglass from '../../assets/hourglass.svg';

import { COLORS } from '../../constants';
import { transition, countdownFormat, formatOrdinal } from '../../helpers';


class EpochIndicator extends PureComponent {

	state = { hover: false };

	render = () => {

		if (this.props.inlineMobile) {
			return (
				<div style={styles.mobileContainer}>
					<div style={styles.inlineItem}>
						{formatOrdinal(this.props.currentEpochOrdinal, { uppercase: true })} EPOCH
					</div>
					<div style={styles.mobileItem}>
						<span style={{ marginRight: 8 }}>LUNAR CYCLE</span>
						<span>{this.props.percentProgress}%</span>
					</div>
					<div style={styles.mobileItem}>
						CLOSE {countdownFormat(this.props.secondsRemaining)}
					</div>
				</div>
			);
		}

		return (
			<Link to={'/epochs'}>
				<div
					onMouseOver={() => this.setState({ hover: true })}
					onMouseOut={() => this.setState({ hover: false })}
					style={styles.container(this.state, this.props)}
				>
					<div style={{ width: '100%' }}>
						<div style={{ ...styles.row, height: 14, alignItems: null, lineHeight: '12px' }}>
							<PrettySVG style={{ marginRight: 7, marginTop: -2 }} src={svghourglass} height={15} width={15} />
							<span style={{ marginRight: 8 }}>
								{formatOrdinal(this.props.currentEpochOrdinal, { uppercase: true })} EPOCH
							</span>
						</div>
						{this.props.active ? (<div style={{ ...styles.row, marginTop: 12.5, marginBottom: 12.5 }}>
							<span style={{ marginRight: 8 }}>LUNAR PHASE</span>
							<span>{this.props.percentProgress}%</span>
						</div>) : null}
						{this.props.active ? (<div style={styles.row}>
							<span>
								CLOSE {countdownFormat(this.props.secondsRemaining)}
							</span>
						</div>) : null}
					</div>
				</div>
			</Link>
		);
	};
}

const mapState = () => {
	return {};
};

const styles = {

	container: ({ hover }, { active }) => {
		return {
			userSelect: 'none',
			cursor: active ? 'default' : 'pointer',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			height: active ? 98 : 49,
			color: '#fff',
			fontSize: 12,
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'column',
			justifyContent: 'space-around',
			fontFamily: 'JetBrains-Mono-Bold',
			paddingTop: 0,
			paddingBottom: 0,
			paddingLeft: 24,
			paddingRight: 24,
			//borderBottom: `1px solid ${COLORS.secondary}`,
			opacity: hover || active ? 1 : 0.9,
			//background: hover || active ? 'rgba(31,32,33,0.8)' : 'transparent',
			...transition(0.2, 'ease', [ 'height' ])
		};
	},

	mobileContainer: {
		userSelect: 'none',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		color: '#fff',
		fontSize: 11,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',
		fontFamily: 'JetBrains-Mono-Bold',
		paddingBottom: 16,
		borderBottom: `1px solid ${COLORS.secondary}`
	},

	row: {
		display: 'flex',
		height: 12,
		width: '100%',
		alignItems: 'center'
	},

	inlineItem: {
		//width: '33%'
	}
};

export default connect(mapState)(EpochIndicator);
