import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { DismissTransactionConfirmed } from '../../../actions';
import { COLORS, MENU_WIDTH } from '../../../constants';
import { timeFormat } from '../../../helpers';

import { X } from '../../CommonUI';
import Modal from './Modal';
//import Button from './Button';


class PaymentConfirmed extends Component {

	state = { gb_months: 1 };

	handleClose = () => {

		this.props.DismissTransactionConfirmed();
	};

	render = () => {

		const { clientWidth, clientHeight, mobile, initialized, description, paidAt, paidThrough, sats} = this.props;

		if (!initialized) { return null; }

		return (
			<Modal
        handleClose={this.handleClose}
        clientHeight={clientHeight}
        clientWidth={clientWidth}
        closeOnDimmerClick
        style={{
          border: `1px solid ${COLORS.secondary}`,
          background: COLORS.primary,
          width: mobile ? clientWidth - 24 : 380,
          padding: 24,
          fontSize: 12
        }}
        dimmerStyle={{
          left: 'unset',
          right: mobile ? 0 : MENU_WIDTH + 10,
          borderRight: `1px solid ${COLORS.secondary}`,
          zIndex: 9999999999,
					...(mobile ? {} : {
						height: clientHeight - 48,
						top: 48
					})
        }}
      >
				<div style={{
  				display: 'flex',
  				justifyContent: 'space-between',
  				alignItems: 'center'
				}}>
					<span>
						<Icon
							name='circle check'
							style={{ color: COLORS.green, marginRight: 6 }}
						/>
						<span style={{
							fontFamily: 'JetBrains-Mono-Regular',
							color: '#fff'
						}}>
							PAYMENT RECEIVED
						</span>
					</span>
					<X
						onClick={this.handleClose}
						dimension={18}
					/>
				</div>
				<div style={{
					fontFamily: 'JetBrains-Mono-Regular',
					marginBottom: 22,
					background: 'rgba(255,255,255,0.04)',
					padding: '8px 12px',
					marginTop: 18,
					textTransform: 'uppercase',
					color: COLORS.secondaryBright
				}}>
					<div>
						{description}
					</div>
					<div>
						<span>{timeFormat(paidAt)}</span>
					</div>
					<div>
						<span>{sats} SATS</span>
					</div>
				</div>
				{this.props.paidThrough ? (
					<div style={{
						color: 'rgab(255,255,255,0.85)',
						fontSize: 13,
						whiteSpace: 'break-spaces'
					}}>
						<span style={{ marginRight: 4 }}>
							At the current rate of usage, your account is now paid though
						</span>
						<span style={{ color: '#fff', fontWeight: 'bold' }}>
							{timeFormat(paidThrough)}
						</span>
					</div>
				) : null}
      </Modal>
		);
	};
}
const mapState = ({ media, app }) => {

	const { payment, receipt } = media.transactionConfirmed;

	let sats;

	for (let tag of payment.tags) {
		if (tag[0] === 'amount') {
			sats = parseInt(tag[1]) / 1000;
			break;
		}
	}

	return {
		paidThrough: media.paidThrough,
		initialized: media.initialized,
		description: receipt.content,
		paidAt: receipt.created_at,
		mobile: app.mobile,
		sats
	};
};

export default connect(mapState, { DismissTransactionConfirmed })(PaymentConfirmed);
