import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import QRCode from 'react-qr-code';

import { SetAddCreditModalOpen, RequestCredit, GetMedia, payWithLightningWallet } from '../../../actions';
import { formatCurrency, formatDataSize, intervalTime, timeFormat } from '../../../helpers';
import { COLORS, MENU_WIDTH } from '../../../constants';

import Modal from './Modal';
import Button from './Button';
import { Chevron, X, CanonicalValue } from '../../CommonUI';


class AddCredit extends PureComponent {

	state = { gb_months: 1 };

	componentDidMount = () => {

		this.props.GetMedia();

		this.setState({
			gb_months: this.props.storageTotal ? Math.ceil(6 * (this.props.storageTotal / 1000000000)) : 1
		});
	};

	handleClose = () => {

		this.props.SetAddCreditModalOpen(false);

		if (this.props.invoice) {

			this.props.GetMedia();
		}
	};

	handleRequestInvoice = () => {

		this.props.RequestCredit({
			gb_months: this.state.gb_months
		});

	};

	handleIncrement = (inc) => {

		console.log('handleIncrement', inc);

		const newValue = this.state.gb_months + inc;

		this.setState({
			gb_months: newValue > 0 ? newValue : 1
		});
	};

  handlePayWithLightningWallet = async () => {

  	if (!this.props.invoice) { return; }

  	try {

  		await payWithLightningWallet({
  			invoice: this.props.invoice
  		});

  	} catch (err) {

  		console.log(err);
  	}
  };

	renderForm = () => {

		if (this.props.invoice) { return null; }

		const costUsd = this.props.rateFiat.usd * this.state.gb_months;
		const costSats = Math.ceil(costUsd * this.props.exchangeFiat.usd);

		return (
			<div>
	      {this.props.storageTotal ? (<div style={{
	      	fontFamily: 'JetBrains-Mono-Regular',
	      	marginBottom: 16,
	      	background: 'rgba(255,255,255,0.04)',
	      	padding: '8px 12px',
	      	textTransform: 'uppercase'
	      }}>
	    		<div style={{ color: COLORS.secondaryBright }}>
	    			<div>PAID THROUGH {timeFormat(this.props.paidThrough, { short: true })} @ {formatDataSize(this.props.storageTotal)}</div>
	    		</div>
	    	</div>) : null}
	    	<div style={{ whiteSpace: 'break-spaces', color: COLORS.secondaryBright, marginBottom: 10 }}>
	    		<Icon name='info circle' />
	    		Storage space on the CDN is pre-paid at a flat rate of <b>{formatCurrency(String(this.props.rateFiat.usd)).formatted} USD per gigabyte per month.</b> Data transfer (aka "bandwidth") is free and unlimited. You can use
	    		the up/down arrows to specify the amount of credit you'd like to add to your account.
	    	</div>
	    	<div style={{
	    		marginBottom: 18
	    	}}>
	      	<div style={{
	      		display: 'flex',
	      		alignItems: 'center',
	      		marginBottom: 32,
	      		fontSize: 12,
	      		fontFamily: 'JetBrains-Mono-Regular'
	      	}}>
	      		<div
	      			style={{
	      				height: 72,
	      				width: 24,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginRight: 14
	      			}}
	      		>
	      			<div>
	      				<div
	      					onMouseOver={() => this.setState({ hover: 'up' })}
	      					onMouseOut={() => this.setState({ hover: '' })}
									onClick={() => this.handleIncrement(1)}
									style={{
										opacity: this.state.hover === 'up' ? 1 : 0.85,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										height: 24,
										width: 24,
										userSelect: 'none'
									}}
	      				>
									<Chevron
										pointing='up'
										dimension={14}
										style={{
											color: '#fff'
										}}
									/>
								</div>
								<div style={{
									color: '#fff',
									alignItems: 'center',
									justifyContent: 'center',
									display: 'flex',
									width: 24,
									height: 24,
									userSelect: 'none'
								}}>
									{this.state.gb_months}
								</div>
								<div
									onMouseOver={() => this.setState({ hover: 'down' })}
									onMouseOut={() => this.setState({ hover: '' })}
									onClick={() => this.handleIncrement(-1)}
									style={{
										opacity: this.state.hover === 'down' ? 1 : 0.85,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										height: 24,
										width: 24,
										userSelect: 'none'
									}}
								>
									<Chevron
										pointing='down'
										dimension={14}
										style={{
											color: '#fff'
										}}
		      				/>
	      				</div>
	      			</div>
	      		</div>
						<div style={{ fontFamily: 'JetBrains-Mono-Regular', fontSize: 12, whitespace: 'nowrap' }}>
							<div style={{ color: COLORS.satelliteGold }}>
								GB MONTHS TO ADD
							</div>
							<div style={{ color: '#fff' }}>
								{formatCurrency(String(costUsd)).formatted} USD (ABOUT {costSats} SATS)
							</div>
							{this.props.storageTotal ? (<div style={{ color: COLORS.secondaryBright, textTransform: 'uppercase' }}>
								ADDS ~ {intervalTime(30 * 86400 * (this.state.gb_months / (this.props.storageTotal / 1000000000)), { round: true })} at current usage
							</div>) : null}
						</div>
	      	</div>
				</div>
			</div>
		);
	};

