import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Button from './Button';

import { SetAddCreditModalOpen } from '../../../actions';
import { COLORS } from '../../../constants';


class TitleStats extends PureComponent {

	render = () => {
		return (
			<div style={{
				color: COLORS.secondaryBright,
				fontFamily: 'JetBrains-Mono-Regular',
				fontSize: 11,
				textTransform: 'uppercase',
				display: 'flex',
				alignItems: 'center',
				fontWeight: 'normal',
				...(this.props.style || {})
			}}>
				<span style={{ marginRight: 8, color: COLORS.satelliteGold }}>4.2 GB</span>
				<span style={{ marginRight: 8, color: '#fff' }}>(10 months)</span>
	      <Button
	      	style={{ padding: 8 }}
	        label='ADD CREDIT'
	        onClick={() => this.props.SetAddCreditModalOpen(true)}
	      />
			</div>
		);
	};
}

export default connect(null, { SetAddCreditModalOpen })(TitleStats);
