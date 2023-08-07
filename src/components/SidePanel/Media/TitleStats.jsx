import React, { Component } from 'react';
import { connect } from 'react-redux';

import Button from './Button';

import { transition, formatDataSize, intervalTime } from '../../../helpers';
import { SetAddCreditModalOpen } from '../../../actions';
import { COLORS } from '../../../constants';


class TitleStats extends Component {

	render = () => {

		if (this.props.mobileMenuOpen) { return null; }

		return (
			<div style={{
				opacity: this.props.initialized ? 1 : 0,
				pointerEvents: this.props.initialized ? 'auto' : 'none',
				color: COLORS.secondaryBright,
				fontFamily: 'JetBrains-Mono-Regular',
				fontSize: 11,
				textTransform: 'uppercase',
				display: 'flex',
				alignItems: 'center',
				fontWeight: 'normal',
				...transition(0.2, 'ease', [ 'opacity' ]),
				...(this.props.style || {})
			}}>
				<span style={{ marginRight: 8, color: COLORS.satelliteGold }}>{formatDataSize(this.props.storageTotal)} hosted</span>
				{/*<span style={{ marginRight: 8, color: '#fff' }}>({intervalTime(this.props.timeRemaining, { round: true })} remaining)</span>*/}
	      <Button
	      	style={{ padding: 8 }}
	        label='ADD CREDIT'
	        onClick={() => this.props.SetAddCreditModalOpen(true)}
	      />
			</div>
		);
	};
}

const mapState = ({ media, menu }) => {

	return {
		timeRemaining: media.timeRemaining,
		storageTotal: media.storageTotal,
		creditTotal: media.creditTotal,
		usageTotal: media.usageTotal,
		initialized: media.initialized,
		mobileMenuOpen: menu.mobileMenuOpen
	};
};

export default connect(mapState, { SetAddCreditModalOpen })(TitleStats);