	renderInvoice = () => {

		if (!this.props.invoice) { return null; }

		const size = this.props.mobile ? this.props.clientWidth - 74 : 380 - 50;

		return (
			<div
				onMouseOver={() => this.setState({ hover: 'qr' })}
				onMouseOut={() => this.setState({ hover: '' })}
				onClick={this.handlePayWithLightningWallet}
				style={{
					border: `1px solid ${this.props.invoice && this.state.hover === 'qr' ? COLORS.satelliteGold : '#fff'}`,
					cursor: this.props.invoice ? 'pointer' : 'default',
					background: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: size,
					width: size,
					marginBottom: 12
				}}
			>
				<QRCode
					value={this.props.invoice}
					fgColor={COLORS.primary}
					size={size - 48}
				/>
			</div>
		);
	};

	renderInvoiceValue = () => {

		const { invoice, mobile } = this.props;

		if (!invoice) { return null; }

		return (
			<CanonicalValue
				style={{
					fontSize: mobile ? 14 : 12,
					alignItems: 'center',
					padding: mobile ? '0px 18px 0px 12px' : 12,
					width: '100%',
					height: 44,
					border: `1px dotted ${COLORS.secondary}`,
					marginBottom: 12,
					marginTop: mobile ? 24 : 0
				}}
				value={invoice}
				disableFocusOnCopy={mobile}
				copiable
			/>
		);
	};

	renderInstructions = () => {

		if (!this.props.invoice) { return null; }

		return (
			<div style={{ fontSize: 13, whiteSpace: 'break-spaces', lineHeight: '18px' }}>
				<Icon name='info circle' />
				Storage credit will be added to your account a few seconds after you pay the
				invoice
			</div>
		);
	};

	render = () => {

		const { clientWidth, clientHeight, mobile, initialized } = this.props;

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
  				fontFamily: 'JetBrains-Mono-Regular',
  				marginBottom: 18,
  				display: 'flex',
  				justifyContent: 'space-between',
  				alignItems: 'center'
  			}}>
					{this.props.invoice ? (
						<span>
							<span style={{ color: COLORS.satelliteGold }}>ADD {this.state.gb_months} GB {this.state.gb_months > 1 ? 'MONTHS' : 'MONTH'}</span>
							<span style={{ color: '#fff', marginLeft: 8 }}>({this.props.amount / 1000} SATS)</span>
						</span>
					) : (
						<span style={{ color: COLORS.satelliteGold, marginRight: 8 }}>
							<Icon name='database' style={{ color: '#fff', marginRight: 8 }} />
							BUY CDN STORAGE
						</span>
					)}
					<X
						onClick={this.handleClose}
						dimension={18}
					/>
				</div>
				{this.renderForm()}
				{mobile ? this.renderInvoiceValue() : null}
				{this.renderInvoice()}
				{mobile ? null : this.renderInvoiceValue()}
				{this.renderInstructions()}
      	{this.props.invoice ? null : (
	      	<Button
	      		label='GET LIGHTNING INVOICE'
	      		onClick={this.handleRequestInvoice}
	      		pending={this.props.awaitingInvoice}
	      		style={{
	      			height: 36,
	      			color: '#fff',
	      			border: `1px solid ${COLORS.satelliteGold}`,
	      			fontFamily: 'JetBrains-Mono-Bold'
	      		}}
	      	/>
      	)}
      </Modal>
		);
	};
}

const mapState = ({ media, app }) => {

	return {
		mobile: app.mobile,
		rateFiat: media.rateFiat,
		exchangeFiat: media.exchangeFiat,
		initialized: media.initialized,
		timeRemaining: media.timeRemaining,
		paidThrough: media.paidThrough,
		storageTotal: media.storageTotal,
		awaitingInvoice: media.awaitingInvoice,
		invoice: media.invoice,
		amount: media.amount
	};
};

export default connect(mapState, { SetAddCreditModalOpen, RequestCredit, GetMedia })(AddCredit);
